'use client'
import React from 'react'
import { SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
import { usePathname } from 'next/navigation';
import { Home, icons, Map, Music, Piano } from 'lucide-react';

const NavLinks = () => {
  const path = usePathname();
  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "My Music", href: "/my-music", icon: Music },
    { name: "Explore", href: "/explore", icon: Map },
    { name: "Create", href: "/profile", icon: Piano },
  ];
  return (
    <div>
      {links.map((link) => (
        <SidebarMenuItem key={link.name} className={`cursor-pointer my-2 flex items-center justify-start`}>
          <SidebarMenuButton isActive={path === link.href}>
            <a href={link.href} className='flex items-center justify-start w-full'>
              <link.icon className='mr-4' />
              <span id="nav-link-item" className=''>{link.name}</span> 
            </a>
          </SidebarMenuButton>

        </SidebarMenuItem>
      ))}
    </div>
  )
}

export default NavLinks