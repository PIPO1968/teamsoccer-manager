export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      avatar_configs: {
        Row: {
          background_color: number
          body_type: number
          body_variation: number
          created_at: string
          eye_color: number
          eye_mood: number
          eye_type: number
          eyebrows: number
          face_tone: number
          face_type: number
          facial_hair: number
          gender: string
          hair_color: number
          hair_type: number
          id: number
          manager_id: number
          mouth_mood: number
          mouth_type: number
          nose_type: number
          shirt_color: number
          show_anniversary_badge: boolean
          updated_at: string
        }
        Insert: {
          background_color?: number
          body_type?: number
          body_variation?: number
          created_at?: string
          eye_color?: number
          eye_mood?: number
          eye_type?: number
          eyebrows?: number
          face_tone?: number
          face_type?: number
          facial_hair?: number
          gender?: string
          hair_color?: number
          hair_type?: number
          id?: number
          manager_id: number
          mouth_mood?: number
          mouth_type?: number
          nose_type?: number
          shirt_color?: number
          show_anniversary_badge?: boolean
          updated_at?: string
        }
        Update: {
          background_color?: number
          body_type?: number
          body_variation?: number
          created_at?: string
          eye_color?: number
          eye_mood?: number
          eye_type?: number
          eyebrows?: number
          face_tone?: number
          face_type?: number
          facial_hair?: number
          gender?: string
          hair_color?: number
          hair_type?: number
          id?: number
          manager_id?: number
          mouth_mood?: number
          mouth_type?: number
          nose_type?: number
          shirt_color?: number
          show_anniversary_badge?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avatar_configs_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: true
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "avatar_configs_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: true
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
        ]
      }
      community_news: {
        Row: {
          author_id: number
          content: string
          created_at: string
          id: number
          is_published: boolean
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id: number
          content: string
          created_at?: string
          id?: number
          is_published?: boolean
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: number
          content?: string
          created_at?: string
          id?: number
          is_published?: boolean
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
        ]
      }
      forum_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          order_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          order_number?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          order_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          edited_at: string | null
          id: number
          is_edited: boolean
          thread_id: number
          user_id: number | null
        }
        Insert: {
          content: string
          created_at?: string
          edited_at?: string | null
          id?: number
          is_edited?: boolean
          thread_id: number
          user_id?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: number
          is_edited?: boolean
          thread_id?: number
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_thread_subscriptions: {
        Row: {
          created_at: string
          id: number
          thread_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          thread_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          thread_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_thread_subscriptions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          created_at: string
          forum_id: number
          id: number
          is_locked: boolean
          is_sticky: boolean
          last_post_at: string | null
          last_post_id: number | null
          last_post_user_id: number | null
          title: string
          updated_at: string
          user_id: number | null
          view_count: number
        }
        Insert: {
          created_at?: string
          forum_id: number
          id?: number
          is_locked?: boolean
          is_sticky?: boolean
          last_post_at?: string | null
          last_post_id?: number | null
          last_post_user_id?: number | null
          title: string
          updated_at?: string
          user_id?: number | null
          view_count?: number
        }
        Update: {
          created_at?: string
          forum_id?: number
          id?: number
          is_locked?: boolean
          is_sticky?: boolean
          last_post_at?: string | null
          last_post_id?: number | null
          last_post_user_id?: number | null
          title?: string
          updated_at?: string
          user_id?: number | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forum_statistics"
            referencedColumns: ["forum_id"]
          },
          {
            foreignKeyName: "forum_threads_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      forums: {
        Row: {
          category_id: number | null
          created_at: string
          description: string | null
          id: number
          name: string
          order_number: number
          thread_count: number
          updated_at: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          name: string
          order_number?: number
          thread_count?: number
          updated_at?: string
        }
        Update: {
          category_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          order_number?: number
          thread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forums_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      group_applications: {
        Row: {
          applicant_id: number
          created_at: string
          group_id: number
          id: number
          message: string | null
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: number
          created_at?: string
          group_id: number
          id?: number
          message?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: number
          created_at?: string
          group_id?: number
          id?: number
          message?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "group_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "group_applications_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_applications_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_with_member_count"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: number
          id: number
          is_active: boolean
          joined_at: string
          manager_id: number
          role: string
        }
        Insert: {
          group_id: number
          id?: number
          is_active?: boolean
          joined_at?: string
          manager_id: number
          role?: string
        }
        Update: {
          group_id?: number
          id?: number
          is_active?: boolean
          joined_at?: string
          manager_id?: number
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups_with_member_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "group_members_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
        ]
      }
      groups: {
        Row: {
          club_logo: string | null
          created_at: string
          description: string | null
          forum_id: number | null
          id: number
          is_active: boolean
          logo_url: string | null
          member_count: number
          name: string
          owner_id: number
          updated_at: string
        }
        Insert: {
          club_logo?: string | null
          created_at?: string
          description?: string | null
          forum_id?: number | null
          id?: number
          is_active?: boolean
          logo_url?: string | null
          member_count?: number
          name: string
          owner_id: number
          updated_at?: string
        }
        Update: {
          club_logo?: string | null
          created_at?: string
          description?: string | null
          forum_id?: number | null
          id?: number
          is_active?: boolean
          logo_url?: string | null
          member_count?: number
          name?: string
          owner_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forum_statistics"
            referencedColumns: ["forum_id"]
          },
          {
            foreignKeyName: "groups_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
        ]
      }
      leagues: {
        Row: {
          league_id: number
          region_id: number
          season: number
        }
        Insert: {
          league_id?: number
          region_id: number
          season: number
        }
        Update: {
          league_id?: number
          region_id?: number
          season?: number
        }
        Relationships: [
          {
            foreignKeyName: "leagues_region_id_fkey1"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "leagues_regions"
            referencedColumns: ["region_id"]
          },
        ]
      }
      leagues_regions: {
        Row: {
          created_at: string
          name: string
          region_id: number
        }
        Insert: {
          created_at?: string
          name: string
          region_id?: number
        }
        Update: {
          created_at?: string
          name?: string
          region_id?: number
        }
        Relationships: []
      }
      leagues_regions_backup: {
        Row: {
          created_at: string | null
          name: string | null
          region_id: number | null
        }
        Insert: {
          created_at?: string | null
          name?: string | null
          region_id?: number | null
        }
        Update: {
          created_at?: string | null
          name?: string | null
          region_id?: number | null
        }
        Relationships: []
      }
      manager_events: {
        Row: {
          created_at: string
          event_description: string
          event_type: string
          id: number
          manager_id: number
        }
        Insert: {
          created_at?: string
          event_description: string
          event_type: string
          id?: number
          manager_id: number
        }
        Update: {
          created_at?: string
          event_description?: string
          event_type?: string
          id?: number
          manager_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_manager_events_manager_id"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_manager_events_manager_id"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
        ]
      }
      managers: {
        Row: {
          country_id: number | null
          created_at: string
          email: string | null
          is_admin: number
          is_online: boolean
          is_premium: number
          last_login: string | null
          last_seen: string | null
          password: string | null
          premium_expires_at: string | null
          status: string | null
          updated_at: string
          user_id: number
          username: string
        }
        Insert: {
          country_id?: number | null
          created_at?: string
          email?: string | null
          is_admin?: number
          is_online?: boolean
          is_premium?: number
          last_login?: string | null
          last_seen?: string | null
          password?: string | null
          premium_expires_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: number
          username: string
        }
        Update: {
          country_id?: number | null
          created_at?: string
          email?: string | null
          is_admin?: number
          is_online?: boolean
          is_premium?: number
          last_login?: string | null
          last_seen?: string | null
          password?: string | null
          premium_expires_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: number
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "managers_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "leagues_regions"
            referencedColumns: ["region_id"]
          },
        ]
      }
      managers_backup: {
        Row: {
          country: string | null
          country_id: number | null
          created_at: string | null
          email: string | null
          is_admin: number | null
          is_premium: number | null
          last_login: string | null
          password: string | null
          premium_expires_at: string | null
          updated_at: string | null
          user_id: number | null
          username: string | null
        }
        Insert: {
          country?: string | null
          country_id?: number | null
          created_at?: string | null
          email?: string | null
          is_admin?: number | null
          is_premium?: number | null
          last_login?: string | null
          password?: string | null
          premium_expires_at?: string | null
          updated_at?: string | null
          user_id?: number | null
          username?: string | null
        }
        Update: {
          country?: string | null
          country_id?: number | null
          created_at?: string | null
          email?: string | null
          is_admin?: number | null
          is_premium?: number | null
          last_login?: string | null
          password?: string | null
          premium_expires_at?: string | null
          updated_at?: string | null
          user_id?: number | null
          username?: string | null
        }
        Relationships: []
      }
      match_chat_messages: {
        Row: {
          created_at: string | null
          id: number
          match_id: number
          message: string
          user_id: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          match_id: number
          message: string
          user_id: number
        }
        Update: {
          created_at?: string | null
          id?: number
          match_id?: number
          message?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_match_chat_messages_match_id"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["match_id_int"]
          },
          {
            foreignKeyName: "fk_match_chat_messages_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_match_chat_messages_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
        ]
      }
      match_lineups: {
        Row: {
          created_at: string
          formation: string
          id: number
          match_id: number
          player_positions: Json
          substitutes: number[]
          team_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          formation: string
          id?: number
          match_id: number
          player_positions: Json
          substitutes: number[]
          team_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          formation?: string
          id?: number
          match_id?: number
          player_positions?: Json
          substitutes?: number[]
          team_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_lineups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["match_id_int"]
          },
          {
            foreignKeyName: "match_lineups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: number
          created_at: string
          home_score: number | null
          home_team_id: number
          is_friendly: boolean
          match_date: string
          match_id_int: number
          series_id: number | null
          status: string
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          away_team_id: number
          created_at?: string
          home_score?: number | null
          home_team_id: number
          is_friendly?: boolean
          match_date: string
          match_id_int?: number
          series_id?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          away_team_id?: number
          created_at?: string
          home_score?: number | null
          home_team_id?: number
          is_friendly?: boolean
          match_date?: string
          match_id_int?: number
          series_id?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["series_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          deleted_by_recipient: boolean
          deleted_by_sender: boolean
          id: number
          read: boolean
          recipient_id: number
          sender_id: number
          subject: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_by_recipient?: boolean
          deleted_by_sender?: boolean
          id?: number
          read?: boolean
          recipient_id: number
          sender_id: number
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_by_recipient?: boolean
          deleted_by_sender?: boolean
          id?: number
          read?: boolean
          recipient_id?: number
          sender_id?: number
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
        ]
      }
      online_players: {
        Row: {
          created_at: string
          id: number
          user_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          user_id: number
        }
        Update: {
          created_at?: string
          id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "online_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "online_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
        ]
      }
      player_training_assignments: {
        Row: {
          created_at: string
          id: number
          player_id: number
          training_intensity: number
          training_type: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          player_id: number
          training_intensity?: number
          training_type?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          player_id?: number
          training_intensity?: number
          training_type?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_training_assignments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      players: {
        Row: {
          age: number
          assists: number
          avatar_background_color: number | null
          avatar_eye_color: number | null
          avatar_eye_style: number | null
          avatar_eyebrows: number | null
          avatar_hair_color: number | null
          avatar_hair_style: number | null
          avatar_mouth_style: number | null
          avatar_seed: string | null
          avatar_shirt_color: number | null
          avatar_skin_tone: number | null
          contract_until: string
          created_at: string
          defense: number
          dribbling: number
          experience: number
          finishing: number
          first_name: string
          fitness: number
          form: string
          goals: number
          heading: number
          last_name: string
          leadership: number
          loyalty: number
          matches_played: number
          minutes_played: number
          nationality_id: number | null
          owned_since: string | null
          pace: number
          passing: number
          personality: number
          player_id: number
          position: string
          rating: number
          stamina: number
          team_id: number | null
          updated_at: string
          value: number
          wage: number
        }
        Insert: {
          age: number
          assists?: number
          avatar_background_color?: number | null
          avatar_eye_color?: number | null
          avatar_eye_style?: number | null
          avatar_eyebrows?: number | null
          avatar_hair_color?: number | null
          avatar_hair_style?: number | null
          avatar_mouth_style?: number | null
          avatar_seed?: string | null
          avatar_shirt_color?: number | null
          avatar_skin_tone?: number | null
          contract_until?: string
          created_at?: string
          defense?: number
          dribbling?: number
          experience?: number
          finishing?: number
          first_name: string
          fitness?: number
          form?: string
          goals?: number
          heading?: number
          last_name: string
          leadership?: number
          loyalty?: number
          matches_played?: number
          minutes_played?: number
          nationality_id?: number | null
          owned_since?: string | null
          pace?: number
          passing?: number
          personality?: number
          player_id?: number
          position: string
          rating?: number
          stamina?: number
          team_id?: number | null
          updated_at?: string
          value?: number
          wage?: number
        }
        Update: {
          age?: number
          assists?: number
          avatar_background_color?: number | null
          avatar_eye_color?: number | null
          avatar_eye_style?: number | null
          avatar_eyebrows?: number | null
          avatar_hair_color?: number | null
          avatar_hair_style?: number | null
          avatar_mouth_style?: number | null
          avatar_seed?: string | null
          avatar_shirt_color?: number | null
          avatar_skin_tone?: number | null
          contract_until?: string
          created_at?: string
          defense?: number
          dribbling?: number
          experience?: number
          finishing?: number
          first_name?: string
          fitness?: number
          form?: string
          goals?: number
          heading?: number
          last_name?: string
          leadership?: number
          loyalty?: number
          matches_played?: number
          minutes_played?: number
          nationality_id?: number | null
          owned_since?: string | null
          pace?: number
          passing?: number
          personality?: number
          player_id?: number
          position?: string
          rating?: number
          stamina?: number
          team_id?: number | null
          updated_at?: string
          value?: number
          wage?: number
        }
        Relationships: [
          {
            foreignKeyName: "players_nationality_id_fkey"
            columns: ["nationality_id"]
            isOneToOne: false
            referencedRelation: "leagues_regions"
            referencedColumns: ["region_id"]
          },
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      players_backup: {
        Row: {
          age: number | null
          assists: number | null
          contract_until: string | null
          created_at: string | null
          defense: number | null
          dribbling: number | null
          experience: number | null
          finishing: number | null
          first_name: string | null
          fitness: number | null
          form: string | null
          goals: number | null
          heading: number | null
          last_name: string | null
          leadership: number | null
          loyalty: number | null
          matches_played: number | null
          minutes_played: number | null
          nationality: string | null
          nationality_id: number | null
          owned_since: string | null
          pace: number | null
          passing: number | null
          personality: number | null
          player_id: number | null
          position: string | null
          rating: number | null
          stamina: number | null
          team_id: number | null
          updated_at: string | null
          value: number | null
          wage: number | null
        }
        Insert: {
          age?: number | null
          assists?: number | null
          contract_until?: string | null
          created_at?: string | null
          defense?: number | null
          dribbling?: number | null
          experience?: number | null
          finishing?: number | null
          first_name?: string | null
          fitness?: number | null
          form?: string | null
          goals?: number | null
          heading?: number | null
          last_name?: string | null
          leadership?: number | null
          loyalty?: number | null
          matches_played?: number | null
          minutes_played?: number | null
          nationality?: string | null
          nationality_id?: number | null
          owned_since?: string | null
          pace?: number | null
          passing?: number | null
          personality?: number | null
          player_id?: number | null
          position?: string | null
          rating?: number | null
          stamina?: number | null
          team_id?: number | null
          updated_at?: string | null
          value?: number | null
          wage?: number | null
        }
        Update: {
          age?: number | null
          assists?: number | null
          contract_until?: string | null
          created_at?: string | null
          defense?: number | null
          dribbling?: number | null
          experience?: number | null
          finishing?: number | null
          first_name?: string | null
          fitness?: number | null
          form?: string | null
          goals?: number | null
          heading?: number | null
          last_name?: string | null
          leadership?: number | null
          loyalty?: number | null
          matches_played?: number | null
          minutes_played?: number | null
          nationality?: string | null
          nationality_id?: number | null
          owned_since?: string | null
          pace?: number | null
          passing?: number | null
          personality?: number | null
          player_id?: number | null
          position?: string | null
          rating?: number | null
          stamina?: number | null
          team_id?: number | null
          updated_at?: string | null
          value?: number | null
          wage?: number | null
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          current_season: number
          current_week: number
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_season?: number
          current_week?: number
          id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_season?: number
          current_week?: number
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      series: {
        Row: {
          created_at: string
          division: number
          division_level: number
          group_number: number
          league_id: number
          parent_series_id: number | null
          season: number
          series_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          division: number
          division_level?: number
          group_number: number
          league_id: number
          parent_series_id?: number | null
          season: number
          series_id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          division?: number
          division_level?: number
          group_number?: number
          league_id?: number
          parent_series_id?: number | null
          season?: number
          series_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_series_league"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["league_id"]
          },
          {
            foreignKeyName: "leagues_parent_series_id_fkey"
            columns: ["parent_series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["series_id"]
          },
        ]
      }
      series_members: {
        Row: {
          created_at: string
          id: number
          series_id: number
          team_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          series_id: number
          team_id: number
        }
        Update: {
          created_at?: string
          id?: number
          series_id?: number
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "series_members_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["series_id"]
          },
          {
            foreignKeyName: "series_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      stadiums: {
        Row: {
          build_date: string | null
          capacity: number | null
          created_at: string | null
          name: string
          stadium_id: number
          team_id: number | null
          updated_at: string | null
        }
        Insert: {
          build_date?: string | null
          capacity?: number | null
          created_at?: string | null
          name: string
          stadium_id?: number
          team_id?: number | null
          updated_at?: string | null
        }
        Update: {
          build_date?: string | null
          capacity?: number | null
          created_at?: string | null
          name?: string
          stadium_id?: number
          team_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stadiums_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      team_challenges: {
        Row: {
          challenged_team_id: number
          challenger_team_id: number
          created_at: string
          id: number
          scheduled_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          challenged_team_id: number
          challenger_team_id: number
          created_at?: string
          id?: number
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          challenged_team_id?: number
          challenger_team_id?: number
          created_at?: string
          id?: number
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_challenges_challenged_team_id_fkey"
            columns: ["challenged_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "team_challenges_challenger_team_id_fkey"
            columns: ["challenger_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      team_finances: {
        Row: {
          cash_balance: number
          commission_income: number
          created_at: string
          id: string
          match_income: number
          new_signings_expenses: number
          other_expenses: number
          other_income: number
          player_sales_income: number
          sponsor_income: number
          stadium_building_expenses: number
          stadium_maintenance_expenses: number
          staff_expenses: number
          team_id: number
          updated_at: string
          wages_expenses: number
          weekly_expenses: number
          weekly_income: number
          youth_expenses: number
        }
        Insert: {
          cash_balance?: number
          commission_income?: number
          created_at?: string
          id?: string
          match_income?: number
          new_signings_expenses?: number
          other_expenses?: number
          other_income?: number
          player_sales_income?: number
          sponsor_income?: number
          stadium_building_expenses?: number
          stadium_maintenance_expenses?: number
          staff_expenses?: number
          team_id: number
          updated_at?: string
          wages_expenses?: number
          weekly_expenses?: number
          weekly_income?: number
          youth_expenses?: number
        }
        Update: {
          cash_balance?: number
          commission_income?: number
          created_at?: string
          id?: string
          match_income?: number
          new_signings_expenses?: number
          other_expenses?: number
          other_income?: number
          player_sales_income?: number
          sponsor_income?: number
          stadium_building_expenses?: number
          stadium_maintenance_expenses?: number
          staff_expenses?: number
          team_id?: number
          updated_at?: string
          wages_expenses?: number
          weekly_expenses?: number
          weekly_income?: number
          youth_expenses?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_finances_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      team_followers: {
        Row: {
          followed_at: string
          follower_id: number
          id: number
          team_id: number
        }
        Insert: {
          followed_at?: string
          follower_id: number
          id?: number
          team_id: number
        }
        Update: {
          followed_at?: string
          follower_id?: number
          id?: number
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_followers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      team_guestbook: {
        Row: {
          author_id: number
          created_at: string
          id: number
          message: string
          team_id: number
        }
        Insert: {
          author_id: number
          created_at?: string
          id?: number
          message: string
          team_id: number
        }
        Update: {
          author_id?: number
          created_at?: string
          id?: number
          message?: string
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_guestbook_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_guestbook_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_guestbook_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      team_series_stats: {
        Row: {
          created_at: string
          drawn: number
          form: string[] | null
          goals_against: number
          goals_for: number
          id: number
          lost: number
          played: number
          points: number
          season: number
          series_id: number
          team_id: number
          updated_at: string
          won: number
        }
        Insert: {
          created_at?: string
          drawn?: number
          form?: string[] | null
          goals_against?: number
          goals_for?: number
          id?: number
          lost?: number
          played?: number
          points?: number
          season: number
          series_id: number
          team_id: number
          updated_at?: string
          won?: number
        }
        Update: {
          created_at?: string
          drawn?: number
          form?: string[] | null
          goals_against?: number
          goals_for?: number
          id?: number
          lost?: number
          played?: number
          points?: number
          season?: number
          series_id?: number
          team_id?: number
          updated_at?: string
          won?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_series_stats_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["series_id"]
          },
          {
            foreignKeyName: "team_series_stats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      team_trophies: {
        Row: {
          earned_at: string
          id: number
          season: number
          team_id: number
          trophy_id: number
        }
        Insert: {
          earned_at?: string
          id?: number
          season: number
          team_id: number
          trophy_id: number
        }
        Update: {
          earned_at?: string
          id?: number
          season?: number
          team_id?: number
          trophy_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_trophies_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "team_trophies_trophy_id_fkey"
            columns: ["trophy_id"]
            isOneToOne: false
            referencedRelation: "trophies"
            referencedColumns: ["trophy_id"]
          },
        ]
      }
      team_visits: {
        Row: {
          id: number
          team_id: number
          visited_at: string
          visitor_id: number
        }
        Insert: {
          id?: number
          team_id: number
          visited_at?: string
          visitor_id: number
        }
        Update: {
          id?: number
          team_id?: number
          visited_at?: string
          visitor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_visits_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "team_visits_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_visits_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
        ]
      }
      teams: {
        Row: {
          club_logo: string | null
          country_id: number | null
          created_at: string
          fan_count: number | null
          is_bot: number
          manager_id: number | null
          name: string
          team_id: number
          team_morale: number | null
          team_rating: number | null
          team_spirit: string | null
          updated_at: string
        }
        Insert: {
          club_logo?: string | null
          country_id?: number | null
          created_at?: string
          fan_count?: number | null
          is_bot?: number
          manager_id?: number | null
          name: string
          team_id?: number
          team_morale?: number | null
          team_rating?: number | null
          team_spirit?: string | null
          updated_at?: string
        }
        Update: {
          club_logo?: string | null
          country_id?: number | null
          created_at?: string
          fan_count?: number | null
          is_bot?: number
          manager_id?: number | null
          name?: string
          team_id?: number
          team_morale?: number | null
          team_rating?: number | null
          team_spirit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "leagues_regions"
            referencedColumns: ["region_id"]
          },
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
        ]
      }
      teams_backup: {
        Row: {
          club_logo: string | null
          country: string | null
          country_id: number | null
          created_at: string | null
          fan_count: number | null
          is_bot: number | null
          manager_id: number | null
          manager_name: string | null
          name: string | null
          team_id: number | null
          team_morale: number | null
          team_rating: number | null
          team_spirit: string | null
          updated_at: string | null
        }
        Insert: {
          club_logo?: string | null
          country?: string | null
          country_id?: number | null
          created_at?: string | null
          fan_count?: number | null
          is_bot?: number | null
          manager_id?: number | null
          manager_name?: string | null
          name?: string | null
          team_id?: number | null
          team_morale?: number | null
          team_rating?: number | null
          team_spirit?: string | null
          updated_at?: string | null
        }
        Update: {
          club_logo?: string | null
          country?: string | null
          country_id?: number | null
          created_at?: string | null
          fan_count?: number | null
          is_bot?: number | null
          manager_id?: number | null
          manager_name?: string | null
          name?: string | null
          team_id?: number | null
          team_morale?: number | null
          team_rating?: number | null
          team_spirit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transfer_bids: {
        Row: {
          bid_amount: number
          bidder_team_id: number
          created_at: string
          id: number
          status: string
          transfer_listing_id: number | null
          updated_at: string
        }
        Insert: {
          bid_amount: number
          bidder_team_id: number
          created_at?: string
          id?: number
          status?: string
          transfer_listing_id?: number | null
          updated_at?: string
        }
        Update: {
          bid_amount?: number
          bidder_team_id?: number
          created_at?: string
          id?: number
          status?: string
          transfer_listing_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_bids_new_bidder_team_id_fkey"
            columns: ["bidder_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "transfer_bids_new_transfer_listing_id_fkey"
            columns: ["transfer_listing_id"]
            isOneToOne: false
            referencedRelation: "active_transfer_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_bids_new_transfer_listing_id_fkey"
            columns: ["transfer_listing_id"]
            isOneToOne: false
            referencedRelation: "transfer_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_listings: {
        Row: {
          asking_price: number
          bids: number
          created_at: string
          deadline: string
          hotlists: number
          id: number
          is_active: boolean
          player_id: number
          seller_team_id: number | null
          views: number
        }
        Insert: {
          asking_price: number
          bids?: number
          created_at?: string
          deadline?: string
          hotlists?: number
          id?: number
          is_active?: boolean
          player_id: number
          seller_team_id?: number | null
          views?: number
        }
        Update: {
          asking_price?: number
          bids?: number
          created_at?: string
          deadline?: string
          hotlists?: number
          id?: number
          is_active?: boolean
          player_id?: number
          seller_team_id?: number | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "transfer_listings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "transfer_listings_seller_team_id_fkey"
            columns: ["seller_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      trophies: {
        Row: {
          created_at: string
          description: string
          icon: number
          league_id: number | null
          name: string
          trophy_color: string
          trophy_id: number
        }
        Insert: {
          created_at?: string
          description: string
          icon?: number
          league_id?: number | null
          name: string
          trophy_color?: string
          trophy_id?: number
        }
        Update: {
          created_at?: string
          description?: string
          icon?: number
          league_id?: number | null
          name?: string
          trophy_color?: string
          trophy_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "trophies_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["series_id"]
          },
        ]
      }
    }
    Views: {
      active_transfer_listings: {
        Row: {
          asking_price: number | null
          bids: number | null
          created_at: string | null
          deadline: string | null
          hotlists: number | null
          id: number | null
          is_active: boolean | null
          player_id: number | null
          seller_team_id: number | null
          views: number | null
        }
        Insert: {
          asking_price?: number | null
          bids?: number | null
          created_at?: string | null
          deadline?: string | null
          hotlists?: number | null
          id?: number | null
          is_active?: boolean | null
          player_id?: number | null
          seller_team_id?: number | null
          views?: number | null
        }
        Update: {
          asking_price?: number | null
          bids?: number | null
          created_at?: string | null
          deadline?: string | null
          hotlists?: number | null
          id?: number | null
          is_active?: boolean | null
          player_id?: number | null
          seller_team_id?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_listings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "transfer_listings_seller_team_id_fkey"
            columns: ["seller_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      forum_statistics: {
        Row: {
          forum_id: number | null
          thread_count: number | null
        }
        Relationships: []
      }
      groups_with_member_count: {
        Row: {
          accurate_member_count: number | null
          club_logo: string | null
          created_at: string | null
          description: string | null
          forum_id: number | null
          id: number | null
          is_active: boolean | null
          logo_url: string | null
          member_count: number | null
          name: string | null
          owner_id: number | null
          updated_at: string | null
        }
        Insert: {
          accurate_member_count?: never
          club_logo?: string | null
          created_at?: string | null
          description?: string | null
          forum_id?: number | null
          id?: number | null
          is_active?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name?: string | null
          owner_id?: number | null
          updated_at?: string | null
        }
        Update: {
          accurate_member_count?: never
          club_logo?: string | null
          created_at?: string | null
          description?: string | null
          forum_id?: number | null
          id?: number | null
          is_active?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name?: string | null
          owner_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forum_statistics"
            referencedColumns: ["forum_id"]
          },
          {
            foreignKeyName: "groups_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "top_forum_posters"
            referencedColumns: ["user_id"]
          },
        ]
      }
      top_forum_posters: {
        Row: {
          post_count: number | null
          user_id: number | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_team_to_league: {
        Args: { p_team_id: number; p_country: string }
        Returns: number
      }
      authenticate_manager: {
        Args: { email_input: string; password_input: string }
        Returns: Json
      }
      create_initial_team_players: {
        Args: {
          p_team_id: number
          p_country: string
          p_number_of_players?: number
        }
        Returns: undefined
      }
      create_new_manager: {
        Args:
          | {
              p_username: string
              p_email: string
              p_password: string
              p_country?: string
            }
          | {
              p_username: string
              p_email: string
              p_password: string
              p_country?: string
              p_team_name?: string
              p_agreed_to_terms?: boolean
            }
        Returns: {
          user_id: number
          team_id: number
          series_id: number
        }[]
      }
      decrement: {
        Args: { amount: number }
        Returns: number
      }
      delete_message: {
        Args: { p_message_id: number; p_manager_id: number }
        Returns: boolean
      }
      force_deactivate_listing: {
        Args: { listing_id: number }
        Returns: undefined
      }
      get_group_member_count: {
        Args: { p_group_id: number }
        Returns: number
      }
      get_latest_guestbook_entry: {
        Args: { p_team_id: number }
        Returns: {
          id: number
          author_id: number
          author_name: string
          message: string
          created_at: string
        }[]
      }
      get_league_standings: {
        Args: { p_series_id: number }
        Returns: {
          team_id: number
          team_name: string
          team_logo: string
          played: number
          won: number
          drawn: number
          lost: number
          goals_for: number
          goals_against: number
          goal_difference: number
          points: number
          form: string[]
          is_bot: number
        }[]
      }
      get_manager_messages: {
        Args: { p_manager_id: number }
        Returns: {
          id: number
          sender_id: number
          recipient_id: number
          sender_name: string
          recipient_name: string
          subject: string
          content: string
          created_at: string
          read: boolean
        }[]
      }
      get_manager_online_status: {
        Args: { manager_id: number }
        Returns: {
          is_online: boolean
          last_seen: string
        }[]
      }
      get_manager_recent_events: {
        Args: { p_manager_id: number }
        Returns: {
          event_type: string
          event_description: string
          created_at: string
        }[]
      }
      get_match_highlights: {
        Args: { p_match_id: number }
        Returns: {
          minute: number
          event_type: string
          player_name: string
          team: string
          description: string
        }[]
      }
      get_team_follower_count: {
        Args: { p_team_id: number }
        Returns: number
      }
      get_team_followers: {
        Args: { p_team_id: number }
        Returns: {
          follower_id: number
          follower_name: string
          followed_at: string
        }[]
      }
      get_team_guestbook_entries: {
        Args: { p_team_id: number }
        Returns: {
          id: number
          author_id: number
          author_name: string
          message: string
          created_at: string
        }[]
      }
      get_team_league_position: {
        Args: { p_team_id: number }
        Returns: {
          team_position: number
          total_teams: number
        }[]
      }
      get_team_matches: {
        Args: { p_team_id: number }
        Returns: {
          match_id: number
          home_team_id: number
          away_team_id: number
          home_team_name: string
          away_team_name: string
          home_score: number
          away_score: number
          match_date: string
          status: string
          is_home: boolean
          competition: string
          result: string
        }[]
      }
      get_team_recent_visitors: {
        Args: { p_team_id: number }
        Returns: {
          visitor_id: number
          visitor_username: string
          visited_at: string
        }[]
      }
      get_unread_message_count: {
        Args: { p_manager_id: number }
        Returns: number
      }
      increment: {
        Args: { amount: number }
        Returns: number
      }
      is_following_team: {
        Args: { p_team_id: number; p_follower_id: number }
        Returns: boolean
      }
      is_group_member: {
        Args: { p_group_id: number; p_manager_id: number }
        Returns: boolean
      }
      manager_owns_group: {
        Args: { manager_id: number }
        Returns: boolean
      }
      mark_message_as_read: {
        Args: { p_message_id: number; p_manager_id: number }
        Returns: boolean
      }
      process_expired_transfer_listings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      record_team_visit: {
        Args: { p_team_id: number; p_visitor_id: number }
        Returns: undefined
      }
      toggle_team_follow: {
        Args: { p_team_id: number; p_follower_id: number }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
