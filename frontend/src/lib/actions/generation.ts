'use server'
import { inngest } from "@/inngest/client";
import { db } from "@/server/db";
import { getSession } from "better-auth/api";
import { auth } from "../auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { GenerationParams } from "../types/generation-params";
import { revalidatePath } from "next/cache";

export async function generate(songParams: GenerationParams){
    const session = await auth.api.getSession({
        headers: await headers(),
      });
    
      if (!session) {
        redirect("auth/sign-in");
      }
      const userId = session.user.id
    
      try {
        console.log("Received request body:", { userId, songParams });
        const song = await db.song.create({
          data: {
            title: songParams.title || null,
            userId: userId,
            describedPrompt: songParams.describedPrompt,
            describedLyrics: songParams.describedLyrics,
            audioDuration:songParams.audioDuration,
            inferStep: songParams.inferStep,
            guidanceScale: songParams.guidanceScale,
            instrumental: songParams.instrumental,
          },
        });
    
        if (!songParams) {
          throw TypeError('Song params is null')
        }
    
        const res = await inngest.send({
          name: "user/generate.music",
          user: { user_id: userId }, // Include user ID for better tracking and processing in Inngest
          data: {
            ...song,
          },
        });
    
        if (!res.ids || res.ids.length === 0) {
          throw Error('no id returned from inngest send function')
        }
        const eventId = res.ids[0]!;
    
        console.log("Job Id:", eventId);
        const job = await db.job.create({
          data: {
            id: eventId,
            event: "user/generate.music",
            payload: song,
            status: "QUEUED",
            inngestId: eventId,
          },
        });
    
        await db.song.update({
          where: { id: song.id },
          data: { jobId: job.id },
        });
    
        const songStatus = await db.song.findUnique({
          where: { id: song.id },
          select: { jobId: true },
        });
    
        console.log(
          `Song created with ID: ${song.id}, associated Job ID: ${songStatus?.jobId}`,
        );
        revalidatePath('/create')
    
        return job.id
      } catch (error) {
        console.error("Error:", error);
        throw error
      }
}