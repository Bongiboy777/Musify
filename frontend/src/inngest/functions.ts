import { inngest } from "@/inngest/client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const myInngestFunc = inngest.createFunction(
    {id: "my-inngest-func"},
    {event: "user/signed.up"},
    async ({event, step}) => {
        await step.sleep("wait-a-bit", "2s");
    }
)