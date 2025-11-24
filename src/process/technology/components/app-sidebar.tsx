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
import { routes } from "@/process/technology/technology-site";
import { IconLogout, IconUserCircle, IconHome, IconUsers, IconShield, IconKey, IconSettings, IconTicket, IconServer, IconAlertTriangle, IconFileText, IconCode, IconUser, IconLock, IconDeviceDesktop, IconActivity, IconAdjustments } from "@tabler/icons-react";
import { toast } from "sonner";
import { config } from "@/config/technology-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
        window.location.href = "/";
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
      support: routes.support.profile,
      infrastructure: routes.infrastructure.profile,
      security: routes.security.profile,
      academic_analyst: routes.academic_analyst.profile,
      web: routes.web.profile,
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
                      <a href={routes.admin.users}>
                        <IconUsers className="h-4 w-4" />
                        <span>Usuarios</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.admin.roles}>
                        <IconShield className="h-4 w-4" />
                        <span>Roles</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.admin.permissions}>
                        <IconKey className="h-4 w-4" />
                        <span>Permisos</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Seguridad</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.admin.security.dashboard}>
                        <IconShield className="h-4 w-4" />
                        <span>Dashboard Seguridad</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.admin.security.blocks}>
                        <IconLock className="h-4 w-4" />
                        <span>Usuarios Bloqueados</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.admin.security.sessions}>
                        <IconDeviceDesktop className="h-4 w-4" />
                        <span>Gestión de Sesiones</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.admin.security.events}>
                        <IconActivity className="h-4 w-4" />
                        <span>Eventos de Seguridad</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.admin.security.settings}>
                        <IconAdjustments className="h-4 w-4" />
                        <span>Configuración Seguridad</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Soporte</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.admin.support.tickets}>
                        <IconTicket className="h-4 w-4" />
                        <span>Mis Tickets</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.admin.support.createTicket}>
                        <IconFileText className="h-4 w-4" />
                        <span>Crear Ticket</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Configuración</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.admin.profile}>
                        <IconSettings className="h-4 w-4" />
                        <span>Perfil</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        );

      case 'support':
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
              <SidebarGroupLabel>Soporte Técnico</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.support.tickets}>
                        <IconTicket className="h-4 w-4" />
                        <span>Tickets</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        );

      case 'infrastructure':
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
              <SidebarGroupLabel>Infraestructura</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.infrastructure.servers}>
                        <IconServer className="h-4 w-4" />
                        <span>Servidores</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.infrastructure.assets}>
                        <IconServer className="h-4 w-4" />
                        <span>Activos Tecnológicos</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.infrastructure.licenses}>
                        <IconServer className="h-4 w-4" />
                        <span>Gestión de Licencias</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        );

      case 'security':
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
              <SidebarGroupLabel>Gestión de Seguridad</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.security.blocks}>
                        <IconLock className="h-4 w-4" />
                        <span>Usuarios Bloqueados</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.security.sessions}>
                        <IconDeviceDesktop className="h-4 w-4" />
                        <span>Gestión de Sesiones</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.security.events}>
                        <IconActivity className="h-4 w-4" />
                        <span>Eventos de Seguridad</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.security.incidents}>
                        <IconAlertTriangle className="h-4 w-4" />
                        <span>Incidentes</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Configuración</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.security.settings}>
                        <IconAdjustments className="h-4 w-4" />
                        <span>Configuración Seguridad</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.security.profile}>
                        <IconSettings className="h-4 w-4" />
                        <span>Perfil</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        );

      case 'academic_analyst':
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
              <SidebarGroupLabel>Análisis Académico</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.academic_analyst.reports}>
                        <IconFileText className="h-4 w-4" />
                        <span>Reportes</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        );

      case 'web':
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
              <SidebarGroupLabel>Desarrollo Web</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={routes.web.projects}>
                        <IconCode className="h-4 w-4" />
                        <span>Proyectos</span>
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
                  <span><img src="/LOGOTIPO_1024x1024.svg" alt="Logotipo Incadev" title="Logotipo Incadev"/></span>
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
                  src={(user.avatar_url || user.avatar) ?? undefined}
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
