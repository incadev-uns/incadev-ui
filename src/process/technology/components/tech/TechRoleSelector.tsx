"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Shield, LifeBuoy, Server, ShieldCheck, BarChart3, Code,
  Search, ArrowRight
} from "lucide-react";
import { TECH_ROLES, type TechRole } from "@/types/tech-roles";

// Mapeo de iconos
const iconMap: Record<string, any> = {
  Shield, LifeBuoy, Server, ShieldCheck, BarChart3, Code
};

interface TechRoleSelectorProps {
  onRoleSelect: (role: TechRole) => void;
}

export function TechRoleSelector({ onRoleSelect }: TechRoleSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoles = TECH_ROLES.filter(role =>
    role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
        <h1 className="text-5xl font-bold text-foreground mb-4">
          Selecciona tu Rol
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Módulo Tecnológico - Grupo 03: Soporte y Administración
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-top duration-700 delay-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 pl-12 text-base border-2 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role, index) => {
          const Icon = iconMap[role.icon] || Shield;

          return (
            <Card
              key={role.id}
              onClick={() => onRoleSelect(role)}
              className="group cursor-pointer border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 bg-background/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradiente de fondo */}
              <div className={`absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center ${role.color} shadow-lg ring-4 ring-background group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <Badge variant="secondary" className="font-mono px-3 py-1">
                    {role.name}
                  </Badge>
                </div>

                <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                  {role.displayName}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed mt-2">
                  {role.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  <span className="font-medium">Acceder al rol</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No results */}
      {filteredRoles.length === 0 && (
        <div className="text-center py-16 animate-in fade-in duration-500">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            No se encontraron roles
          </h3>
          <p className="text-muted-foreground">
            Intenta con otro término de búsqueda
          </p>
        </div>
      )}

      {/* Info section */}
      <div className="mt-16 pt-12 border-t-2 border-dashed text-center animate-in fade-in duration-700 delay-300">
        <p className="text-sm text-muted-foreground mb-4">
          ¿No encuentras tu rol o tienes problemas para acceder?
        </p>
        <button className="text-primary hover:text-primary/80 font-semibold underline-offset-4 hover:underline transition-all text-base">
          Contactar a soporte técnico
        </button>
      </div>
    </div>
  );
}
