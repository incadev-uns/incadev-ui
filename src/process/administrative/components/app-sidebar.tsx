"use client";

import * as React from "react";
import { NavMain } from "@/process/administrative/components/sidebar/nav-main";
import { NavProjects } from "@/process/administrative/components/sidebar/nav-projects";
import { NavUser } from "@/process/administrative/components/sidebar/nav-user";
import { TeamSwitcher } from "@/process/administrative/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { GalleryVerticalEnd } from "lucide-react";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navItems: any[];
  user: any;
  token?: string | null;
  projects?: any[];
}

const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  financial_manager: "Gestor Financiero",
  enrollment_manager: "Gestor de Matrículas",
  data_analyst: "Analista de Datos",
  system_viewer: "Visualizador del Sistema",
  human_resources: "Recursos Humanos",
  guest: "Invitado",
};


export function AppSidebar({
  navItems,
  user,
  token,
  projects = [],
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          {/* Logo siempre visible */}
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-accent/20">
            <img
              src="/LOGOTIPO_1024x1024.svg"
              alt="Incadev Logo"
              className="h-7 w-7 object-contain"
            />
          </div>

          {/* Texto solo visible cuando el sidebar NO está colapsado */}
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-base tracking-wide">INCADEV</span>
            <span className="text-[11px] text-muted-foreground uppercase tracking-widest">
              {ROLE_LABELS[user?.role] ?? "INVITADO"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
        {/* <NavProjects projects={projects} /> */}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
