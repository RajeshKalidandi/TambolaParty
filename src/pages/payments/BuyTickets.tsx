import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Check, Copy, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/auth/AuthContext';
import { motion } from 'framer-motion';

interface PaymentDetails {
  upiId: string;
  qrImage: string;
}

interface RoomDetails {
  id: string;
  name: string;
  host_id: string;
  ticket_price: number;
  payment_details: PaymentDetails;
  max_tickets_per_user: number;
}

interface PaymentVerificationRequest {
  id: string;
  room_id: string;
  user_id: string;
  transaction_id: string;
  amount: number;
  ticket_count: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function BuyTickets() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState<PaymentVerificationRequest | null>(null);

  useEffect(() => {
    if (!roomId) {
      toast.error('Room ID is required');
      navigate('/lobby');
      return;
    }
    void loadRoomDetails();
  }, [roomId]);

  const loadRoomDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name, host_id, ticket_price, payment_details, max_tickets_per_user')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Room not found');

      setRoom(data as RoomDetails);

      // Check for existing payment verification request
      const { data: verificationData } = await supabase
        .from('payment_verifications')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (verificationData) {
        setVerificationRequest(verificationData as PaymentVerificationRequest);
      }
    } catch (error) {
      console.error('Error loading room details:', error);
      toast.error('Failed to load room details');
      navigate('/lobby');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !user) return;

    try {
      setSubmitting(true);

      // Validate transaction ID format (you can adjust this based on your requirements)
      if (transactionId.length < 8) {
        toast.error('Please enter a valid transaction ID');
        return;
      }

      // Calculate total amount
      const totalAmount = room.ticket_price * ticketCount;

      // Create payment verification request
      const { data: verificationData, error: verificationError } = await supabase
        .from('payment_verifications')
        .insert({
          room_id: room.id,
          user_id: user.id,
          transaction_id: transactionId,
          amount: totalAmount,
          ticket_count: ticketCount,
          status: 'pending'
        })
        .select()
        .single();

      if (verificationError) throw verificationError;

      setVerificationRequest(verificationData as PaymentVerificationRequest);
      toast.success('Payment verification request submitted!');

      // Subscribe to changes in payment verification status
      const verificationChannel = supabase
        .channel(`payment_verification:${verificationData.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'payment_verifications',
            filter: `id=eq.${verificationData.id}`
          },
          (payload) => {
            const updatedVerification = payload.new as PaymentVerificationRequest;
            setVerificationRequest(updatedVerification);

            if (updatedVerification.status === 'approved') {
              toast.success('Payment verified! Redirecting to game...');
              setTimeout(() => {
                navigate(`/game/${room.id}`);
              }, 2000);
            } else if (updatedVerification.status === 'rejected') {
              toast.error('Payment verification failed. Please try again or contact support.');
            }
          }
        )
        .subscribe();

      return () => {
        verificationChannel.unsubscribe();
      };
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
          <h2 className="mt-2 text-lg font-medium">Room not found</h2>
          <p className="mt-1 text-sm text-gray-500">Please check the room ID and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Buy Tickets for {room.name}
            </h2>

            {verificationRequest ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  verificationRequest.status === 'pending'
                    ? 'bg-yellow-50'
                    : verificationRequest.status === 'approved'
                    ? 'bg-green-50'
                    : 'bg-red-50'
                }`}>
                  <div className="flex items-center">
                    {verificationRequest.status === 'pending' ? (
                      <Loader className="w-5 h-5 text-yellow-500 animate-spin" />
                    ) : verificationRequest.status === 'approved' ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <p className="ml-2 text-sm font-medium">
                      {verificationRequest.status === 'pending'
                        ? 'Payment verification in progress...'
                        : verificationRequest.status === 'approved'
                        ? 'Payment verified!'
                        : 'Payment verification failed'}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Transaction ID: {verificationRequest.transaction_id}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment QR Code
                  </label>
                  <div className="mt-1 flex justify-center">
                    <div className="relative group">
                      <img
                        src={room.payment_details.qrImage}
                        alt="Payment QR Code"
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    UPI ID
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      value={room.payment_details.upiId}
                      readOnly
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(room.payment_details.upiId)}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Tickets
                  </label>
                  <select
                    value={ticketCount}
                    onChange={(e) => setTicketCount(Number(e.target.value))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    {[...Array(room.max_tickets_per_user)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Ticket' : 'Tickets'} - ₹{room.ticket_price * (i + 1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter your UPI transaction ID"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Total Amount: <span className="font-bold">₹{room.ticket_price * ticketCount}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Please complete the payment and enter the transaction ID above
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Payment for Verification'
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}