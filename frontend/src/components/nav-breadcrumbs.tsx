"use client";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "./ui/breadcrumb";
import { usePathname } from "next/navigation";

const NavBreadcrumbs = () => {
  const path = usePathname();
  const routes = path
    .split("/")
    .map((route) => route.trim())
    .filter((route) => route.length > 0);
  routes[0] = "Home";
  routes.forEach((route, index) => {
    console.log(`Route ${index}: ${route}`);
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {routes.map((route, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <BreadcrumbSeparator key={`separator-${index}`} />}
            <BreadcrumbItem>
              {index === routes.length - 1 ? (
                <BreadcrumbPage>{route.toLocaleUpperCase()}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={`/${routes.slice(1, index + 1).join("/")}`}
                >
                  {route.toLocaleUpperCase()}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default NavBreadcrumbs;
