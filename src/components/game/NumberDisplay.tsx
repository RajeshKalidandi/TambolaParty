import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, History } from 'lucide-react';
import { RealtimePostgresChangesPayload, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface NumberDisplayProps {
  gameId: string;
  isHost?: boolean;
}

interface GameState {
  id: string;
  current_number: number | null;
  called_numbers: number[];
  created_at?: string;
  updated_at?: string;
}

const numberSound = new Audio('/sounds/number.mp3');
numberSound.volume = 0.5;

const NumberDisplay: React.FC<NumberDisplayProps> = ({ gameId, isHost }) => {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [lastNumbers, setLastNumbers] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadGameState();
    
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
        (payload: RealtimePostgresChangesPayload<GameState>) => {
          if (payload.new && 'current_number' in payload.new) {
            const newState = payload.new as GameState;
            setCurrentNumber(newState.current_number);
            setLastNumbers(newState.called_numbers || []);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [gameId]);

  const loadGameState = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('current_number, called_numbers')
        .eq('id', gameId)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      
      setCurrentNumber(data?.current_number ?? null);
      setLastNumbers(data?.called_numbers || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading game state:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load game state');
      setLoading(false);
    }
  };

  const callNumber = async (): Promise<void> => {
    if (!isHost) return;

    try {
      const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
      const availableNumbers = allNumbers.filter(n => !lastNumbers.includes(n));
      
      if (availableNumbers.length === 0) {
        toast.error('All numbers have been called!');
        return;
      }

      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const newNumber = availableNumbers[randomIndex];

      const { error } = await supabase
        .from('games')
        .update({
          current_number: newNumber,
          called_numbers: [...lastNumbers, newNumber]
        })
        .eq('id', gameId);

      if (error) {
        throw new Error(error.message);
      }

      if (soundEnabled) {
        try {
          await numberSound.play();
        } catch (error) {
          console.error('Error playing sound:', error instanceof Error ? error.message : error);
        }
      }
    } catch (error) {
      console.error('Error calling number:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to call number');
    }
  };

  useEffect(() => {
    if (currentNumber !== null && soundEnabled) {
      void numberSound.play().catch((error) => {
        console.error('Error playing sound:', error instanceof Error ? error.message : error);
      });
    }
  }, [currentNumber, soundEnabled]);

  if (loading) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-center animate-pulse">
        <div className="h-24 bg-gray-800 rounded-lg mb-4"></div>
        <div className="h-12 bg-gray-800 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Numbers</h2>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-blue-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Current Number */}
      <div className="relative mb-6">
        <AnimatePresence mode="wait">
          {currentNumber !== null ? (
            <motion.div
              key={currentNumber}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl font-bold text-blue-400 mb-2"
              >
                {currentNumber}
              </motion.div>
              <div className="text-sm text-gray-400">Current Number</div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-400"
            >
              Waiting for next number...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Last Numbers */}
      <div>
        <h3 className="text-sm text-gray-400 mb-2">Last Numbers</h3>
        <div className="grid grid-cols-8 gap-2">
          <AnimatePresence>
            {lastNumbers.map((number, index) => (
              <motion.div
                key={`${number}-${index}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                  ${index === 0 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-gray-700 text-gray-300'}`}
              >
                {number}
              </motion.div>
            )).reverse()}
          </AnimatePresence>
          {lastNumbers.length === 0 && (
            <div className="col-span-8 text-center py-4 text-gray-500">
              No numbers called yet
            </div>
          )}
        </div>
      </div>

      {/* Number Board */}
      <div className="mt-6">
        <h3 className="text-sm text-gray-400 mb-2">Number Board</h3>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 90 }, (_, i) => i + 1).map((number) => (
            <div
              key={number}
              className={`aspect-square flex items-center justify-center rounded-md text-xs font-medium
                ${lastNumbers.includes(number) 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-gray-700 text-gray-300'}`}
            >
              {number}
            </div>
          ))}
        </div>
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
};

export default NumberDisplay;