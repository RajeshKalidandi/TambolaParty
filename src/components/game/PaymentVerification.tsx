import { useEffect, useState } from 'react';
import { Check, X, Loader, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentRequest {
  id: string;
  room_id: string;
  user_id: string;
  transaction_id: string;
  amount: number;
  ticket_count: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: {
    username: string;
    avatar_url: string;
  };
}

export default function PaymentVerification({ roomId }: { roomId: string }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    void loadPaymentRequests();
    // Subscribe to real-time updates
    const channel = supabase
      .channel('payment_verifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_verifications',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          void loadPaymentRequests();
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [roomId, filter]);

  const loadPaymentRequests = async () => {
    try {
      setLoading(true);
      const query = supabase
        .from('payment_verifications')
        .select(`
          *,
          user:user_id (
            username,
            avatar_url
          )
        `)
        .eq('room_id', roomId);

      if (filter !== 'all') {
        query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setRequests(data as PaymentRequest[]);
    } catch (error) {
      console.error('Error loading payment requests:', error);
      toast.error('Failed to load payment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('payment_verifications')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      if (status === 'approved') {
        // Generate tickets
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: ticketError } = await supabase.rpc('generate_tickets', {
            p_user_id: request.user_id,
            p_room_id: roomId,
            p_ticket_count: request.ticket_count
          });

          if (ticketError) throw ticketError;
        }
      }

      toast.success(`Payment ${status} successfully`);
      void loadPaymentRequests();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const filteredRequests = requests.filter(request =>
    request.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Payment Verifications</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No payment requests found
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <img
                      src={request.user.avatar_url || '/default-avatar.png'}
                      alt={request.user.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{request.user.username}</p>
                      <p className="text-sm text-gray-500">
                        Transaction ID: {request.transaction_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{request.amount}</p>
                      <p className="text-sm text-gray-500">{request.ticket_count} tickets</p>
                    </div>
                    {request.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerification(request.id, 'approved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleVerification(request.id, 'rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
