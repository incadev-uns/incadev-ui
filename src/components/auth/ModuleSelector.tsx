"use client";

import { useState, useEffect } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Server, ClipboardList, Users, Megaphone, GraduationCap,
  Heart, Calendar, Search, ArrowRight, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODULE_CATEGORIES, type ModuleCategory } from "@/types/module-categories";
import { getRoleRoute, hasConfiguredRoute } from "@/config/auth/role-routes";

// Mapeo de iconos
const iconMap: Record<string, any> = {
  Server, ClipboardList, Users, Megaphone, GraduationCap, Heart, Calendar
};

export function ModuleSelector() {
  const [searchTerm, setSearchTerm] = useState("");

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) {
          // Get route for any role from any module
          const route = getRoleRoute(user.role);

          // Log warning if role is not configured
          if (!hasConfiguredRoute(user.role)) {
            console.warn(`[ModuleSelector] Rol "${user.role}" no tiene ruta configurada. Usando ruta por defecto.`);
          }

          window.location.href = route;
        }
      } catch (error) {
        // If there's an error parsing user data, clear the session
        console.error("[ModuleSelector] Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const filteredCategories = MODULE_CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (category: ModuleCategory) => {
    window.location.href = category.loginPath;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5">
      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-20 lg:pt-32 pb-8 sm:pb-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-in fade-in slide-in-from-top duration-700">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            Selecciona tu Módulo
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Elige el módulo correspondiente a tu área de trabajo para acceder al sistema
          </p>

          {/* Botón volver a inicio */}
          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Volver a Inicio
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 animate-in fade-in slide-in-from-top duration-700 delay-100 px-2">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar módulo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 sm:h-14 pl-10 sm:pl-12 text-sm sm:text-base border-2 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Categories Grid - Diseño rectangular compacto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {filteredCategories.map((category, index) => {
            const Icon = iconMap[category.icon] || Server;

            return (
              <Card
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="group cursor-pointer border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 bg-background/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom duration-500 relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradiente de fondo */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />

                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5">
                  {/* Icono */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center ${category.color} shadow-md ring-2 ring-background group-hover:scale-105 transition-all duration-300 flex-shrink-0`}>
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <CardTitle className="text-base sm:text-lg md:text-xl group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <Badge variant="secondary" className="font-mono px-2 py-0.5 text-[10px] sm:text-xs flex-shrink-0">
                        {category.roleCount} {category.roleCount === 1 ? 'rol' : 'roles'}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs sm:text-sm leading-relaxed line-clamp-1">
                      {category.description}
                    </CardDescription>
                  </div>

                  {/* Flecha */}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* No results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 sm:py-16 animate-in fade-in duration-500 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Search className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              No se encontraron módulos
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Intenta con otro término de búsqueda
            </p>
          </div>
        )}

        {/* Info section */}
        <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t-2 border-dashed text-center animate-in fade-in duration-700 delay-300 px-4">
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            ¿No encuentras tu módulo o tienes problemas para acceder?
          </p>
          <button className="text-primary hover:text-primary/80 font-semibold underline-offset-4 hover:underline transition-all text-sm sm:text-base">
            Contactar a soporte técnico
          </button>
        </div>
      </div>
    </div>
  );
}
