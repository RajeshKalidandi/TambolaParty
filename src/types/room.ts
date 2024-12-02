export interface Room {
  id: string;
  name: string;
  hostRating: number;
  ticketPrice: number;
  prizes: {
    fullHouse: number;
    topLine: number;
    middleLine: number;
    bottomLine: number;
  };
  players: {
    id: string;
    avatar: string;
  }[];
  maxPlayers: number;
  startTime: string;
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