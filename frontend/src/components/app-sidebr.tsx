import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import NavLinks from "./nav-links";
import { UserButton } from "@daveyplate/better-auth-ui";
import Credits from "./credits";
import UpgradeButton from "./upgrade-button";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { headers } from "next/headers";
import { User } from "lucide-react";
export async function AppSidebar() {
  const authHeaders = await headers();
  const session = await auth.api.getSession({
    headers: authHeaders,
  });

  const credits = session
    ? await db.user.findUnique({
        where: {
          id: session!.user.id,
        },
        select: {
          credits: true,
        },
      })
    : null;

  return (
    <Sidebar>
      <SidebarHeader
        title="Musify"
        className="flex items-center justify-start text-2xl font-black uppercase"
      >
        <h1>Musify</h1>
        <Separator orientation="horizontal" className="my-4" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <NavLinks />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="mx-auto flex w-full flex-row items-center gap-4 px-4">
            {credits && <Credits credits={credits.credits} />}
            <UpgradeButton />
          </SidebarMenuItem>
          <Separator orientation="horizontal" className="my-2" />

          <SidebarMenuItem className="flex w-full flex-row items-center">
            <UserButton
              className="flex-1"
              variant={"outline"}
              additionalLinks={[
                { label: "User portal", icon: <User />, href: "/profile" },
              ]}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
