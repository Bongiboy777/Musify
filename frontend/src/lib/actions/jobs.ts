'use server'

import { db } from "@/server/db";

export async function fetchRun(eventId: string) {
  console.log("Fetching runs for event ID:", eventId);
  const response = await fetch(
    `https://api.inngest.com/v1/events/${eventId}/runs`,
    {
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
      },
    },
  );
  const json = await response.json();
  return json.data;
}

export async function getRun(eventId:string){
 const status = await db.job.findUniqueOrThrow({
    where: {id: eventId},
    select: {
      status: true
    }
    
  })
  console.log(`got status from server action: ${status}`)

  return {eventId, status}
}