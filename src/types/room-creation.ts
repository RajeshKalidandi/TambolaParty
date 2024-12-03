export type RoomType = 'Quick' | 'Standard' | 'Premium' | 'Private';

interface PaymentDetails {
  upiId?: string;
  qrImage?: string;
  isValid?: boolean;
}

export interface RoomFormData {
  name: string;
  type: RoomType;
  startTime: Date;
  maxPlayers: number;
  prizes: {
    fullHouse: number;
    earlyFive: number;
    topLine: number;
    middleLine: number;
    bottomLine: number;
  };
  roomId?: string;
  paymentDetails?: PaymentDetails;
}