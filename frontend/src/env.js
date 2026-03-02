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
    GENERATE_ENDPOINT_URL: z
      .string()
      .url("GENERATE_ENDPOINT_URL must be a valid URL"),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
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
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    MODAL_PROXY_SECRET: process.env.MODAL_PROXY_SECRET,
    MODAL_PROXY_KEY: process.env.MODAL_PROXY_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,
    GENERATE_ENDPOINT_URL: process.env.GENERATE_ENDPOINT_URL,
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
