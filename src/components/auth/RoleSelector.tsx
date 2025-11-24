"use client";

import * as TablerIcons from "@tabler/icons-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types/roles";
import type { ModuleCategory } from "@/types/module-categories";

const {
  IconShieldCheck,
  IconLifebuoy,
  IconServer,
  IconShield,
  IconChartBar,
  IconCode,
  IconClipboardList,
  IconUserCheck,
  IconSearch,
  IconUsers,
  IconDollarSign,
  IconEye,
  IconUserPlus,
  IconTrendingUp,
  IconMegaphone,
  IconPresentation,
  IconGraduationCap,
  IconBookOpen,
  IconHeart,
  IconFileText,
  IconCalendar,
  IconCalendarCheck,
  IconRepeat,
  IconHome,
  IconLayoutGrid,
} = TablerIcons;

// Icon mapping
const iconMap: Record<string, any> = {
  Shield: IconShieldCheck,
  LifeBuoy: IconLifebuoy,
  Server: IconServer,
  ShieldCheck: IconShieldCheck,
  BarChart3: IconChartBar,
  Code: IconCode,
  ClipboardList: IconClipboardList,
  UserCheck: IconUserCheck,
  Search: IconSearch,
  Users: IconUsers,
  DollarSign: IconDollarSign,
  Eye: IconEye,
  UserPlus: IconUserPlus,
  TrendingUp: IconTrendingUp,
  Megaphone: IconMegaphone,
  Presentation: IconPresentation,
  GraduationCap: IconGraduationCap,
  BookOpen: IconBookOpen,
  Heart: IconHeart,
  FileText: IconFileText,
  Calendar: IconCalendar,
  CalendarCheck: IconCalendarCheck,
  Repeat: IconRepeat,
};

interface RoleSelectorProps {
  moduleInfo: ModuleCategory;
  roles: Role[];
  onRoleSelect: (roleId: string) => void;
}

export function RoleSelector({ moduleInfo, roles, onRoleSelect }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-20 lg:pt-32 pb-8 sm:pb-12">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br ${moduleInfo.gradient}`}>
              <IconShieldCheck className="h-9 w-9 sm:h-11 sm:w-11 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 px-4">{moduleInfo.name}</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-4">
            Selecciona tu rol para iniciar sesión
          </p>

          {/* Botones de navegación */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="gap-2"
            >
              <IconHome className="h-4 w-4" />
              Inicio
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/auth'}
              className="gap-2"
            >
              <IconLayoutGrid className="h-4 w-4" />
              Módulos
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
          {roles.map((role, index) => {
            const Icon = iconMap[role.icon] || IconShieldCheck;

            return (
              <Card
                key={role.id}
                onClick={() => onRoleSelect(role.id)}
                className="group cursor-pointer border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 sm:hover:-translate-y-2 bg-background/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${moduleInfo.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6 relative z-10">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${moduleInfo.gradient} flex items-center justify-center ${moduleInfo.color} mb-3 sm:mb-4 shadow-lg ring-2 sm:ring-4 ring-background group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl transition-colors">{role.displayName}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed mt-1.5 sm:mt-2">
                    {role.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
