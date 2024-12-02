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