import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../lib/auth/AuthContext';
import { supabase } from '../lib/supabase';

interface GameTicket {
  id: string;
  game_id: string;
  ticket_number: string;
  purchase_date: string;
  game_date: string;
  game_time: string;
  price: number;
  status: 'active' | 'completed' | 'cancelled';
}

export default function Tickets() {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<GameTicket[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      void fetchTickets();
    }
  }, [user?.id]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('game_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('game_date', { ascending: true });

      if (error) throw error;
      setTickets(data);
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center">
        <Link to="/lobby" className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">My Tickets</h1>
      </div>

      {/* Tickets List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-10">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No tickets found</p>
            <Link
              to="/payments/buy-tickets"
              className="mt-4 inline-block px-6 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-600"
            >
              Buy Tickets
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gray-800 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-cyan-500" />
                    <span className="font-medium">Ticket #{ticket.ticket_number}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    ticket.status === 'active' ? 'bg-green-500/20 text-green-500' :
                    ticket.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(ticket.game_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{ticket.game_time}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                  <span className="text-cyan-500 font-medium">₹{ticket.price}</span>
                  <Link
                    to={`/game/${ticket.game_id}`}
                    className="px-4 py-1 bg-cyan-500 rounded-lg text-sm hover:bg-cyan-600"
                  >
                    View Game
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}