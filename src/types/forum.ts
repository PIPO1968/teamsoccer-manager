export interface ForumCategory {
  id: number;
  name: string;
  description: string | null;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export interface Forum {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  thread_count: number;
  post_count: number;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export interface ForumThread {
  id: number;
  forum_id: number;
  user_id: number;
  title: string;
  is_sticky: boolean;
  is_locked: boolean;
  view_count: number;
  last_post_id: number | null;
  last_post_at: string | null;
  last_post_user_id: number | null;
  created_at: string;
  updated_at: string;
  reply_count?: number;
}

export interface ForumPost {
  id: number;
  thread_id: number;
  user_id: number;
  content: string;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
}
