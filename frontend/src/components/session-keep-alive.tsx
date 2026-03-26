"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function SessionKeepAlive() {
  useEffect(() => {
    const interval = setInterval(async () => {
      await authClient.getSession();
    }, 240000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
