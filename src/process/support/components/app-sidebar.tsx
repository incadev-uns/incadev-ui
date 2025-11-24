import * as React from "react"
import { NavMain } from "@/process/support/components/sidebar/nav-main"
import { NavSecondary } from "@/process/support/components/sidebar/nav-secondary"
import { NavUser } from "@/process/support/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  navSimpleMain, 
  navMainOptions, 
  routes
} from "@/process/support/support-site"

interface User {
  fullname?: string;
  email?: string;
  avatar?: string;
  role?: string | string[];
  roles?: string[];
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  token?: string | null;
  user?: User | null;
};

export function AppSidebar({ token, user, ...props }: AppSidebarProps) {
  const shownUser = {
    name: user?.fullname ?? "Invitado",
    email: user?.email ?? "—",
    avatar: user?.avatar ?? "/ISOLOGOTIPO_VERTICAL.svg",
    token: token ?? ""
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={routes.dashboard.index}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/ISOLOGOTIPO_VERTICAL.svg" alt="ICV" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Soporte
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    Tutorías
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navSimpleMain} />
        <NavSecondary items={navMainOptions} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={shownUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
