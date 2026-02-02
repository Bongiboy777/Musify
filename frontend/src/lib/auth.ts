import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { db } from "@/server/db";

export const auth = betterAuth({
    emailAndPassword:{
        enabled:true,
        requireEmailVerification:true,
        autoSignIn:false

        
    },
    database: prismaAdapter(db, {
        provider: "postgresql", // or "mysql", 
        // "postgresql", ...etc
        debugLogs: process.env.NODE_ENV === "development",
        transaction:false,
        usePlural:false
    }),
});