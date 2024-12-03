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
            earlyFive: number;
          };
          payment_details: {
            upiId: string;
            qrImage: string;
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
          avatar_url: string;
          wallet_balance: number;
          games_played: number;
          games_won: number;
          rating: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['players']['Row']>;
      };
      payment_verifications: {
        Row: {
          id: string;
          room_id: string;
          player_id: string;
          player_name: string;
          amount: number;
          screenshot: string;
          transaction_id?: string;
          status: 'PENDING' | 'VERIFIED' | 'REJECTED';
          timestamp: string;
          verified_at?: string;
          host_note?: string;
        };
        Insert: Omit<Database['public']['Tables']['payment_verifications']['Row'], 'id' | 'timestamp'>;
        Update: Partial<Database['public']['Tables']['payment_verifications']['Row']>;
      };
      host_activities: {
        Row: {
          id: string;
          host_id: string;
          type: 'game' | 'withdrawal' | 'feedback';
          title: string;
          description: string;
          amount: number;
          status: 'completed' | 'pending' | 'cancelled';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['host_activities']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['host_activities']['Row']>;
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
            early_five: boolean;
          };
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tickets']['Row']>;
      };
    };
  };
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
