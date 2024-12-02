import React, { useState } from 'react';
import { Wallet, Building2, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Transaction } from '../../types/payment';

const Withdrawal: React.FC = () => {
  const [upiId, setUpiId] = useState('');
  const balance = 2500; // Replace with actual balance

  // Mock transactions - replace with actual data
  const transactions: Transaction[] = [
    {
      id: '1',
      amount: 500,
      type: 'WITHDRAWAL',
      status: 'COMPLETED',
      timestamp: new Date(),
      paymentMethod: {
        id: '1',
        type: 'UPI',
        details: { upiId: 'user@upi' },
        isDefault: true
      }
    }
  ];

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-500';
      case 'PENDING': return 'text-yellow-500';
      case 'FAILED': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED': return CheckCircle;
      case 'PENDING': return Clock;
      case 'FAILED': return XCircle;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-4">
        <p className="text-blue-100">Available Balance</p>
        <h1 className="text-3xl font-bold mb-2">₹{balance}</h1>
        <p className="text-sm text-blue-100">Withdrawals processed within 24 hours</p>
      </div>

      {/* Withdrawal Methods */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4">Withdraw Money</h2>

        {/* UPI Option */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">UPI ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="Enter your UPI ID"
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button className="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600">
              Verify
            </button>
          </div>
        </div>

        {/* Bank Account Option */}
        <button className="w-full flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 mb-4">
          <div className="flex items-center gap-3">
            <Building2 className="text-blue-500" />
            <div className="text-left">
              <p className="font-medium">Bank Account</p>
              <p className="text-sm text-gray-500">2-3 business days</p>
            </div>
          </div>
          <ArrowRight />
        </button>

        <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
          Withdraw Funds
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        <div className="space-y-3">
          {transactions.map(transaction => {
            const StatusIcon = getStatusIcon(transaction.status);
            return (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="text-gray-500" />
                  <div>
                    <p className="font-medium">₹{transaction.amount}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${getStatusColor(transaction.status)}`}>
                  <StatusIcon size={16} />
                  <span>{transaction.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;