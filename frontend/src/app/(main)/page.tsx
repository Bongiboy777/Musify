

import Link from "next/link";
import { api, HydrateClient } from "@/trpc/server";
import { getSession, router } from "better-auth/api";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {auth} from "@/lib/auth"
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import C from "@/components/c";

export default async function Home() {
  const hello = await api.post.getLatest();
  const session = await auth.api.getSession({
    headers: await headers()
  })
  void api.post.getLatest.prefetch();

  if (!session){
    redirect('auth/sign-in')
  }


  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3 {session.user.id}</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">First Steps →</h3>
              <div className="text-lg">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <C userId={session.user.id} />
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello ? hello.name : "Loading tRPC query..."}
            </p>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
