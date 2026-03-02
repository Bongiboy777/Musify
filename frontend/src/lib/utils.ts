import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getRuns(eventId: string) {
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
