import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { IconLogout, IconUserCircle, IconHome, IconUsers, IconShield, IconKey, IconSettings, IconTicket, IconServer, IconAlertTriangle, IconFileText, IconCode, IconUser, IconTrendingUp, IconChartBar, IconMessageCircle, IconCalendar, IconTarget, IconMap, IconBuilding } from "@tabler/icons-react";
import { toast } from "sonner";
import { config } from "@/config/technology-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { routes } from "../strategic-site";

interface User {
  id: number
  name: string
  email: string
  avatar?: string | null
  avatar_url?: string | null
  role?: string
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  token?: string | null;
  user?: User | null;
};

export function AppSidebar({ token, user, ...props }: AppSidebarProps) {
  const shownUser = {
    name: user?.name ?? "Invitado",
    email: user?.email ?? "—",
    avatar: user?.avatar ?? `${routes.base}9440461.webp`,
    token: token ?? "token_invalido"
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")

      // Llamar al API para cerrar sesión en el backend
      await fetch(`${config.apiUrl}${config.endpoints.auth.logout}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Limpiar localStorage independientemente de la respuesta
      localStorage.removeItem("token")
      localStorage.removeItem("user")

      toast.success("Sesión cerrada", {
        description: "Has cerrado sesión exitosamente",
      });

      setTimeout(() => {
        window.location.href = routes.general.login;
      }, 1000);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Even if API call fails, clear local session
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = routes.general.login;
    }
  };

  const handleGoToProfile = () => {
    const userRole = user?.role || 'admin';
    const profileRoutes: Record<string, string> = {
      admin: routes.admin.profile,
      planning: routes.planning.profile,
      monitoring: routes.monitoring.profile,
      analysis: routes.analysis.profile,
      coordination: routes.coordination.profile,
      reporting: routes.reporting.profile,
    };
    window.location.href = profileRoutes[userRole] || routes.admin.profile;
  };

  // Obtener el rol del usuario
  const userRole = user?.role || 'admin';

  // Configuración de navegación por rol
  const getRoleNavigation = () => {
  const dashboardRoute = routes.dashboard[userRole as keyof typeof routes.dashboard] || routes.dashboard.index;

  switch (userRole) {
    case 'admin':
      return (
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={dashboardRoute}>
                      <IconHome className="h-4 w-4" />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.admin.management.organizations}>
                      <IconBuilding className="h-4 w-4" />
                      <span>Organizaciones</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.admin.management.agreements}>
                      <IconFileText className="h-4 w-4" />
                      <span>Convenios</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.admin.management.plans}>
                      <IconFileText className="h-4 w-4" />
                      <span>Planes</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.admin.management.calidad}>
                      <IconFileText className="h-4 w-4" />
                      <span>Calidad</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Coordinación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                   
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.coordination.communications}>
                      <IconMessageCircle className="h-4 w-4" />
                      <span>Comunicaciones</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.coordination.collaboration}>
                      <IconUsers className="h-4 w-4" />
                      <span>Colaboración</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </>
      );

    case 'planning':
      return (
        <>
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={dashboardRoute}>
                      <IconHome className="h-4 w-4" />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Planificación Estratégica</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.planning.strategic_plans}>
                      <IconMap className="h-4 w-4" />
                      <span>Planes Estratégicos</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.planning.objectives}>
                      <IconTarget className="h-4 w-4" />
                      <span>Objetivos</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.planning.initiatives}>
                      <IconTrendingUp className="h-4 w-4" />
                      <span>Iniciativas</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.planning.roadmaps}>
                      <IconFileText className="h-4 w-4" />
                      <span>Roadmaps</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      );

    case 'monitoring':
      return (
        <>
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={dashboardRoute}>
                      <IconHome className="h-4 w-4" />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Monitoreo y Seguimiento</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.monitoring.indicators}>
                      <IconChartBar className="h-4 w-4" />
                      <span>Indicadores</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.monitoring.metrics}>
                      <IconTrendingUp className="h-4 w-4" />
                      <span>Métricas</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.monitoring.reports}>
                      <IconFileText className="h-4 w-4" />
                      <span>Reportes</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.monitoring.alerts}>
                      <IconAlertTriangle className="h-4 w-4" />
                      <span>Alertas</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      );

    case 'analysis':
      return (
        <>
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={dashboardRoute}>
                      <IconHome className="h-4 w-4" />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Análisis Estratégico</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.analysis.swot}>
                      <IconChartBar className="h-4 w-4" />
                      <span>Análisis FODA</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.analysis.benchmarking}>
                      <IconTarget className="h-4 w-4" />
                      <span>Benchmarking</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.analysis.risk_analysis}>
                      <IconAlertTriangle className="h-4 w-4" />
                      <span>Análisis de Riesgos</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.analysis.market_research}>
                      <IconFileText className="h-4 w-4" />
                      <span>Investigación de Mercado</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      );

    case 'coordination':
      return (
        <>
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={dashboardRoute}>
                      <IconHome className="h-4 w-4" />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Coordinación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.coordination.meetings}>
                      <IconCalendar className="h-4 w-4" />
                      <span>Reuniones</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.coordination.communications}>
                      <IconMessageCircle className="h-4 w-4" />
                      <span>Comunicaciones</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.coordination.collaboration}>
                      <IconUsers className="h-4 w-4" />
                      <span>Colaboración</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.coordination.calendar}>
                      <IconCalendar className="h-4 w-4" />
                      <span>Calendario</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      );

    case 'reporting':
      return (
        <>
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={dashboardRoute}>
                      <IconHome className="h-4 w-4" />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Reportes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.reporting.executive_reports}>
                      <IconFileText className="h-4 w-4" />
                      <span>Reportes Ejecutivos</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.reporting.progress_reports}>
                      <IconChartBar className="h-4 w-4" />
                      <span>Reportes de Progreso</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.reporting.performance_reports}>
                      <IconTrendingUp className="h-4 w-4" />
                      <span>Reportes de Desempeño</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href={routes.reporting.custom_reports}>
                      <IconSettings className="h-4 w-4" />
                      <span>Reportes Personalizados</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      );

    default:
      return (
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href={dashboardRoute}>
                    <IconHome className="h-4 w-4" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      );
  }
};

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href={routes.dashboard[userRole as keyof typeof routes.dashboard] || routes.dashboard.index} title="Dashboard" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <span><img src="/LOGOTIPO_1024x1024.svg" alt="Logotipo Incadev" title="Logotipo Incadev" /></span>
                </div>
                <span className="text-xl font-bold">INCADEV</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {getRoleNavigation()}
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-lg">
              {user?.avatar_url || user?.avatar ? (
                <AvatarImage
                  src={user.avatar_url || user.avatar || ""}
                  alt={user.name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary rounded-lg">
                {shownUser.name ? shownUser.name.charAt(0).toUpperCase() : <IconUser className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{shownUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{shownUser.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGoToProfile}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              title="Ver perfil"
            >
              <IconUserCircle className="h-4 w-4" />
              <span>Perfil</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Cerrar sesión"
            >
              <IconLogout className="h-4 w-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
