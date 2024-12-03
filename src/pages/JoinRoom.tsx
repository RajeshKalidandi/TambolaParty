import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface RoomDetails {
  id: string;
  name: string;
  ticket_price: number;
  max_players: number;
  start_time: string;
  payment_details: {
    upiId: string;
    qrImage: string;
  };
  current_players: number;
}

export default function JoinRoom() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);

  useEffect(() => {
    if (code) {
      findRoomByCode(code);
    }
  }, [code]);

  const findRoomByCode = async (roomCode: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          id,
          name,
          ticket_price,
          max_players,
          start_time,
          payment_details,
          room_players(count)
        `)
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (error) throw error;

      // Transform the data to match our interface
      const roomData: RoomDetails = {
        ...data,
        current_players: data.room_players?.[0]?.count || 0
      };

      setRoomDetails(roomData);
    } catch (error) {
      console.error('Error finding room:', error);
      toast.error('Room not found');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      if (!roomDetails) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Please login to join the room');
        navigate('/login');
        return;
      }

      // Check if user already joined
      const { data: existingPlayer } = await supabase
        .from('room_players')
        .select('player_id')
        .eq('room_id', roomDetails.id)
        .eq('player_id', userData.user.id)
        .single();

      if (existingPlayer) {
        navigate(`/buy-tickets/${roomDetails.id}`);
        return;
      }

      // Check room capacity
      if (roomDetails.current_players >= roomDetails.max_players) {
        toast.error('Room is full');
        return;
      }

      // Join room
      const { error: joinError } = await supabase
        .from('room_players')
        .insert({
          room_id: roomDetails.id,
          player_id: userData.user.id,
          payment_status: 'PENDING'
        });

      if (joinError) throw joinError;

      toast.success('Successfully joined the room!');
      navigate(`/buy-tickets/${roomDetails.id}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!roomDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Room not found</h2>
          <p className="mt-2 text-sm text-gray-500">The room you're looking for doesn't exist</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Join Room
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{roomDetails.name}</h3>
              <p className="mt-1 text-sm text-gray-500">
                Game starts at {new Date(roomDetails.start_time).toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 px-4 py-5 rounded-lg space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Ticket Price</span>
                <span className="text-sm font-medium text-gray-900">₹{roomDetails.ticket_price}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Players</span>
                <span className="text-sm font-medium text-gray-900">
                  {roomDetails.current_players}/{roomDetails.max_players}
                </span>
              </div>
            </div>

            <button
              onClick={handleJoinRoom}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}