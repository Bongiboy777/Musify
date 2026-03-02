import Link from "next/link";
import { api, HydrateClient } from "@/trpc/server";
import { getSession, router } from "better-auth/api";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import C from "@/components/c";
import { db } from "@/server/db";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("auth/sign-in");
  }

  setInterval(async () => {
    await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
    });
  }, 240000);

  return (
    <HydrateClient>
      <main className="flex min-h-screen w-full flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex w-full flex-col items-center justify-center gap-12 px-4 py-16 text-center">
          <h1 className="text-8xl font-black">
            Welcome home{" "}
            <span className="text-[hsl(280,61%,66%)]">
              {session && session.user ? session.user.name : "Guest"}
            </span>
            .
          </h1>
        </div>
      </main>
    </HydrateClient>
  );
}
