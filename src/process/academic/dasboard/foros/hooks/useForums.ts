import { useState, useEffect } from "react";
import { config } from "@/config/support-config";
import type { Forum, CreateForumData } from "../types";

interface UseForumsResult {
  forums: Forum[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  createForum: (data: CreateForumData, userId: number) => Promise<Forum>;
  updateForum: (forumId: number, data: Partial<CreateForumData>) => Promise<Forum>;
  deleteForum: (forumId: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useForums(token: string | null): UseForumsResult {
  const [forums, setForums] = useState<Forum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const createForum = async (data: CreateForumData, userId: number): Promise<Forum> => {
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    try {
      setIsCreating(true);
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
      const url = `${config.apiUrl}${config.endpoints.forums.create}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          image_url: data.image_url || null,
          user_id: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al crear foro: ${response.statusText}`);
      }

      const json = await response.json();
      const newForum = json.data || json;

      // Agregar el nuevo foro a la lista
      setForums(prev => [newForum, ...prev]);

      return newForum;
    } catch (err) {
      console.error("Error creating forum:", err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const updateForum = async (forumId: number, data: Partial<CreateForumData>): Promise<Forum> => {
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    try {
      setIsUpdating(true);
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
      const url = `${config.apiUrl}${config.endpoints.forums.update.replace(':forumId', String(forumId))}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          image_url: data.image_url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al actualizar foro: ${response.statusText}`);
      }

      const json = await response.json();
      const updatedForum = json.data || json;

      // Actualizar el foro en la lista
      setForums(prev => prev.map(f => f.id === forumId ? updatedForum : f));

      return updatedForum;
    } catch (err) {
      console.error("Error updating forum:", err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteForum = async (forumId: number): Promise<void> => {
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    try {
      setIsDeleting(true);
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
      const url = `${config.apiUrl}${config.endpoints.forums.delete.replace(':forumId', String(forumId))}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Accept": "application/json",
        },
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al eliminar foro: ${response.statusText}`);
      }

      // Eliminar el foro de la lista
      setForums(prev => prev.filter(f => f.id !== forumId));
    } catch (err) {
      console.error("Error deleting forum:", err);
      throw err;
    } finally {
      setIsDeleting(false);
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
    createForum,
    updateForum,
    deleteForum,
    isCreating,
    isUpdating,
    isDeleting,
  };
}
