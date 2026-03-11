export interface GenerationParams {
  title: string;
  seed: number;
  fullPrompt: string | null;
  describedPrompt: string;
  fullLyrics: string | null;
  describedLyrics: string | null;
  instrumental: boolean;
  guidanceScale: number;
  inferStep: number ;
  audioDuration: number;
}
