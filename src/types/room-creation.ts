export type RoomType = 'free' | 'paid';

export interface RoomFormData {
  name: string;
  type: RoomType;
  startTime: Date;
  maxPlayers: number;
  ticketPrice: number;
  prizes: {
    fullHouse: number;
    earlyFive: number;
    topLine: number;
    middleLine: number;
    bottomLine: number;
  };
  roomId?: string;
}