import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { headers } from "next/headers";
import React from "react";
import { Separator } from "./ui/separator";

const Credits = async ({ credits }: { credits: number }) => {
  return (
    <p className="font-semibold flex-1 flex flex-col justify-center it">
      {credits}
      {/* <Separator className="h-[12px] w-[12px] font-bold"/> */}
      <span className="text-muted-foreground font-light italic">Credits</span>
    </p>
  );
};

export default Credits;
