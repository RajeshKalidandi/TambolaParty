export interface Wallet {
    id: string;
    user_id: string;
    balance: number;
    created_at: string;
  }
  
  export interface Transaction {
    id: string;
    user_id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
  }
  
  export interface Notification {
    id: string;
    user_id: string;
    type: 'game' | 'wallet' | 'win';
    title: string;
    message: string;
    read: boolean;
    created_at: string;
  }