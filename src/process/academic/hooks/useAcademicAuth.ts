import { useState, useEffect } from 'react';

export function useAcademicAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const authDataStr = getCookie('auth_data');
    if (authDataStr) {
      const authData = JSON.parse(authDataStr);
      localStorage.setItem('token', JSON.stringify(authData.token));
      localStorage.setItem('user', JSON.stringify(authData.user));
      localStorage.setItem('role', "student");
      document.cookie = "auth_data=; path=/; max-age=0";
    }
    
    const t = window.localStorage.getItem("token");
    const uStr = window.localStorage.getItem("user");
    const r = window.localStorage.getItem("role");
    
    let parsedUser: any = null;
    try { 
      parsedUser = uStr ? JSON.parse(uStr) : null;
    } catch {
      parsedUser = null;
    }
    if (parsedUser && Array.isArray(parsedUser.roles) && parsedUser.roles.length > 0) {
      localStorage.setItem("role", parsedUser.roles[0]);
    }
    setToken(t ?? null);
    setUser(parsedUser);
    setRole(r ?? null);
    setMounted(true);
  }, []);

  return { token, user, role, mounted };
}