"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { config } from "@/config/technology-config";
import { getRolesByModule, getModuleById } from "@/config/auth/module-mapping";
import { getRoleRoute } from "@/config/auth/role-routes";
import { RoleSelector } from "./RoleSelector";
import { LoginForm } from "./LoginForm";

interface UniversalLoginProps {
  moduleId: string;
}

export function UniversalLogin({ moduleId }: UniversalLoginProps) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState<any>(null);
  const [code2FA, setCode2FA] = useState<string[]>(["", "", "", "", "", ""]);

  const moduleInfo = getModuleById(moduleId);
  const moduleRoles = getRolesByModule(moduleId);

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) {
          const route = getRoleRoute(user.role);
          window.location.href = route;
        }
      } catch (error) {
        console.error("[UniversalLogin] Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setShowLoginForm(true);
  };

  const handleBackToRoles = () => {
    setShowLoginForm(false);
    setSelectedRole(null);
    setRequires2FA(false);
    setLoginCredentials(null);
  };

  const handle2FACodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code2FA];
    newCode[index] = value;
    setCode2FA(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const onSubmit = async (data: any) => {
    console.log("[UniversalLogin] onSubmit called with data:", data);
    console.log("[UniversalLogin] requires2FA:", requires2FA);
    console.log("[UniversalLogin] loginCredentials:", loginCredentials);

    try {
      if (requires2FA && loginCredentials) {
        // Verificar 2FA
        const code = code2FA.join("");
        if (code.length !== 6) {
          toast.error("Por favor ingresa el código de 6 dígitos");
          return;
        }

        console.log("[UniversalLogin] Sending 2FA verification request");
        const response = await fetch(`${config.apiUrl}${config.endpoints.twoFactor.verifyLogin}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...loginCredentials,
            code,
          }),
        });

        const result = await response.json();
        console.log("[UniversalLogin] 2FA response:", result);

        if (response.ok && result.success) {
          localStorage.setItem("token", result.data.token);
          localStorage.setItem("user", JSON.stringify(result.data.user));

          toast.success("Inicio de sesión exitoso");
          const dashboardRoute = getRoleRoute(data.role);
          console.log("[UniversalLogin] Redirecting to:", dashboardRoute);
          window.location.href = dashboardRoute;
        } else {
          toast.error(result.message || "Código 2FA inválido");
        }
      } else {
        // Login normal
        console.log("[UniversalLogin] Sending login request to:", `${config.apiUrl}${config.endpoints.auth.login}`);
        console.log("[UniversalLogin] Login payload:", { email: data.email, password: "***", role: data.role });

        const response = await fetch(`${config.apiUrl}${config.endpoints.auth.login}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            role: data.role,
          }),
        });

        const result = await response.json();
        console.log("[UniversalLogin] Login response:", result);
        console.log("[UniversalLogin] Response status:", response.status);
        console.log("[UniversalLogin] Response ok:", response.ok);

        // Verificar si requiere 2FA (puede venir con success: false o success: true)
        if (response.ok && (result.requires_2fa || result.data?.requires_2fa)) {
          console.log("[UniversalLogin] 2FA required, showing 2FA form");
          setRequires2FA(true);
          setLoginCredentials({
            email: data.email,
            password: data.password,
            role: data.role,
          });
          toast.info("Por favor ingresa tu código de autenticación de dos factores");
        } else if (response.ok && result.success) {
          // Login exitoso sin 2FA
          console.log("[UniversalLogin] Login successful, saving token and user data");
          localStorage.setItem("token", result.data.token);
          localStorage.setItem("user", JSON.stringify(result.data.user));

          toast.success("Inicio de sesión exitoso");
          const dashboardRoute = getRoleRoute(data.role);
          console.log("[UniversalLogin] Redirecting to:", dashboardRoute);
          window.location.href = dashboardRoute;
        } else {
          console.log("[UniversalLogin] Login failed:", result.message);
          toast.error(result.message || "Error al iniciar sesión");
        }
      }
    } catch (error) {
      console.error("[UniversalLogin] Error:", error);
      toast.error("Error de conexión. Por favor intenta nuevamente.");
    }
  };

  if (!moduleInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Módulo no encontrado</p>
      </div>
    );
  }

  // Show role selector
  if (!showLoginForm) {
    return (
      <RoleSelector
        moduleInfo={moduleInfo}
        roles={moduleRoles}
        onRoleSelect={handleRoleSelect}
      />
    );
  }

  // Show login form
  const selectedRoleData = moduleRoles.find((r) => r.id === selectedRole);

  if (!selectedRoleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Rol no encontrado</p>
      </div>
    );
  }

  return (
    <LoginForm
      moduleInfo={moduleInfo}
      selectedRole={selectedRoleData}
      onBackToRoles={handleBackToRoles}
      onSubmit={onSubmit}
      requires2FA={requires2FA}
      code2FA={code2FA}
      onCode2FAChange={handle2FACodeChange}
    />
  );
}
