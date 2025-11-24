import { useState, useEffect } from "react";
import { config } from "@/config/support-config";
import type { Forum } from "../types";

interface UseForumsResult {
  forums: Forum[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function useForums(token: string | null): UseForumsResult {
  const [forums, setForums] = useState<Forum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadForums = async () => {
    if (!token) {
      setIsLoading(false);
      setError("No hay token de autenticación");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
      const url = `${config.apiUrl}${config.endpoints.forums.list}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener foros: ${response.statusText}`);
      }

      const json = await response.json();
      
      // Normalizar respuesta del backend
      if (Array.isArray(json)) {
        setForums(json);
      } else if (json && Array.isArray(json.data)) {
        setForums(json.data);
      } else {
        setForums([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar foros");
      setForums([]);
      console.error("Error loading forums:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForums();
  }, [token]);

  return {
    forums,
    isLoading,
    error,
    reload: loadForums,
  };
}
