import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client"; // Import our client
import type { GenerationParams } from "@/lib/types/generation-params";
import { db } from "@/server/db";
import { success } from "zod";
export const dynamic = "force-dynamic";
import { getRuns } from "@/lib/utils";
import { get } from "http";

// Create a simple async Next.js API route handler
export async function POST(request: Request) {
    try {
        const { userId, songParams } = await request.json();
        console.log("Received request body:", { userId, songParams });
        const song = await db.song.create({
            data: {
            title: songParams.title || null,
            userId: userId,
            describedPrompt: songParams.describedPrompt,
            describedLyrics:  songParams.describedLyrics || null,
            audioDuration: songParams.audioDuration || Math.random() * (210 - 30) + 30, // Random duration between 30 and 210 seconds
            inferStep: songParams.inferStep || Math.random() * (0.7 - 0.2) + 0.2,
            guidanceScale: songParams.guidanceScale || Math.random() * (0.7 - 0.2) + 0.2,
            instrumental: songParams.instrumental || false,
    
            
            }
        });

        if (!songParams) {
            return NextResponse.json(
            { error: "songParams are required" },
            { status: 400 }
            );
        }

        const res = await inngest.send({
            name: "user/generate.music",
            user: { user_id: songParams.userId }, // Include user ID for better tracking and processing in Inngest
            data: {
            ...song
            },
        });

        if (!res.ids || res.ids.length === 0) {
            return NextResponse.json(
                { error: "Failed to create music generation event" },
                { status: 500 }
            );
        }
        const eventId = res.ids[0]!;

        console.log("Job Id:", eventId);
        const job = await db.job.create({
            data: {
                id: eventId,
                event: "user/generate.music",
                payload: song,
                status: "QUEUED"
            }
        })

        await db.song.update({
            where: { id: song.id },
            data: { jobId: job.id }
        })

        const songStatus = await db.song.findUnique({
            where: { id: song.id },
            select: { jobId: true }
        })

        console.log(`Song created with ID: ${song.id}, associated Job ID: ${songStatus?.jobId}`);    
      

        return NextResponse.json({ message: `Music generation event sent! ${song.describedPrompt}`, song: song, success: true, eventId: eventId });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Failed to send event" },
            { status: 500 }
        );
    }
}