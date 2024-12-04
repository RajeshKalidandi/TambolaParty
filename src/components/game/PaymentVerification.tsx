import { useEffect, useState } from 'react';
import { Check, X, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Player {
  id: string;
  user_id: string;
  room_id: string;
  nickname: string;
  ticket_number: string | null;
  payment_verified: boolean;
  payment_verified_at: string | null;
  user: {
    username: string;
    avatar_url: string;
  };
}

export default function PaymentVerification({ roomId, isHost }: { roomId: string; isHost: boolean }) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('pending');

  useEffect(() => {
    void loadPlayers();
    // Subscribe to real-time updates
    const channel = supabase
      .channel('room_players')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          void loadPlayers();
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [roomId, filter]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const query = supabase
        .from('room_players')
        .select(`
          *,
          user:user_id (
            username,
            avatar_url
          )
        `)
        .eq('room_id', roomId);

      if (filter !== 'all') {
        query.eq('payment_verified', filter === 'verified');
      }

      const { data, error } = await query;
      if (error) throw error;

      setPlayers(data as Player[]);
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (playerId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('room_players')
        .update({ 
          payment_verified: verified,
          payment_verified_at: verified ? new Date().toISOString() : null 
        })
        .eq('id', playerId);

      if (error) throw error;

      toast.success(`Payment ${verified ? 'verified' : 'unverified'} successfully`);
      void loadPlayers();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  if (!isHost) {
    const currentPlayer = players.find(p => p.user_id === user?.id);
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Payment Status</h2>
          {currentPlayer?.payment_verified ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <Check className="w-4 h-4 mr-1" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Pending Verification
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Payment Verifications</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="border border-gray-300 rounded-md px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Players</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {players.map((player) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={player.user.avatar_url || '/default-avatar.png'}
                    alt={player.user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{player.user.username}</h3>
                    <p className="text-sm text-gray-500">Ticket #{player.ticket_number || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {player.payment_verified ? (
                    <button
                      onClick={() => handleVerification(player.id, false)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Unverify
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerification(player.id, true)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Verify
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
