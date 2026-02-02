import Link from "next/link";
import { api, HydrateClient } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client"; //import the auth client
import image from "next/image";

// const { data, error } = await authClient.signUp.email({
//         email:"bongiluwe777@gmail.com", // user email address
//         password:"wvawnbea3", // user password -> min 8 characters by default
//         name:"bngi", // user display name
//         image:"https://cdn-blog.superprof.com/blog_in/wp-content/uploads/2023/03/image1-7-1060x596.png", // User image URL (optional)
//         callbackURL: "/dashboard" // A URL to redirect to after the user verifies their email (optional)
//     }, {
//         onRequest: (ctx) => {
//             //show loading
//         },
//         onSuccess: (ctx) => {
//           console.log("User signed up successfully:", ctx);
//             //redirect to the dashboard or sign in page
//         },
//         onError: (ctx) => {
//             // display the error message
//             // alert(ctx.error.message);
//         },
// });
export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();


  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
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
            <Button >

            </Button>
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
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
