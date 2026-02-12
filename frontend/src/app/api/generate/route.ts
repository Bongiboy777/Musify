import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client"; // Import our client
import type { GenerationParams } from "@/lib/types/generation-params";
import { db } from "@/server/db";
import { success } from "zod";
export const dynamic = "force-dynamic";

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

        console.log("Inngest response:", res);

        return NextResponse.json({ message: `Music generation event sent! ${song.describedPrompt}`, song: song, success: true });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Failed to send event" },
            { status: 500 }
        );
    }
}