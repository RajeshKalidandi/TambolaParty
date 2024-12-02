export interface PlayerProfile {
    id: string;
    name: string;
    username: string;
    profilePicture: string;
    gamesPlayed: number;
    winningPercentage: number;
    walletBalance: number;
    statistics: {
      totalWinnings: number;
      favoriteHosts: Array<{
        id: string;
        name: string;
        gamesPlayed: number;
      }>;
      luckyNumbers: number[];
    };
    transactions: Array<{
      id: string;
      type: 'DEPOSIT' | 'WITHDRAWAL' | 'WINNING' | 'TICKET_PURCHASE';
      amount: number;
      timestamp: Date;
      status: 'COMPLETED' | 'PENDING' | 'FAILED';
    }>;
  }