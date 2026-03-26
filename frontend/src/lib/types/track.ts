import type { JobStatus } from "generated/prisma";

export default interface track {

    id: string;
    title: string | null;
    userId: string;
    seed: number | null;
    fullPrompt: string | null;
    describedPrompt: string | null;
    fullLyrics: string | null;
    describedLyrics: string | null;
    instrumental: boolean;
    s3_loc: string | null;
    image_s3_loc: string | null;
    guidanceScale: number;
    inferStep: number;
    audioDuration: number;
    listenCount: number;
    createdAt: Date;
    updatedAt: Date;
    jobId: string | null;
    thumbnailUrl: string | null
    playUrl: string | null
    jobStatus: JobStatus | null
}