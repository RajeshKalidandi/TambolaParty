export interface GameState {
  currentNumber: number | null;
  lastNumbers: number[];
  prizes: {
    fullHouse: boolean;
    earlyFive: boolean;
    topLine: boolean;
    middleLine: boolean;
    bottomLine: boolean;
  };
  players: Player[];
  claims: Claim[];
  soundEnabled: boolean;
  autoDaub: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'away' | 'offline';
}

export interface Claim {
  id: string;
  playerName: string;
  prizeType: string;
  timestamp: number;
}

export interface Ticket {
  id: string;
  numbers: (number | null)[][];
  marked: boolean[][];
}

export interface Winner {
  id: string;
  name: string;
  avatar: string;
  prizeType: 'EARLY_FIVE' | 'TOP_LINE' | 'MIDDLE_LINE' | 'BOTTOM_LINE' | 'FULL_HOUSE';
  amount: number;
  timestamp: Date;
}

export interface GameResult {
  gameId: string;
  roomName: string;
  totalPlayers: number;
  totalPrizePool: number;
  winners: Winner[];
  startTime: Date;
  endTime: Date;
  hostName: string;
}