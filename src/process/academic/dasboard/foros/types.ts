// Tipos de datos para Foros
export interface Forum {
  id: number;
  name: string;
  description: string;
  image_url?: string | null;
  user_id?: number | null;
  threads_count?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Thread {
  id: number;
  forum_id: number;
  user_id: number;
  title: string;
  body: string;
  image_url?: string | null;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  comments_count?: number;
  votes_count?: number;
  user_vote?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  thread_id: number;
  user_id: number;
  parent_id: number | null;
  body: string;
  attachment_url?: string | null;
  votes_count?: number;
  user_vote?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  replies?: Comment[];
  created_at: string;
  updated_at: string;
}

export interface CreateForumData {
  name: string;
  description: string;
  image_url?: string | null;
}

export interface CreateThreadData {
  title: string;
  content: string;
  image_url?: string | null;
}

export interface CreateCommentData {
  body: string;
  parent_id?: number | null;
  attachment_url?: string | null;
}

export interface VoteData {
  vote: number; // 1 for upvote, -1 for downvote, 0 to remove vote
}
