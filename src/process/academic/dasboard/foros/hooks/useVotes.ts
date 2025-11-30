import { useState, useCallback } from "react";
import { config } from "@/config/support-config";
import type { VoteData } from "../types";

interface UseVotesResult {
  isVoting: boolean;
  voteThread: (threadId: number, vote: number) => Promise<void>;
  voteComment: (commentId: number, vote: number) => Promise<void>;
}

export function useVotes(token: string | null): UseVotesResult {
  const [isVoting, setIsVoting] = useState(false);

  const voteThread = useCallback(async (threadId: number, vote: number) => {
    if (!token) {
      throw new Error("Token no disponible");
    }

    try {
      setIsVoting(true);
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
      const userData = localStorage.getItem("user");
      const userId = userData ? JSON.parse(userData).id : null;
      
      if (!userId) {
        throw new Error("ID de usuario no disponible");
      }

      const url = `${config.apiUrl}${config.endpoints.votes.voteThread.replace(':threadId', String(threadId))}?user_id=${userId}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-User-Id": String(userId),
        },
        body: JSON.stringify({ value: vote }),
      });

      if (!response.ok) {
        throw new Error(`Error al votar hilo: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error voting thread:", err);
      throw err;
    } finally {
      setIsVoting(false);
    }
  }, [token]);

  const voteComment = useCallback(async (commentId: number, vote: number) => {
    if (!token) {
      throw new Error("Token no disponible");
    }

    try {
      setIsVoting(true);
      const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
      const userData = localStorage.getItem("user");
      const userId = userData ? JSON.parse(userData).id : null;
      
      if (!userId) {
        throw new Error("ID de usuario no disponible");
      }

      const url = `${config.apiUrl}${config.endpoints.votes.voteComment.replace(':commentId', String(commentId))}?user_id=${userId}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-User-Id": String(userId),
        },
        body: JSON.stringify({ value: vote }),
      });

      if (!response.ok) {
        throw new Error(`Error al votar comentario: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Error voting comment:", err);
      throw err;
    } finally {
      setIsVoting(false);
    }
  }, [token]);

  return {
    isVoting,
    voteThread,
    voteComment,
  };
}
