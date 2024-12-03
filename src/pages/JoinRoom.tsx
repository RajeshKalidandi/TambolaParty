import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Loader2, AlertCircle, Users, Trophy, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Types for room data from Supabase
interface RoomData {
  id: string;
  code: string;
  name: string;
  host_id: string;
  ticket_price: number;
  max_players: number;
  start_time: string;
  status: 'waiting' | 'in_progress' | 'completed';
  payment_details: {
    upiId: string;
    qrImage: string;
  };
  prizes: {
    full_house: number;
    early_five: number;
    top_line: number;
    middle_line: number;
    bottom_line: number;
  };
  player_count: { count: number }[] | null;
  created_at: string;
  host: {
    nickname: string;
    avatar_url: string;
  };
}

// Interface for processed room details
interface RoomDetails extends Omit<RoomData, 'player_count'> {
  player_count: number;
}

const validateRoomCode = (code: string) => {
  if (!code || !code.match(/^[A-Z0-9]{6}$/)) {
    throw new Error('Invalid room code format. Code must be 6 characters long.');
  }
};

const validateRoom = (room: RoomData) => {
  if (!room) {
    throw new Error('Room not found');
  }
  
  if (room.status !== 'waiting') {
    throw new Error('This game has already started or ended');
  }
  
  const playerCount = room.player_count?.[0]?.count ?? 0;
  if (playerCount >= room.max_players) {
    throw new Error('Room is full');
  }
  
  const startTime = new Date(room.start_time);
  if (startTime < new Date()) {
    throw new Error('This game has already started');
  }
};

export default function JoinRoom() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/join/${code}` } });
      return;
    }

    if (!code) {
      setError('Invalid room code');
      return;
    }

    void findRoomByCode(code);

    // Subscribe to room updates
    const roomSubscription = supabase
      .channel(`room:${code}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${code}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            toast.error('This room has been deleted');
            navigate('/lobby');
            return;
          }
          void findRoomByCode(code);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(roomSubscription);
    };
  }, [code, user]);

  const findRoomByCode = async (roomCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      validateRoomCode(roomCode);

      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          host:profiles!rooms_host_id_fkey(
            nickname,
            avatar_url
          ),
          player_count:room_players(count)
        `)
        .eq('code', roomCode.toUpperCase())
        .single();

      if (error) throw error;
      
      validateRoom(data as RoomData);

      setRoomDetails({
        ...(data as RoomData),
        player_count: data.player_count?.[0]?.count ?? 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !roomDetails) return;

    try {
      setIsJoining(true);
      
      // Check if user has already joined
      const { data: existingPlayer } = await supabase
        .from('room_players')
        .select('id')
        .eq('room_id', roomDetails.id)
        .eq('player_id', user.id)
        .single();

      if (existingPlayer) {
        navigate(`/game/${roomDetails.id}`);
        return;
      }

      // Check user's wallet balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!wallet || wallet.balance < roomDetails.ticket_price) {
        toast.error('Insufficient balance. Please add money to your wallet.');
        navigate('/payments/wallet');
        return;
      }

      // Join room and deduct balance
      const { error: joinError } = await supabase.rpc('join_room', {
        p_room_id: roomDetails.id,
        p_player_id: user.id,
        p_ticket_price: roomDetails.ticket_price
      });

      if (joinError) throw joinError;

      toast.success('Successfully joined the room!');
      navigate(`/game/${roomDetails.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !roomDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Room Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to find the room'}</p>
          <button
            onClick={() => navigate('/lobby')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 py-8 px-4"
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Room Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{roomDetails.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>{roomDetails.player_count}/{roomDetails.max_players} Players</span>
              </div>
              <div className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                <span>₹{roomDetails.prizes.full_house} Prize Pool</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>{new Date(roomDetails.start_time).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Room Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Host Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={roomDetails.host.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${roomDetails.host.nickname}`}
                  alt={roomDetails.host.nickname}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-sm text-gray-500">Hosted by</p>
                  <p className="font-medium">{roomDetails.host.nickname}</p>
                </div>
              </div>

              {/* Ticket Price */}
              <div className="text-right">
                <p className="text-sm text-gray-500">Ticket Price</p>
                <p className="text-2xl font-bold text-indigo-600">₹{roomDetails.ticket_price}</p>
              </div>
            </div>

            {/* Prize Distribution */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Prize Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-600">Full House</p>
                  <p className="text-xl font-bold">₹{roomDetails.prizes.full_house}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Early Five</p>
                  <p className="text-xl font-bold">₹{roomDetails.prizes.early_five}</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <p className="text-sm text-pink-600">Top Line</p>
                  <p className="text-xl font-bold">₹{roomDetails.prizes.top_line}</p>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleJoinRoom}
                disabled={isJoining}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Room'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

