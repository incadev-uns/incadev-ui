import { useState, useEffect } from "react";
import { config } from "@/config/academic-config";
import type { Thread } from "../types";

interface UseThreadsResult {
  threads: Thread[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function useThreads(token: string | null, forumId: number | null): UseThreadsResult {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = async () => {
    if (!token) {
      setIsLoading(false);
      setError("No hay token de autenticación");
      return;
    }

    if (!forumId) {
      setIsLoading(false);
      setError("ID de foro no válido");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
      const url = `${config.tutoringApiUrl}${config.endpoints.threads.listByForum.replace(':forumId', String(forumId))}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener hilos: ${response.statusText}`);
      }

      const json = await response.json();
      
      // Normalizar respuesta
      if (Array.isArray(json)) {
        setThreads(json);
      } else if (json && Array.isArray(json.data)) {
        setThreads(json.data);
      } else {
        setThreads([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar hilos");
      setThreads([]);
      console.error("Error loading threads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [token, forumId]);

  return {
    threads,
    isLoading,
    error,
    reload: loadThreads,
  };
}
