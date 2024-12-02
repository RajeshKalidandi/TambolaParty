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