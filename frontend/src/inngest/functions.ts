import { inngest } from "@/inngest/client";
import { db } from "@/server/db";
import { env } from "node:process";

// This is all we need from api call, the song data, minus s3 locations will have been uploaded, so we use db client to get the information, song status should be queued from frontend
interface GenerateMusicEventData {
  userId: string,
  id: string
}

interface CommonAceStepParams {
  infer_step: number,
  guidance_scale: number,
  guidance_interval: number,
  audio_duration: number
}

enum RequestTypes {
  GenerateFromDescriptionInstrumental,
  GenerateFromDescriptionAutoLyrics,
  GenerateFromDescriptionDescribedyrics,
  FullPromptNoLyrics,
  FullPrompWithLyrics,


}
interface UserParamsRelevantToMusicGeneration {
  userId: string,
  credits: string,
  requestType: RequestTypes
}

/**
* Scenario: user selects options, duration etc. presses button, 
* this sends the song info, minus the s3 locations to db, and status as pending.
* On this side we can determine concurrency, so we handle the decision of endpoint etc here, so that multiple reuquests dont cancel each other out, this inngest function is our queue
* On queue entry, we determine endpoint, get the user credits to check they can do this, and send our request to our backend, which will return the s3 location in response
* 
* So we can define 
* 
*/
export const GenerateMusic = inngest.createFunction(
  { id: "generate-music" },
  { event: "user/generate.music" },
  async ({ event, step }) => {

    try {
      console.log("Received event data:", event.data);
      const e = event.data as GenerateMusicEventData
      const user = await db.user.findUniqueOrThrow({ where: { id: e.userId } })
      const song = await db.song.findUniqueOrThrow({ where: { id: e.id } })
      await step.run("check-credits", async () => {
        if (user.credits < 1) {
          throw Error(`user does not have enough credits, current balance: ${user.credits}`)
        }
      });
      const params = await step.run('get-params', async () => {
        // remember to set described lyrics to ['instrumental'] in db before calling
        const commonParams = {
          infer_step: song.inferStep,
          guidance_scale: song.guidanceScale,
          audio_duration: song.audioDuration,


        }
        if (song.instrumental) {
          return {
            endpoint: env.GENERATE_ENDPOINT_URL,
            body: {
              lyrics: "[Instrumental]",
              ...commonParams
            }
          }
        }

        return {
          endpoint: env.GENERATE_ENDPOINT_URL,
          body: {
            lyrics: song.describedLyrics,
            ...commonParams
          }

        }
      }
      );
      const fetchResponse = await step.fetch(
        params.endpoint!,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params.body),
        }
      )

    }
    catch (e) {
      throw Error(`Error in GenerateMusic function: ${e}`)
    }


  }

)


export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);
  