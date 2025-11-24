"use client"

import * as React from "react"
import {
  Shield,
  Users,
  LifeBuoy,
  Server,
  AlertTriangle,
  BarChart,
  Code,
  Settings,
  ShieldCheck,
  Bot,
} from "lucide-react"

import { NavMain } from "./NavMain"
import { NavUser } from "./NavUser"
import { TeamSwitcher } from "./TeamSwitcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Obtener datos del usuario del localStorage
const getUserData = () => {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Configuración de navegación por rol
const getNavigationByRole = (role: string) => {
  const baseNavigation = {
    admin: [
      {
        title: "Administración",
        url: "#",
        icon: Shield,
        isActive: true,
        items: [
          {
            title: "Dashboard",
            url: "/tecnologico/admin/dashboard",
          },
          {
            title: "Usuarios",
            url: "/tecnologico/admin/usuarios",
          },
          {
            title: "Roles",
            url: "/tecnologico/admin/roles",
          },
          {
            title: "Permisos",
            url: "/tecnologico/admin/permisos",
          },
        ],
      },
      {
        title: "Seguridad",
        url: "#",
        icon: ShieldCheck,
        items: [
          {
            title: "Dashboard Seguridad",
            url: "/tecnologico/admin/seguridad-dashboard",
          },
          {
            title: "Gestión de Sesiones",
            url: "/tecnologico/admin/sesiones",
          },
          {
            title: "Eventos de Seguridad",
            url: "/tecnologico/admin/eventos",
          },
        ],
      },
      {
        title: "Soporte",
        url: "#",
        icon: LifeBuoy,
        items: [
          {
            title: "Mis Tickets",
            url: "/tecnologico/admin/tickets",
          },
          {
            title: "Crear Ticket",
            url: "/tecnologico/admin/crear-ticket",
          },
        ],
      },
      {
        title: "Configuración",
        url: "#",
        icon: Settings,
        items: [
          {
            title: "Perfil",
            url: "/tecnologico/admin/perfil",
          },
        ],
      },
    ],
    support: [
      {
        title: "Soporte",
        url: "#",
        icon: LifeBuoy,
        isActive: true,
        items: [
          {
            title: "Dashboard",
            url: "/tecnologico/support/dashboard",
          },
          {
            title: "Tickets",
            url: "/tecnologico/support/tickets",
          },
        ],
      },
      {
        title: "Configuración",
        url: "#",
        icon: Settings,
        items: [
          {
            title: "Perfil",
            url: "/tecnologico/support/perfil",
          },
        ],
      },
    ],
    infrastructure: [
      {
        title: "Infraestructura",
        url: "#",
        icon: Server,
        isActive: true,
        items: [
          {
            title: "Servidores",
            url: "/tecnologico/infrastructure/servidores",
          },
        ],
      },
      {
        title: "Soporte",
        url: "#",
        icon: LifeBuoy,
        items: [
          {
            title: "Mis Tickets",
            url: "/tecnologico/support/tickets",
          },
          {
            title: "Crear Ticket",
            url: "/tecnologico/support/tickets/crear",
          },
        ],
      },
      {
        title: "Configuración",
        url: "#",
        icon: Settings,
        items: [
          {
            title: "Perfil",
            url: "/tecnologico/infrastructure/perfil",
          },
        ],
      },
    ],
    security: [
      {
        title: "Seguridad",
        url: "#",
        icon: AlertTriangle,
        isActive: true,
        items: [
          {
            title: "Incidentes",
            url: "/tecnologico/security/incidentes",
          },
        ],
      },
      {
        title: "Soporte",
        url: "#",
        icon: LifeBuoy,
        items: [
          {
            title: "Mis Tickets",
            url: "/tecnologico/support/tickets",
          },
          {
            title: "Crear Ticket",
            url: "/tecnologico/support/tickets/crear",
          },
        ],
      },
      {
        title: "Configuración",
        url: "#",
        icon: Settings,
        items: [
          {
            title: "Perfil",
            url: "/tecnologico/security/perfil",
          },
        ],
      },
    ],
    academic_analyst: [
      {
        title: "Análisis Académico",
        url: "#",
        icon: BarChart,
        isActive: true,
        items: [
          {
            title: "Reportes",
            url: "/tecnologico/academic_analyst/reportes",
          },
        ],
      },
      {
        title: "Soporte",
        url: "#",
        icon: LifeBuoy,
        items: [
          {
            title: "Mis Tickets",
            url: "/tecnologico/support/tickets",
          },
          {
            title: "Crear Ticket",
            url: "/tecnologico/support/tickets/crear",
          },
        ],
      },
      {
        title: "Configuración",
        url: "#",
        icon: Settings,
        items: [
          {
            title: "Perfil",
            url: "/tecnologico/academic_analyst/perfil",
          },
        ],
      },
    ],
    web: [
      {
        title: "Desarrollo Web",
        url: "#",
        icon: Code,
        isActive: true,
        items: [
          {
            title: "Dashboard",
            url: "/tecnologico/web/dashboard",
          },
          {
            title: "Noticias",
            url: "/tecnologico/web/noticias",
          },
          {
            title: "Anuncios",
            url: "/tecnologico/web/anuncios",
          },
          {
            title: "Alertas",
            url: "/tecnologico/web/alertas",
          },
          {
            title: "Proyectos",
            url: "/tecnologico/web/proyectos",
          },
        ],
      },
      {
        title: "Chatbot",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Dashboard",
            url: "/tecnologico/web/chatbot/dashboard",
          },
          {
            title: "FAQs",
            url: "/tecnologico/web/chatbot/faqs",
          },
          {
            title: "Configuración",
            url: "/tecnologico/web/chatbot/configuracion",
          },
          {
            title: "Analytics",
            url: "/tecnologico/web/chatbot/analytics",
          },
        ],
      },
      {
        title: "Soporte",
        url: "#",
        icon: LifeBuoy,
        items: [
          {
            title: "Mis Tickets",
            url: "/tecnologico/support/tickets",
          },
          {
            title: "Crear Ticket",
            url: "/tecnologico/support/tickets/crear",
          },
        ],
      },
      {
        title: "Configuración",
        url: "#",
        icon: Settings,
        items: [
          {
            title: "Perfil",
            url: "/tecnologico/web/perfil",
          },
        ],
      },
    ],
  }

  return baseNavigation[role as keyof typeof baseNavigation] || baseNavigation.admin
}

const data = {
  teams: [
    {
      name: "INCADEV Tecnológico",
      logo: Shield,
      plan: "Sistema de Gestión",
    },
  ],
}

export function TechAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = React.useState<any>(null)
  const [navigation, setNavigation] = React.useState<any[]>([])

  React.useEffect(() => {
    const user = getUserData()
    setUserData(user)
    if (user?.role) {
      setNavigation(getNavigationByRole(user.role))
    }
  }, [])

  const user = userData
    ? {
        name: userData.name || "Usuario",
        email: userData.email || "usuario@incadev.com",
        avatar: userData.avatar || (typeof window !== "undefined" ? `${window.location.origin}/tecnologico/9440461.webp` : "/tecnologico/9440461.webp"),
      }
    : {
        name: "Usuario",
        email: "usuario@incadev.com",
        avatar: typeof window !== "undefined" ? `${window.location.origin}/tecnologico/9440461.webp` : "/tecnologico/9440461.webp",
      }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
