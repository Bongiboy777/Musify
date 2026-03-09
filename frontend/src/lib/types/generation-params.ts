export interface GenerationParams {
  title: string | null;
  seed: number | null;
  fullPrompt: string | null;
  describedPrompt: string;
  fullLyrics: string | null;
  describedLyrics: string | null;
  instrumental: boolean | null;
  guidanceScale: number | null;
  inferStep: number | null;
  audioDuration: number | null;
}
