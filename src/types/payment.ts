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

// Host Payment Setup
export interface HostPaymentDetails {
  upiId: string;
  qrImage: string;
  hostName: string;
}

// Payment Verification
export interface PaymentVerification {
  id: string;
  roomId: string;
  playerId: string;
  playerName: string;
  amount: number;
  screenshot: string;
  transactionId?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  timestamp: Date;
  verifiedAt?: Date;
  hostNote?: string;
}

export interface PaymentQRCode {
  id: string;
  user_id: string;
  qr_image_url: string;
  upi_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface PaymentDetails {
  upiId: string;
  qrImage: string;
  isValid: boolean;
}