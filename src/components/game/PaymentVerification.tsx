import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { PaymentVerification } from '../../types/payment';
import { supabase } from '../../lib/supabase';

interface PaymentVerificationProps {
  roomId: string;
  ticketPrice: number;
  onVerificationSubmit: () => void;
}

export default function PaymentVerification({
  roomId,
  ticketPrice,
  onVerificationSubmit
}: PaymentVerificationProps) {
  const [screenshot, setScreenshot] = useState<string>('');
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState<PaymentVerification['status']>('PENDING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!screenshot || !transactionId) return;
    
    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('payment_verifications')
        .insert({
          room_id: roomId,
          player_id: user.id,
          player_name: user.user_metadata.name,
          amount: ticketPrice,
          screenshot,
          transaction_id: transactionId,
          status: 'PENDING'
        });

      if (error) throw error;
      
      setStatus('PENDING');
      onVerificationSubmit();
    } catch (error) {
      console.error('Error submitting verification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Payment Verification</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload your payment screenshot and enter the transaction ID
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Payment Screenshot
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              {screenshot ? (
                <div className="relative w-48 h-48 mx-auto">
                  <img
                    src={screenshot}
                    alt="Payment Screenshot"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => setScreenshot('')}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload screenshot</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Transaction ID
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter UPI transaction ID..."
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {status === 'PENDING' && <Clock className="text-yellow-500" />}
            {status === 'VERIFIED' && <CheckCircle className="text-green-500" />}
            {status === 'REJECTED' && <XCircle className="text-red-500" />}
            <span className="text-sm font-medium text-gray-700">
              {status === 'PENDING' && 'Waiting for verification'}
              {status === 'VERIFIED' && 'Payment verified'}
              {status === 'REJECTED' && 'Payment rejected'}
            </span>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!screenshot || !transactionId || isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}