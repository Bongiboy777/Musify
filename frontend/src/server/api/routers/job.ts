import z from "zod";
import { db } from "@/server/db";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const jobRouter = createTRPCRouter({
  jobStatus: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
      });
      return job;
    }),
});
