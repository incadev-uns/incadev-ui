import { AppSidebar } from "@/process/administrative/components/app-sidebar";
import { SiteHeader } from "@/process/administrative/components/main-content/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAdministrativeAuth } from "@/process/administrative/hooks/useAdministrativeAuth";

import { adminNavItems } from "@/process/administrative/administrative-site";

interface AdministrativeLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdministrativeLayout({
  children,
  title = "Dashboard: Administrativo",
}: AdministrativeLayoutProps) {
  
  const { token, user, role, mounted } = useAdministrativeAuth();

  if (!mounted) return <></>;

  // =====================================================
  // ROLES DEL USUARIO (string "role" + array "roles")
  // =====================================================
  const arrayRoles =
    user?.roles?.map((r: any) => r.name) ?? [];

  const allUserRoles = [
    role,        // string principal
    ...arrayRoles // roles del backend
  ].filter(Boolean);

  // =====================================================
  // FILTRADO DEL MENÚ
  // =====================================================
  const filteredNavItems = adminNavItems
    .filter((item) => {
      if (item.allowedRoles) {
        return item.allowedRoles.some((allowed) =>
          allUserRoles.includes(allowed)
        );
      }
      return true; // si no tiene restricciones, mostrar
    })
    .map((item) => ({
      ...item,
      items: item.items?.filter((sub) => {
        if (sub.allowedRoles) {
          return sub.allowedRoles.some((allowed) =>
            allUserRoles.includes(allowed)
          );
        }
        return true;
      }),
    }));

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        token={token}
        user={user}
        navItems={filteredNavItems}
      />

      <SidebarInset>
        <SiteHeader title={title} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
