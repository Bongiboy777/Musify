import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client"; // Import our client

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

// Create a simple async Next.js API route handler
export async function GET() {
  // Send your event payload to Inngest
  const res = await inngest.send({
    name: "test/hello.world",
    data: {
      email: "testUser@example.com",
    },
  });

  console.log("Inngest response:", res);

  return NextResponse.json({ message: "Event sent!\n" + JSON.stringify(res) });
}
