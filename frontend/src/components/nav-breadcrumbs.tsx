'use client'
import React from 'react'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from './ui/breadcrumb'
import { usePathname } from 'next/navigation'

const NavBreadcrumbs = () => {

    
    const path = usePathname();
    const routes = path.split('/')
    routes[0] = 'Home'
  return (
    <Breadcrumb>
  <BreadcrumbList>
    {routes.map((route, index) => (
      <BreadcrumbItem key={index}>
        {index === routes.length - 1 ? (
          <BreadcrumbPage>{route}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink href={`/${routes.slice(1, index + 1).join('/')}`}>{route}</BreadcrumbLink>
        )}
      </BreadcrumbItem>
    ))}
  </BreadcrumbList>
</Breadcrumb>
  )
}

export default NavBreadcrumbs