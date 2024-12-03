import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, ArrowLeft, Calendar, Clock, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../lib/auth/AuthContext';
import { supabase } from '../lib/supabase';

interface GameTicket {
  id: string;
  room_id: string;
  player_id: string;
  numbers: number[][];
  claims: {
    full_house: boolean;
    top_line: boolean;
    middle_line: boolean;
    bottom_line: boolean;
    early_five: boolean;
  };
  created_at: string;
  room: {
    name: string;
    start_time: string;
    ticket_price: number;
    status: 'waiting' | 'in_progress' | 'completed';
    prizes: {
      fullHouse: number;
      topLine: number;
      middleLine: number;
      bottomLine: number;
      earlyFive: number;
    };
  };
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
        .from('tickets')
        .select(`
          *,
          room:rooms(
            name,
            start_time,
            ticket_price,
            status,
            prizes
          )
        `)
        .eq('player_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data);
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const renderClaims = (ticket: GameTicket) => {
    return Object.entries(ticket.claims).map(([claim, won]) => {
      if (!won) return null;
      
      const claimDisplay = {
        full_house: 'Full House',
        top_line: 'Top Line',
        middle_line: 'Middle Line',
        bottom_line: 'Bottom Line',
        early_five: 'Early Five'
      }[claim];

      const prizeAmount = {
        full_house: ticket.room.prizes.fullHouse,
        top_line: ticket.room.prizes.topLine,
        middle_line: ticket.room.prizes.middleLine,
        bottom_line: ticket.room.prizes.bottomLine,
        early_five: ticket.room.prizes.earlyFive
      }[claim];

      return (
        <span key={claim} className="mt-2 text-sm text-yellow-400 flex items-center">
          <Trophy className="w-4 h-4 mr-1" />
          Won {claimDisplay}! (₹{prizeAmount})
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/lobby" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold">My Tickets</h1>
          <div className="w-6" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Tickets List */}
      <div className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-4 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{ticket.room.name}</h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(ticket.room.start_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{new Date(ticket.room.start_time).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Ticket className="w-4 h-4 mr-2" />
                        <span>₹{ticket.room.ticket_price}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusStyle(ticket.room.status)}`}>
                      {ticket.room.status.replace('_', ' ')}
                    </span>
                    {renderClaims(ticket)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Ticket className="w-12 h-12 mx-auto text-gray-600" />
            <h3 className="mt-2 text-xl font-medium">No tickets yet</h3>
            <p className="mt-1 text-gray-400">Join a game to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}