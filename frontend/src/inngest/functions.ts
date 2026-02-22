import { inngest } from "@/inngest/client";
import { db } from "@/server/db";
import { JobStatus } from "../../generated/prisma";

interface GenerateEventData {
  userId: string,
  id: string,
  jobId: string
}

enum RequestTypes {
  GenerateFromDescriptionInstrumental,
  GenerateFromDescriptionAutoLyrics,
  GenerateFromDescriptionDescribedLyrics,
  FullPromptNoLyrics,
  FullPromptWithLyrics,
}

const MODAL_HEADERS = {
  "Content-Type": "application/json",
  "Modal-Key": process.env.MODAL_PROXY_KEY!,
  "Modal-Secret": process.env.MODAL_PROXY_SECRET!,
};

/**
 * Scenario: user selects options, duration etc. presses button,
 * this sends the song info, minus the s3 locations to db, and status as pending.
 * On this side we can determine concurrency, so we handle the decision of endpoint etc here,
 * so that multiple requests don't cancel each other out - this inngest function is our queue.
 *
 * Steps:
 * 1. Check credits
 * 2. Format music prompt (LLM)
 * 3. Format lyrics (LLM) — skipped if instrumental
 * 4. Generate categories (LLM)
 * 5. Generate album image (Diffusion) — all above run in parallel where possible
 * 6. Generate music + upload to S3 (ACEStep)
 * 7. Update song record with S3 paths and generated data
 */
