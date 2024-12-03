import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Loader2, AlertCircle } from 'lucide-react';
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
}

// Interface for processed room details
interface RoomDetails extends Omit<RoomData, 'player_count'> {
  player_count: number;
}

export default function JoinRoom() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError('Invalid room code');
      return;
    }
    void findRoomByCode(code);
  }, [code]);

  const findRoomByCode = async (roomCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate room code format
      if (!roomCode.match(/^[A-Z0-9]{6}$/)) {
        throw new Error('Invalid room code format');
      }

      const { data, error } = await supabase
        .from('rooms')
        .select(`
          id,
          code,
          name,
          host_id,
          ticket_price,
          max_players,
          start_time,
          status,
          payment_details,
          prizes,
          player_count:room_players(count),
          created_at
        `)
        .eq('code', roomCode)
        .eq('status', 'waiting')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Room not found');

      // Process the room data
      const roomData = data as RoomData;
      const playerCount = roomData.player_count?.[0]?.count ?? 0;

      // Check if room is full
      if (playerCount >= roomData.max_players) {
        throw new Error('Room is full');
      }

      // Transform the data to match our interface
      const processedRoomDetails: RoomDetails = {
        ...roomData,
        player_count: playerCount
      };

      setRoomDetails(processedRoomDetails);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find room';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !roomDetails) return;

    try {
      setIsJoining(true);
      setError(null);

      // Check if player is already in the room
      const { data: existingPlayer, error: checkError } = await supabase
        .from('room_players')
        .select('id')
        .eq('room_id', roomDetails.id)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw checkError;
      }

      if (existingPlayer) {
        navigate(`/game/${roomDetails.id}`);
        return;
      }

      // Double-check room capacity before joining
      const { count: currentCount } = await supabase
        .from('room_players')
        .select('*', { count: 'exact' })
        .eq('room_id', roomDetails.id);

      if (typeof currentCount === 'number' && currentCount >= roomDetails.max_players) {
        throw new Error('Room is full');
      }

      // Join the room
      const { error: joinError } = await supabase
        .from('room_players')
        .insert({
          room_id: roomDetails.id,
          user_id: user.id,
          nickname: user.user_metadata?.name || user.email?.split('@')[0] || 'Player',
          payment_status: 'pending',
          joined_at: new Date().toISOString()
        });

      if (joinError) throw joinError;

      toast.success('Successfully joined the room!');
      navigate(`/game/${roomDetails.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join room';
      setError(message);
      toast.error(message);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h1 className="text-xl font-semibold text-gray-900">{error}</h1>
        <button
          onClick={() => navigate('/lobby')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  if (!roomDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-semibold text-gray-900">Room not found</h1>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen p-4 max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{roomDetails.name}</h1>
          <p className="text-gray-500">Room Code: {roomDetails.code}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Ticket Price</p>
            <p className="text-lg font-semibold">₹{roomDetails.ticket_price}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Players</p>
            <p className="text-lg font-semibold">{roomDetails.player_count}/{roomDetails.max_players}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Prizes</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(roomDetails.prizes).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </p>
                <p className="text-lg font-semibold">₹{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate('/lobby')}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleJoinRoom}
            disabled={isJoining}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isJoining && <Loader2 className="w-4 h-4 animate-spin" />}
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}