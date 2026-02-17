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
  { id: "generate-music", concurrency: { limit: 1 },  },
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
        // Modal class parameters must be passed as query parameters
        const imageModelName = "stabilityai/sdxl-turbo";
        const llmModelName = "Qwen/Qwen2.5-7B-Instruct";
        
        // Build the URL with query parameters for the Modal class
        const url = new URL("https://bongiboy777--musify-backend-musicmodelserver-generat-994822-dev.modal.run");
        url.searchParams.append("image_model_name", imageModelName);
        url.searchParams.append("llm_model_name", llmModelName);
        
        
        // Endpoint method parameters
        const commonParams = {
          prompt: song.describedPrompt || "Vintage retro keys sample", // Add prompt from song
          infer_step: song.inferStep,
          guidance_scale: song.guidanceScale,
          audio_duration: song.audioDuration,
          scheduler_type: "euler",
          music_cloud_dir: song.id, // Use song ID for S3 organization
          img_cloud_dir: song.id,
        }
        
        if (song.instrumental) {
          return {
            endpoint: url.toString(),
            body: {
              lyrics: "[Instrumental]",
              ...commonParams
            }
          }
        }

        return {
          endpoint: url.toString(),
          body: {
            lyrics: song.describedLyrics,
            ...commonParams
          }
        }
      });
      
      const fetchResponse = await step.fetch(
        params.endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Modal-Key": process.env.MODAL_PROXY_KEY!,
            "Modal-Secret": process.env.MODAL_PROXY_SECRET!,
          },
          
          body: JSON.stringify(params.body),
        }
      )
      console.log(`status of response: ${fetchResponse.status}`);

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        throw Error(`Request failed with status ${fetchResponse.status}: ${errorText}`);
      }

      const responseData = await fetchResponse.json();
      console.log("Received response data:", responseData);
      return responseData

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
  