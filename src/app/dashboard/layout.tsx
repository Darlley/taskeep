"use client";

import React, { useEffect } from "react";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { companyMenuItems } from "@/lib/menu-config";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const menuItems = companyMenuItems();

  return (
    <SidebarProvider>
        <SidebarLeft menuItems={menuItems} />
        <SidebarInset>
            <div className="h-dvh flex flex-col overflow-y-auto">
            {children}
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}