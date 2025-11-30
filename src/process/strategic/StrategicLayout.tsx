import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTechnologyAuth } from "@/process/technology/hooks/useTechnologyAuth";
import { AppSidebar } from "./components/app-sidebar";
import { SiteHeader } from "./components/site-header";

interface TechnologyLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function StrategicLayout({
  children,
  title = "Dashboard: Procesos Tecnológicos",
}: TechnologyLayoutProps) {
  const { token, user, mounted, loading } = useTechnologyAuth();
  /*
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }
*/
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" token={token} user={user} />
      <SidebarInset>
        <SiteHeader title={title} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
