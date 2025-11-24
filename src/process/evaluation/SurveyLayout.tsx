import { AppSidebar } from "@/process/evaluation/components/app-sidebar"
//Estoy usando el SiteHeader de Procesos Académicos porque es lo mismo, pero si gustan solo copian el componente y lo reemplaza en el import por la nueva ruta
import { SiteHeader } from "@/process/academic/dasboard/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface SurveyLayoutProps {
  children: React.ReactNode;
  title?: string;
}
import { useSurveyAuth } from "@/process/evaluation/hooks/useSurveyAuth";
export default function SurveyLayout({ children, title = "Dashboard: Administrador de Encuestas" }: SurveyLayoutProps) {
  const { token, user, mounted } = useSurveyAuth();
  
  if (!mounted) return null;

  return (
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
  )
}