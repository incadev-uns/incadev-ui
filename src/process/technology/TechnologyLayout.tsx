import { useEffect, useState } from "react";
import { AppSidebar } from "@/process/technology/components/app-sidebar"
import { SiteHeader } from "@/process/technology/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useTechnologyAuth } from "@/process/technology/hooks/useTechnologyAuth";
import { GlobalIdleDetector } from "@/components/security/GlobalIdleDetector";

interface TechnologyLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function TechnologyLayout({ children, title = "Dashboard: Procesos Tecnológicos" }: TechnologyLayoutProps) {
  const { token, user, mounted, loading } = useTechnologyAuth();

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted"></div>
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
