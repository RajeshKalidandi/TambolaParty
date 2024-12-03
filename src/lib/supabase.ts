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
          payment_details: {
            upiId: string;
            qrImage: string;
          };
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>;
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
    };
  };
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);