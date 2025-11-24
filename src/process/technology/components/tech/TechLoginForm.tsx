"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Shield, LifeBuoy, Server, ShieldCheck, BarChart3, Code,
  ArrowLeft, Loader2, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff
} from "lucide-react";
import type { TechRole } from "@/types/tech-roles";

// Mapeo de iconos
const iconMap: Record<string, any> = {
  Shield, LifeBuoy, Server, ShieldCheck, BarChart3, Code
};

interface TechLoginFormProps {
  role: TechRole;
  onBack: () => void;
}

export function TechLoginForm({ role, onBack }: TechLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const Icon = iconMap[role.icon] || Shield;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      // Simular llamada a API - reducido a 1 segundo
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Aquí iría la lógica real de autenticación
      // const response = await fetch('/api/tech/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, role: role.id })
      // });

      setSuccess(true);
      setLoading(false);

      // Redirigir al dashboard del rol inmediatamente
      setTimeout(() => {
        window.location.href = role.dashboardPath;
      }, 500);

    } catch (err) {
      setError("Error al iniciar sesión. Verifica tus credenciales.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-in fade-in slide-in-from-right duration-500">
      <Card className="shadow-2xl border-2 bg-background/95 backdrop-blur-xl overflow-hidden">
        {/* Header con gradiente y decoración */}
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/8 to-transparent p-10 border-b-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

          <div className="flex items-center gap-6 mb-6">
            <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/25 to-primary/5 flex items-center justify-center ${role.color} shadow-2xl ring-4 ring-primary/20`}>
              <Icon className="h-14 w-14" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <CardTitle className="text-4xl">
                  {role.displayName}
                </CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground leading-relaxed">
                {role.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-mono px-4 py-2 text-sm">
              {role.name}
            </Badge>
            <Badge className="px-4 py-2 text-sm">
              Módulo Tecnológico
            </Badge>
          </div>
        </div>

        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-bold text-foreground">
                Correo Electrónico Institucional
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@incadev.edu.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-14 text-base border-2 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-bold text-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-14 text-base border-2 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-2 text-primary focus:ring-2 focus:ring-primary"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Recordar sesión
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 font-semibold underline-offset-4 hover:underline transition-all"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="text-base">{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-base font-semibold">
                  Inicio de sesión exitoso. Redirigiendo al dashboard...
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full h-16 rounded-xl font-bold text-lg transition-all duration-300 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-primary-foreground shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-6 w-6" />
                  <span>Accediendo...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="h-6 w-6" />
                </>
              )}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={onBack}
              disabled={loading || success}
              className="w-full h-14 rounded-xl font-semibold text-base transition-all duration-300 bg-muted/50 hover:bg-muted text-foreground border-2 border-transparent hover:border-muted-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Cambiar de rol</span>
            </button>
          </form>

          {/* Additional info */}
          <div className="mt-8 pt-8 border-t-2 border-dashed">
            <p className="text-sm text-muted-foreground text-center">
              ¿Problemas para acceder?{" "}
              <button className="text-primary hover:text-primary/80 font-semibold underline-offset-4 hover:underline transition-all">
                Contactar a soporte técnico
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
