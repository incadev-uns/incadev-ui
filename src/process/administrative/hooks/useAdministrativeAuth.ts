import { useState, useEffect } from 'react';

export function useAdministrativeAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const authDataStr = getCookie('auth_data');

    if (authDataStr) {
      const authData = JSON.parse(authDataStr);

      localStorage.setItem('token', JSON.stringify(authData.access_token));
      localStorage.setItem('user', JSON.stringify(authData.user));

      // PRIORIDAD 1: user.roles[] del backend
      if (Array.isArray(authData.user?.roles) && authData.user.roles.length > 0) {
        localStorage.setItem('role', authData.user.roles[0].name);
      }
      // PRIORIDAD 2: user.role directo
      else if (authData.user?.role) {
        localStorage.setItem('role', authData.user.role);
      }
      // PRIORIDAD 3: rol enviado desde el login
      else if (authData.role) {
        localStorage.setItem('role', authData.role);
      }
      // Caso final
      else {
        localStorage.setItem('role', 'guest');
      }

      document.cookie = "auth_data=; path=/; max-age=0";
    }

    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    let parsedUser: any = null;

    try {
      parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch {
      parsedUser = null;
    }

    setToken(storedToken ?? null);
    setUser(parsedUser);
    setRole(storedRole ?? "guest");
    setMounted(true);
  }, []);

  const guestUser = {
    name: "Invitado",
    email: "guest@incadev.com",
    role: "guest",
    roles: []
  };

  const finalUser = user ?? guestUser;
  finalUser.role = role;

  return { token, user: finalUser, role, mounted };
}
