export interface PaymentMethod {
    id: string;
    type: 'UPI' | 'CARD' | 'BANK_ACCOUNT';
    details: {
      upiId?: string;
      bankName?: string;
      accountNumber?: string;
      ifscCode?: string;
    };
    isDefault: boolean;
  }
  
  export interface Transaction {
    id: string;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    timestamp: Date;
    paymentMethod: PaymentMethod;
    reference?: string;
  }
  
  export interface TicketPurchase {
    quantity: number;
    pricePerTicket: number;
    totalAmount: number;
    discount?: number;
    finalAmount: number;
  }