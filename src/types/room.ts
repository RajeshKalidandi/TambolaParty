export interface Room {
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
}

export interface RecentRoom {
  id: string;
  code: string;
  name: string;
  hostName: string;
  ticketPrice: number;
  startTime: Date;
  playerCount: number;
}

export interface PopularHost {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  activeRooms: number;
  totalGamesHosted: number;
}