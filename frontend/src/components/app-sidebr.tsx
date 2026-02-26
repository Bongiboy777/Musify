import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "./ui/separator"
import NavLinks from "./nav-links"
import { UserButton } from "@daveyplate/better-auth-ui"
import Credits from "./credits"
import UpgradeButton from "./upgrade-button"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader title="Musify" className="text-2xl flex font-black items-center justify-start  uppercase">
        <h1>Musify</h1>
        <Separator orientation="horizontal" className="my-4" />

      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup >
            <NavLinks />
        </SidebarGroup >
      </SidebarContent>
      <SidebarFooter>
    <SidebarMenu>
      <SidebarMenuItem className="flex flex-row mx-auto items-center gap-4">
         <Credits />
          <UpgradeButton />
      </SidebarMenuItem>
                <Separator orientation="horizontal" className="my-6" />

    <SidebarMenuItem className="flex items-center justify-center ">
      <p className="text-sm text-muted-foreground text-center">© 2023 Musify</p>
    </SidebarMenuItem>
    </SidebarMenu>
  </SidebarFooter>
   

 
    </Sidebar>
  )
}