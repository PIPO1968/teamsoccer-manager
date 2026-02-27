
export interface TopPosterData {
  user_id: number;
  username: string;
  post_count: number;
  manager?: {
    country_id: number;
    country: {
      name: string;
    };
  };
}

export interface CommunityNewsItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  views: number;
  is_published: boolean;
  author_id: number;
  author?: {
    username: string;
  };
}
