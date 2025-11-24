import { useState, useEffect } from "react";
import { routes } from "../evaluation-site";

export function userAuditAuth() {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // 1. Obtener valores del localStorage
        const t = window.localStorage.getItem("token");
        const uStr = window.localStorage.getItem("user");
        const r = window.localStorage.getItem("role");

        let parsedUser: any = null;

        // 2. Parsea el usuario
        try {
            parsedUser = uStr ? JSON.parse(uStr) : null;
        } catch {
            parsedUser = null;
        }

        // 3. Extraer rol principal (audit_manager, audit)
        if (
            parsedUser &&
            Array.isArray(parsedUser.roles) &&
            parsedUser.roles.length > 0
        ) {
            const primaryRole = parsedUser.roles[0];
            localStorage.setItem("role", primaryRole);
            setRole(primaryRole);
        } else {
            setRole(r ?? null);
        }

        // 4. Establecer token y user
        setToken(t ?? null);
        setUser(parsedUser);

        // 5. Indicar que ya está montado
        setMounted(true);
    }, []);

    return { token, user, role, mounted };
}
