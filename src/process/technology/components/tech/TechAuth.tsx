"use client";

import { useState } from "react";
import { TechRoleSelector } from "./TechRoleSelector";
import { TechLoginForm } from "./TechLoginForm";
import { ModeToggle } from "@/components/core/ModeToggle";
import { ArrowLeft } from "lucide-react";
import type { TechRole } from "@/types/tech-roles";

/**
 * Componente principal de autenticación del módulo tecnológico
 * Maneja el flujo de selección de rol y login
 */
export function TechAuth() {
  const [selectedRole, setSelectedRole] = useState<TechRole | null>(null);

  const handleRoleSelect = (role: TechRole) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-500/5 via-background to-purple-500/5">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src="/ISOLOGOTIPO_VERTICAL.svg"
                alt="INCADEV"
                className="h-12 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">INCADEV</h1>
                <p className="text-xs text-muted-foreground">Módulo Tecnológico</p>
              </div>
            </a>

            {/* Controles */}
            <div className="flex items-center gap-4">
              <a
                href="/login-modules"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Volver a módulos</span>
              </a>
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        {!selectedRole ? (
          <TechRoleSelector onRoleSelect={handleRoleSelect} />
        ) : (
          <TechLoginForm role={selectedRole} onBack={handleBack} />
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 INCADEV. Todos los derechos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}
