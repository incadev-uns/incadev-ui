import { AppSidebar } from "@/process/evaluation/components/app-sidebar"
//Estoy usando el SiteHeader de Procesos Académicos porque es lo mismo, pero si gustan solo copian el componente y lo reemplaza en el import por la nueva ruta
import { SiteHeader } from "@/process/academic/dasboard/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

interface AuditLayoutProps {
    children: React.ReactNode;
    title?: string;
}
import { userAuditAuth } from "@/process/evaluation/hooks/userAuditAuth";
export default function AuditLayout({ children, title = "Dashboard: Jefe de Auditorias" }: AuditLayoutProps) {
    const { token, user, mounted } = userAuditAuth();

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
            <AppSidebar variant="inset" token={token} user={user} />
            <SidebarInset>
                <SiteHeader title={title} />
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}