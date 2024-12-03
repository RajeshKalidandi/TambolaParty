import { useEffect, useState } from 'react';
import { Trophy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface PrizeStatus {
  early_five: boolean;
  top_line: boolean;
  middle_line: boolean;
  bottom_line: boolean;
  full_house: boolean;
}

interface PrizeStatusProps {
  gameId: string;
  onPrizeClaim?: (prizeType: keyof PrizeStatus) => void;
}

const prizeDetails = {
  early_five: { name: 'Early Five', description: 'First to mark any 5 numbers' },
  top_line: { name: 'Top Line', description: 'Complete the top line' },
  middle_line: { name: 'Middle Line', description: 'Complete the middle line' },
  bottom_line: { name: 'Bottom Line', description: 'Complete the bottom line' },
  full_house: { name: 'Full House', description: 'Complete the entire ticket' }
};

export default function PrizeStatus({ gameId, onPrizeClaim }: PrizeStatusProps) {
  const [prizes, setPrizes] = useState<PrizeStatus>({
    early_five: false,
    top_line: false,
    middle_line: false,
    bottom_line: false,
    full_house: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrizeStatus();

    // Subscribe to prize status updates
    const channel = supabase
      .channel(`game-prizes-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const winning_pattern = payload.new.winning_pattern;
          setPrizes(winning_pattern);

          // Play sound for newly won prizes
          const newPrizes = Object.entries(winning_pattern).filter(
            ([key, value]) => value && !prizes[key as keyof PrizeStatus]
          );
          
          if (newPrizes.length > 0) {
            const audio = new Audio('/prize-won.mp3');
            audio.play().catch(console.error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const loadPrizeStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('winning_pattern')
        .eq('id', gameId)
        .single();

      if (error) throw error;
      setPrizes(data.winning_pattern);
      setLoading(false);
    } catch (error) {
      console.error('Error loading prize status:', error);
      toast.error('Failed to load prize status');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto p-2 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-32 bg-gray-800 rounded-full flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto p-2">
      <AnimatePresence>
        {Object.entries(prizeDetails).map(([key, { name, description }]) => {
          const isWon = prizes[key as keyof PrizeStatus];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative group flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap cursor-pointer
                ${
                  isWon
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700/50'
                }`}
              onClick={() => !isWon && onPrizeClaim?.(key as keyof PrizeStatus)}
            >
              {isWon ? (
                <Check className="w-4 h-4" />
              ) : (
                <Trophy className="w-4 h-4" />
              )}
              <span>{name}</span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-gray-300 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs text-center">
                {description}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}