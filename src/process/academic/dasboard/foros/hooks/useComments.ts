import { useState, useEffect } from "react";
import { config } from "@/config/academic-config";
import type { Comment, CreateCommentData } from "../types";

interface UseCommentsResult {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  addComment: (data: CreateCommentData) => Promise<void>;
  removeComment: (commentId: number) => Promise<void>;
}

export function useComments(token: string | null, threadId: number | null): UseCommentsResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    if (!token) {
      setIsLoading(false);
      setError("No hay token de autenticación");
      return;
    }

    if (!threadId) {
      setIsLoading(false);
      setError("ID de hilo no válido");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
      const url = `${config.tutoringApiUrl}${config.endpoints.comments.listByThread.replace(':threadId', String(threadId))}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener comentarios: ${response.statusText}`);
      }

      const json = await response.json();

      // Normalizar respuesta
      if (Array.isArray(json)) {
        setComments(json);
      } else if (json && Array.isArray(json.data)) {
        setComments(json.data);
      } else {
        setComments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar comentarios");
      setComments([]);
      console.error("Error loading comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (data: CreateCommentData) => {
    if (!token || !threadId) {
      throw new Error("Token o threadId no disponible");
    }

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
      const userData = localStorage.getItem("user");
      const userId = userData ? JSON.parse(userData).id : null;
      
      if (!userId) {
        throw new Error("ID de usuario no disponible");
      }

      const url = `${config.tutoringApiUrl}${config.endpoints.comments.create.replace(':threadId', String(threadId))}?user_id=${userId}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-User-Id": String(userId),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error al crear comentario: ${response.statusText}`);
      }

      await loadComments(); // Recargar comentarios
    } catch (err) {
      console.error("Error adding comment:", err);
      throw err;
    }
  };

  const removeComment = async (commentId: number) => {
    if (!token) {
      throw new Error("Token no disponible");
    }

    try {
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
      const url = `${config.tutoringApiUrl}${config.endpoints.comments.delete.replace(':commentId', String(commentId))}`;
      
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar comentario: ${response.statusText}`);
      }

      await loadComments(); // Recargar comentarios
    } catch (err) {
      console.error("Error removing comment:", err);
      throw err;
    }
  };

  useEffect(() => {
    loadComments();
  }, [token, threadId]);

  return {
    comments,
    isLoading,
    error,
    reload: loadComments,
    addComment,
    removeComment,
  };
}
