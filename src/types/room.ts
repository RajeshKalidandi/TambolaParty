export type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export type GameType = 'free' | 'paid' | 'tournament';

export interface Room {
  id: string;
  name: string;
  code: string;
  host_id: string;
  type: GameType;
  status: GameStatus;
  start_time: string;
  max_players: number;
  ticket_price: number;
  prizes: {
    fullHouse: number;
    earlyFive: number;
    topLine: number;
    middleLine: number;
    bottomLine: number;
  };
  requires_payment: boolean;
  created_at: string;
}

export interface RecentRoom {
  id: string;
  code: string;
  name: string;
  hostName: string;
  ticketPrice: number;
  startTime: Date;
  playerCount: number;
  type: GameType;
}

export interface PopularHost {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  activeRooms: number;
  totalGamesHosted: number;
}

export interface Player {
  id: string;
  nickname: string;
  ticket_number?: string;
  wins?: GameWin[];
  payment_verified?: boolean;
  payment_verified_at?: string;
  payment_verified_by?: string;
}

export interface GameWin {
  id: string;
  game_id: string;
  room_name: string;
  prize_type: 'full_house' | 'top_line' | 'middle_line' | 'bottom_line' | 'early_five';
  prize_amount: number;
  timestamp: string;
}