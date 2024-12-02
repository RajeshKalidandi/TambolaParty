export type RoomType = 'Quick' | 'Standard' | 'Premium' | 'Private';

export interface RoomFormData {
  name: string;
  type: RoomType;
  startTime: Date;
  maxPlayers: number;
  ticketPrice: number;
  multipleTickets: boolean;
  prizes: {
    fullHouse: number;
    earlyFive: number;
    topLine: number;
    middleLine: number;
    bottomLine: number;
  };
}