export const GenerateMusic = inngest.createFunction(
  { id: "generate-music", concurrency: { limit: 1 } },
  { event: "user/generate.music" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");

    const e = { userId: event.data.userId, id: event.data.id, jobId: event.id } as GenerateEventData;

    const user = await db.user.findUniqueOrThrow({ where: { id: e.userId } });
    const song = await db.song.findUniqueOrThrow({ where: { id: e.id } });
    const job = await db.job.findUniqueOrThrow({ where: { id: e.jobId } });
    const jobPayload = job.payload as object;

    try {
      console.log("GenerateMusic: Received event data:", event.data);

      // --- PREPARATION ---
      await db.job.update({ where: { id: e.jobId }, data: { status: JobStatus.PREPARATION } });

      await step.run("check-credits", async () => {
        if (user.credits < 1) {
          throw Error(`User does not have enough credits, current balance: ${user.credits}`);
        }
      });

      const rawPrompt = song.describedPrompt ?? "Vintage retro keys sample";
      const rawLyrics = song.describedLyrics ?? "[Instrumental]";
      const isInstrumental = song.instrumental;
      const cloudDir = song.id;

      // Build class-level URL params (required by Modal parametrized class)
      const classParams = new URLSearchParams({
        image_model_name: "stabilityai/sdxl-turbo",
        llm_model_name: "Qwen/Qwen2.5-7B-Instruct",
      }).toString();

      // --- STEP 2: FORMAT PROMPT ---
      await db.job.update({ where: { id: e.jobId }, data: { status: JobStatus.FORMATTING_PROMPT } });

      const formattedPrompt = await step.run("format-music-prompt", async () => {
        const url = new URL(`${process.env.MODAL_ENDPOINT_FORMAT_MUSIC_PROMPT}`);
        url.search = new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(classParams)), prompt: rawPrompt }).toString();
        const res = await fetch(url.toString(), { method: "POST", headers: MODAL_HEADERS, body: "{}" });
        if (!res.ok) throw Error(`format_music_prompt failed: ${await res.text()}`);
        return res.json() as Promise<string>;
      });

      console.log("GenerateMusic: Prompt formatted, length:", formattedPrompt.length);

      // --- STEP 3: FORMAT LYRICS (skip if instrumental) ---
      let formattedLyrics = "[Instrumental]";
      if (!isInstrumental) {
        await db.job.update({ where: { id: e.jobId }, data: { status: JobStatus.FORMATTING_LYRICS } });

        formattedLyrics = await step.run("format-lyrics", async () => {
          const url = new URL(`${process.env.MODAL_ENDPOINT_FORMAT_LYRICS}`);
          url.search = new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(classParams)), lyrics: rawLyrics }).toString();
          const res = await fetch(url.toString(), { method: "POST", headers: MODAL_HEADERS, body: "{}" });
          if (!res.ok) throw Error(`format_lyrics failed: ${await res.text()}`);
          return res.json() as Promise<string>;
        });

        console.log("GenerateMusic: Lyrics formatted, length:", formattedLyrics.length);
      }

      // --- STEPS 4 & 5: GENERATE CATEGORIES + ALBUM IMAGE (parallel) ---
      await db.job.update({ where: { id: e.jobId }, data: { status: JobStatus.GENERATING_CATEGORIES } });

      const categories = await step.run("generate-categories", async () => {
        const url = new URL(`${process.env.MODAL_ENDPOINT_GENERATE_CATEGORIES}`);
        url.search = new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(classParams)), prompt: rawPrompt }).toString();
        const res = await fetch(url.toString(), { method: "POST", headers: MODAL_HEADERS, body: "{}" });
        if (!res.ok) throw Error(`generate_categories_from_prompt failed: ${await res.text()}`);
        return res.json() as Promise<string[]>;
      });

      console.log("GenerateMusic: Categories generated:", categories);

      await db.job.update({ where: { id: e.jobId }, data: { status: JobStatus.GENERATING_IMAGE } });

      const imgS3Path = await step.run("generate-album-image", async () => {
        const url = new URL(`${process.env.MODAL_ENDPOINT_GENERATE_ALBUM_IMAGE}`);
        url.search = new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(classParams)), prompt: rawPrompt, img_cloud_dir: cloudDir }).toString();
        const res = await fetch(url.toString(), { method: "POST", headers: MODAL_HEADERS, body: "{}" });
        if (!res.ok) throw Error(`generate_album_image failed: ${await res.text()}`);
        return res.json() as Promise<string>;
      });

      console.log("GenerateMusic: Album image generated at:", imgS3Path);

      // --- STEP 6: GENERATE MUSIC + UPLOAD TO S3 ---
      await db.job.update({ where: { id: e.jobId }, data: { status: JobStatus.GENERATING_MUSIC } });

      const musicResponse = await step.fetch(
        (() => {
          const url = new URL(`${process.env.MODAL_ENDPOINT_GENERATE_AND_POST_S3}`);
          const params = new URLSearchParams({
            ...Object.fromEntries(new URLSearchParams(classParams)),
            formatted_prompt: formattedPrompt,
            formatted_lyrics: formattedLyrics,
            img_s3_path: imgS3Path,
            audio_duration: String(Math.round(song.audioDuration)),
            infer_step: String(Math.round(song.inferStep)),
            guidance_scale: String(Math.round(song.guidanceScale)),
            scheduler_type: "euler",
            music_cloud_dir: cloudDir,
          });
          // FastAPI expects repeated query params for list fields
          categories.forEach(cat => params.append("categories", cat));
          url.search = params.toString();
          return url.toString();
        })(),
        { method: "POST", headers: MODAL_HEADERS }
      );

      if (!musicResponse.ok) {
        const errorText = await musicResponse.text();
        throw Error(`generateAndPostToS3 failed (${musicResponse.status}): ${errorText}`);
      }

      const responseData = await musicResponse.json() as {
        fullPrompt: string;
        fullLyrics: string;
        s3_audio_path: string;
        s3_image_path: string;
        categories: string[];
      };

      console.log("GenerateMusic: Music generation complete:", responseData);

      // --- STEP 7: UPDATE SONG AND JOB ---
      await step.run("update-song-and-job", async () => {
        await db.song.update({
          where: { id: e.id },
          data: {
            fullPrompt: responseData.fullPrompt,
            fullLyrics: responseData.fullLyrics,
            s3_loc: responseData.s3_audio_path,
            image_s3_loc: responseData.s3_image_path,
          },
        });

        // Upsert categories and link to song
        for (const categoryTitle of responseData.categories) {
          const category = await db.category.upsert({
            where: { title: categoryTitle },
            update: {},
            create: { id: crypto.randomUUID(), title: categoryTitle },
          });
          await db.song.update({
            where: { id: e.id },
            data: { categories: { connect: { id: category.id } } },
          });
        }

        // Deduct credit from user
        await db.user.update({
          where: { id: e.userId },
          data: { credits: { decrement: 1 } },
        });
      });

      // Mark job COMPLETED outside step.run so it always persists after the step succeeds
      await db.job.update({
        where: { id: e.jobId },
        data: { status: JobStatus.COMPLETED },
      });

      return responseData;

    } catch (err) {
      await db.job.update({
        where: { id: e.jobId },
        data: {
          status: JobStatus.FAILED,
          payload: {
            ...(jobPayload ?? {}),
            error: (err as Error).message,
          },
        },
      });

      throw Error(`Error in GenerateMusic: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
);

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);
  