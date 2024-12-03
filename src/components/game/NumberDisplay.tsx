import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface NumberDisplayProps {
  gameId: string;
  isHost?: boolean;
}

export default function NumberDisplay({ gameId, isHost }: NumberDisplayProps) {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [lastNumbers, setLastNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameState();
    
    // Subscribe to game updates
    const channel = supabase
      .channel(`game-numbers-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const { current_number, called_numbers } = payload.new;
          setCurrentNumber(current_number);
          setLastNumbers(called_numbers || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const loadGameState = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('current_number, called_numbers')
        .eq('id', gameId)
        .single();

      if (error) throw error;
      
      setCurrentNumber(data.current_number);
      setLastNumbers(data.called_numbers || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading game state:', error);
      toast.error('Failed to load game state');
      setLoading(false);
    }
  };

  const callNumber = async () => {
    if (!isHost) return;

    try {
      // Get all numbers from 1 to 90
      const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
      // Filter out already called numbers
      const availableNumbers = allNumbers.filter(n => !lastNumbers.includes(n));
      
      if (availableNumbers.length === 0) {
        toast.error('All numbers have been called!');
        return;
      }

      // Pick a random number
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const newNumber = availableNumbers[randomIndex];

      const { error } = await supabase
        .from('games')
        .update({
          current_number: newNumber,
          called_numbers: [...lastNumbers, newNumber]
        })
        .eq('id', gameId);

      if (error) throw error;

      // Play sound
      const audio = new Audio('/number-called.mp3');
      audio.play().catch(console.error);
    } catch (error) {
      console.error('Error calling number:', error);
      toast.error('Failed to call number');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-center animate-pulse">
        <div className="h-24 bg-gray-800 rounded-lg mb-4"></div>
        <div className="h-12 bg-gray-800 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-center">
      {/* Current Number */}
      <AnimatePresence mode="wait">
        {currentNumber && (
          <motion.div
            key={currentNumber}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="relative mb-6"
          >
            <span className="text-6xl font-bold text-white">{currentNumber}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last Called Numbers */}
      <div className="flex flex-wrap gap-2 justify-center">
        {lastNumbers.slice(-10).reverse().map((number, index) => (
          <motion.div
            key={`${number}-${index}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
              ${number === currentNumber ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            {number}
          </motion.div>
        ))}
      </div>

      {/* Call Number Button (Host Only) */}
      {isHost && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={callNumber}
          className="mt-6 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
        >
          Call Next Number
        </motion.button>
      )}
    </div>
  );
}