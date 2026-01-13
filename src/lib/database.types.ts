export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          avatar_url: string | null
          bio: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      records: {
        Row: {
          id: string
          user_id: string
          type: string
          data: Json
          visibility: 'private' | 'stats_only' | 'public'
          recorded_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          data: Json
          visibility?: 'private' | 'stats_only' | 'public'
          recorded_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          data?: Json
          visibility?: 'private' | 'stats_only' | 'public'
          recorded_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      custom_record_types: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          icon: string
          color: string
          fields: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          icon: string
          color?: string
          fields: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          icon?: string
          color?: string
          fields?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          type: string
          current_streak: number
          longest_streak: number
          last_record_date: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          current_streak?: number
          longest_streak?: number
          last_record_date?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          current_streak?: number
          longest_streak?: number
          last_record_date?: string | null
          updated_at?: string
        }
      }
    }
  }
}
