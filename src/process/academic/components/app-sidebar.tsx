import * as React from "react"
import { NavMain } from "@/process/academic/components/sidebar/nav-main"
import { NavSecondary } from "@/process/academic/components/sidebar/nav-secondary"
import { NavUser } from "@/process/academic/components/sidebar/nav-user"
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
  navMainCollapse, 
  navSimpleMain, 
  navMainOptions, 
} from "@/process/academic/academic-site"
import {routes} from "@/process/academic/academic-site";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";

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
  const [searchTerm, setSearchTerm] = React.useState('')
  const { role } = useAcademicAuth();

  const filterItemsByRole = (items: any[]) => {
    if (!role) return items;
    
    return items.filter(item => {
      if (!item.allowedRoles) return true;
      
      return item.allowedRoles.includes(role);
    });
  };

  const shownUser = {
    name: user?.fullname ?? "Invitado",
    email: user?.email ?? "—",
    avatar: user?.avatar ?? `${routes.base}9440461.webp`,
    token: token ?? "token_invalido"
  };

  const filteredNavSimpleMain = filterItemsByRole(navSimpleMain);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href={routes.dashboard.index} title="Dashboard" className="flex items-center space-x-2">
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
        <NavMain items={navMainCollapse} searchTerm={searchTerm} />
        
        <NavSecondary items={filteredNavSimpleMain}/>
        
        <NavSecondary 
          items={navMainOptions} 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          className="mt-auto" 
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={shownUser} />
      </SidebarFooter>
    </Sidebar>
  )
}