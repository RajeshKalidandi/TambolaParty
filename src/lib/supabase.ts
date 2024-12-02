import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          name: string;
          host_id: string;
          ticket_price: number;
          max_players: number;
          start_time: string;
          status: 'waiting' | 'in_progress' | 'completed';
          prizes: {
            fullHouse: number;
            topLine: number;
            middleLine: number;
            bottomLine: number;
          };
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>;
      };
      players: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          rating: number;
          wallet_balance: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['players']['Insert']>;
      };
      tickets: {
        Row: {
          id: string;
          room_id: string;
          player_id: string;
          numbers: number[][];
          claims: {
            full_house: boolean;
            top_line: boolean;
            middle_line: boolean;
            bottom_line: boolean;
          };
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>;
      };
      game_numbers: {
        Row: {
          room_id: string;
          number: number;
          called_at: string;
        };
        Insert: Omit<Database['public']['Tables']['game_numbers']['Row'], 'called_at'>;
        Update: Partial<Database['public']['Tables']['game_numbers']['Insert']>;
      };
    };
  };
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);