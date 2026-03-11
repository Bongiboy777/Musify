import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    AWS_ACCESS_KEY_ID: z.string().min(1, "AWS_ACCESS_KEY_ID is required"),
    AWS_SECRET_ACCESS_KEY: z
      .string()
      .min(1, "AWS_SECRET_ACCESS_KEY is required"),
    MODAL_PROXY_SECRET: z.string().min(1, "MODAL_SECRET is required"),
    MODAL_PROXY_KEY: z.string().min(1, "MODAL_KEY is required"),
    S3_BUCKET_NAME: z.string().min(1, "S3_BUCKET_NAME is required"),
    AWS_REGION: z.string().min(1, "AWS_REGION is required"),
    MODAL_ENDPOINT_FORMAT_LYRICS: z
      .string()
      .url("MODAL_ENDPOINT_FORMAT_LYRICS must be a valid URL"),
    MODAL_ENDPOINT_FORMAT_MUSIC_PROMPT: z
      .string()
      .url("MODAL_ENDPOINT_FORMAT_MUSIC_PROMPT must be a valid URL"),
    MODAL_ENDPOINT_FORMAT_IMG_PROMPT: z
      .string()
      .url("MODAL_ENDPOINT_FORMAT_IMG_PROMPT must be a valid URL"),
    MODAL_ENDPOINT_GENERATE_ALBUM_IMAGE: z
      .string()
      .url("MODAL_ENDPOINT_GENERATE_ALBUM_IMAGE must be a valid URL"),
    MODAL_ENDPOINT_GENERATE_CATEGORIES: z
      .string()
      .url("MODAL_ENDPOINT_GENERATE_CATEGORIES must be a valid URL"),
    MODAL_ENDPOINT_GENERATE_AND_POST_S3: z
      .string()
      .url("MODAL_ENDPOINT_GENERATE_AND_POST_S3 must be a valid URL"),
    MODAL_ENDPOINT_TEST: z
      .string()
      .url("MODAL_ENDPOINT_TEST must be a valid URL"),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    INNGEST_SIGNING_KEY: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    MODAL_PROXY_SECRET: process.env.MODAL_PROXY_SECRET,
    MODAL_PROXY_KEY: process.env.MODAL_PROXY_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,
    MODAL_ENDPOINT_FORMAT_LYRICS: process.env.MODAL_ENDPOINT_FORMAT_LYRICS,
    MODAL_ENDPOINT_FORMAT_MUSIC_PROMPT: process.env.MODAL_ENDPOINT_FORMAT_MUSIC_PROMPT,
    MODAL_ENDPOINT_FORMAT_IMG_PROMPT: process.env.MODAL_ENDPOINT_FORMAT_IMG_PROMPT,
    MODAL_ENDPOINT_GENERATE_ALBUM_IMAGE: process.env.MODAL_ENDPOINT_GENERATE_ALBUM_IMAGE,
    MODAL_ENDPOINT_GENERATE_CATEGORIES: process.env.MODAL_ENDPOINT_GENERATE_CATEGORIES,
    MODAL_ENDPOINT_GENERATE_AND_POST_S3: process.env.MODAL_ENDPOINT_GENERATE_AND_POST_S3,
    MODAL_ENDPOINT_TEST: process.env.MODAL_ENDPOINT_TEST,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,

    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
