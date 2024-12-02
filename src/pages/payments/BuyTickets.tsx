import React, { useState } from 'react';
import { Minus, Plus, CreditCard, Smartphone, Shield, ArrowRight } from 'lucide-react';
import type { TicketPurchase } from '../../types/payment';

const BuyTickets: React.FC = () => {
  const [purchase, setPurchase] = useState<TicketPurchase>({
    quantity: 1,
    pricePerTicket: 100,
    totalAmount: 100,
    finalAmount: 100
  });

  const updateQuantity = (delta: number) => {
    const newQuantity = Math.max(1, purchase.quantity + delta);
    const totalAmount = newQuantity * purchase.pricePerTicket;
    const discount = newQuantity >= 3 ? totalAmount * 0.1 : 0;
    setPurchase({
      ...purchase,
      quantity: newQuantity,
      totalAmount,
      discount,
      finalAmount: totalAmount - (discount || 0)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Buy Tickets</h1>
        <p className="text-gray-500">Select quantity and payment method</p>
      </div>

      {/* Quantity Selector */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700 font-medium">Number of Tickets</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateQuantity(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
            >
              <Minus size={20} />
            </button>
            <span className="text-xl font-bold">{purchase.quantity}</span>
            <button
              onClick={() => updateQuantity(1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-gray-600">
            <span>Price per ticket</span>
            <span>₹{purchase.pricePerTicket}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{purchase.totalAmount}</span>
          </div>
          {purchase.discount && (
            <div className="flex justify-between text-green-600">
              <span>Bulk discount (10%)</span>
              <span>-₹{purchase.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total Amount</span>
            <span>₹{purchase.finalAmount}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 border rounded-lg hover:border-blue-500">
            <div className="flex items-center gap-3">
              <Smartphone className="text-blue-500" />
              <div className="text-left">
                <p className="font-medium">UPI</p>
                <p className="text-sm text-gray-500">Pay using any UPI app</p>
              </div>
            </div>
            <ArrowRight />
          </button>

          <button className="w-full flex items-center justify-between p-4 border rounded-lg hover:border-blue-500">
            <div className="flex items-center gap-3">
              <CreditCard className="text-blue-500" />
              <div className="text-left">
                <p className="font-medium">Card Payment</p>
                <p className="text-sm text-gray-500">Credit or Debit card</p>
              </div>
            </div>
            <ArrowRight />
          </button>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
        <Shield size={16} />
        <span>100% secure payments</span>
      </div>
    </div>
  );
};

export default BuyTickets;