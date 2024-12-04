export type RoomType = 'Quick' | 'Standard' | 'Premium' | 'Private';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  start_time: string;
  max_players: number;
  host_id: string;
  room_code: string;
  share_link: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  ticket_price: number;
  multiple_tickets_allowed: boolean;
  prizes: {
    full_house: number;
    early_five: number;
    top_line: number;
    middle_line: number;
    bottom_line: number;
  };
}

export interface Player {
  id: string;
  name: string;
  email: string;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  player_id: string;
  tickets: string[];
  claims: {
    full_house?: boolean;
    early_five?: boolean;
    top_line?: boolean;
    middle_line?: boolean;
    bottom_line?: boolean;
  };
  joined_at: string;
}

export interface Ticket {
  id: string;
  room_id: string;
  player_id: string;
  numbers: number[][];
  created_at: string;
}

export interface Transaction {
  id: string;
  player_id: string;
  room_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'prize' | 'ticket_purchase';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface PaymentVerification {
  id: string;
  transaction_id: string;
  upi_id: string;
  reference_id: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  created_at: string;
}

export interface PaymentQRCode {
  id: string;
  room_id: string;
  host_id: string;
  qr_image_url: string;
  upi_id: string;
  created_at: string;
  updated_at: string;
}
