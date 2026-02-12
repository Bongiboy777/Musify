interface GenerationReturn {
  status: "pending" | "completed" | "failed";
  songId: string;
  s3Location?: string; // This will be present when status is "completed"
  errorMessage?: string; // This will be present when status is "failed"
}