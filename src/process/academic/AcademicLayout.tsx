import { useEffect, useState } from "react";
import { AppSidebar } from "@/process/academic/components/app-sidebar"
import { SiteHeader } from "@/process/academic/dasboard/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { GlobalIdleDetector } from "@/components/security/GlobalIdleDetector";

interface AcademicLayoutProps {
  children: React.ReactNode;
  title?: string;
}
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";
export default function AcademicLayout({ children, title = "Dashboard: Procesos Académicos" }: AcademicLayoutProps) {
  const { token, user, mounted } = useAcademicAuth();

  if (!mounted) return null;

  return (
    <>
      <GlobalIdleDetector enabled={true} />
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" token={token} user={user}/>
        <SidebarInset>
          <SiteHeader title={title}/>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}