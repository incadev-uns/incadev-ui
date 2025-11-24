import { useEffect, useState } from "react";
import { AppSidebar } from "@/process/support/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { GlobalIdleDetector } from "@/components/security/GlobalIdleDetector";
import { SiteHeader } from "@/process/academic/dasboard/components/site-header"

interface SupportLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function SupportLayout({ children, title = "Dashboard: Soporte y Tutorías" }: SupportLayoutProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    setToken(storedToken);
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setMounted(true);
  }, []);

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
