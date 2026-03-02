"use client";
import React from "react";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { usePathname } from "next/navigation";
import { Home, icons, Map, Music, Piano } from "lucide-react";

const NavLinks = () => {
  const path = usePathname();
  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Map },
    { name: "Create", href: "/create", icon: Piano },
  ];
  return (
    <div>
      {links.map((link) => (
        <SidebarMenuItem
          key={link.name}
          className={`my-2 flex cursor-pointer items-center justify-start`}
        >
          <SidebarMenuButton isActive={path === link.href}>
            <a
              href={link.href}
              className="flex w-full items-center justify-start"
            >
              <link.icon className="mr-4" />
              <span id="nav-link-item" className="">
                {link.name}
              </span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </div>
  );
};

export default NavLinks;
