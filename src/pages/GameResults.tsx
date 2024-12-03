import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Share2, Trophy, Home, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GameResult, Winner } from '../types/game';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PRIZE_COLORS = {
  EARLY_FIVE: 'bg-purple-500',
  TOP_LINE: 'bg-blue-500',
  MIDDLE_LINE: 'bg-green-500',
  BOTTOM_LINE: 'bg-yellow-500',
  FULL_HOUSE: 'bg-red-500',
} as const;

// Helper function to get public URL for avatars
const getAvatarUrl = (avatarPath: string) => {
  if (!avatarPath) return '/default-avatar.png';
  if (avatarPath.startsWith('http')) return avatarPath;
  
  try {
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(avatarPath);
    return data?.publicUrl || '/default-avatar.png';
  } catch (error) {
    console.error('Error getting avatar URL:', error);
    return '/default-avatar.png';
  }
};

type PrizeType = 'EARLY_FIVE' | 'TOP_LINE' | 'MIDDLE_LINE' | 'BOTTOM_LINE' | 'FULL_HOUSE';

interface GameResultData {
  id: string;
  room_name: string;
  total_players: number;
  prize_pool: number;
  start_time: string;
  end_time: string;
  host: {
    name: string;
  } | null;
  winners: Array<{
    id: string;
    player_name: string;
    player_avatar: string;
    prize_type: PrizeType;
    amount: number;
    created_at: string;
  }>;
}

export default function GameResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameResult = async () => {
      try {
        if (!id) {
          setError('No game ID provided');
          return;
        }
        
        const { data: rawData, error: queryError } = await supabase
          .from('game_results')
          .select(`
            id,
            room_name,
            total_players,
            prize_pool,
            start_time,
            end_time,
            host:host_id(name),
            winners (
              id,
              player_name,
              player_avatar,
              prize_type,
              amount,
              created_at
            )
          `)
          .eq('id', id)
          .single();

        if (queryError) throw queryError;

        // Type assertion with runtime validation
        const data = rawData as unknown as GameResultData;
        if (!data || typeof data.id !== 'string') {
          throw new Error('Invalid game data received');
        }

        const gameResult: GameResult = {
          gameId: data.id,
          roomName: data.room_name,
          totalPlayers: data.total_players,
          totalPrizePool: data.prize_pool,
          hostName: data.host?.name || 'Unknown Host',
          winners: data.winners.map((w) => ({
            id: w.id,
            name: w.player_name,
            avatar: w.player_avatar,
            prizeType: w.prize_type,
            amount: w.amount,
            timestamp: new Date(w.created_at)
          })),
          startTime: new Date(data.start_time),
          endTime: new Date(data.end_time)
        };

        setResult(gameResult);

        // Play celebration sound
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }

        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        const interval = setInterval(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 3000);

        return () => clearInterval(interval);
      } catch (err) {
        console.error('Error fetching game result:', err);
        setError('Failed to load game results');
        toast.error('Failed to load game results');
      } finally {
        setLoading(false);
      }
    };

    void fetchGameResult();
  }, [id]);

  const shareResults = async () => {
    if (!result) return;

    const text = `🎉 Game Results from ${result.roomName}!\n` +
      `🎮 Hosted by: ${result.hostName}\n` +
      `🏆 Total Prize Pool: ₹${result.totalPrizePool}\n` +
      `👥 Total Players: ${result.totalPlayers}\n\n` +
      `🎯 Winners:\n` +
      result.winners.map(w => 
        `${w.name} - ${w.prizeType.replace('_', ' ')} - ₹${w.amount}`
      ).join('\n');

    try {
      await navigator.share({
        title: 'TambolaParty Game Results',
        text
      });
    } catch (error) {
      // Fallback to clipboard if share is not supported
      await navigator.clipboard.writeText(text);
      toast.success('Results copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <Trophy className="w-16 h-16 text-gray-600 mb-4" />
        <p className="text-gray-400 text-center mb-8">{error || 'Game results not found'}</p>
        <button
          onClick={() => navigate('/lobby')}
          className="px-6 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Back to Lobby
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <audio ref={audioRef} src="/sounds/victory.mp3" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Game Results</h1>
        <div className="flex gap-2">
          <button
            onClick={shareResults}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Share Results"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/lobby')}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Go to Lobby"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Game Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-4 mb-6"
      >
        <h2 className="text-xl font-semibold mb-2">{result.roomName}</h2>
        <p className="text-gray-400 mb-4">Hosted by {result.hostName}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Total Players</p>
            <p className="text-lg">{result.totalPlayers}</p>
          </div>
          <div>
            <p className="text-gray-400">Prize Pool</p>
            <p className="text-lg">₹{result.totalPrizePool}</p>
          </div>
        </div>
      </motion.div>

      {/* Winners List */}
      <h3 className="text-lg font-semibold mb-4">Winners</h3>
      <div className="space-y-4 mb-24">
        <AnimatePresence>
          {result.winners.map((winner, index) => (
            <motion.div
              key={winner.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${PRIZE_COLORS[winner.prizeType]} bg-opacity-10 border-l-4 ${PRIZE_COLORS[winner.prizeType]} rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getAvatarUrl(winner.avatar)}
                    alt={winner.name}
                    className="w-10 h-10 rounded-full object-cover bg-gray-700"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = '/default-avatar.png';
                    }}
                  />
                  <div>
                    <p className="font-medium">{winner.name}</p>
                    <p className="text-sm text-gray-400">
                      {winner.prizeType.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold">₹{winner.amount}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Play Again Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/lobby')}
          className="w-full py-3 bg-cyan-500 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-600 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </motion.button>
      </div>
    </div>
  );
}