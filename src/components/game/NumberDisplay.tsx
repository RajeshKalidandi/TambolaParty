import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NumberDisplayProps {
  currentNumber: number | null;
  lastNumbers: number[];
}

const NumberDisplay = ({ currentNumber, lastNumbers }: NumberDisplayProps) => {
  useEffect(() => {
    if (currentNumber) {
      // Play sound when new number is called
      const audio = new Audio('/number-called.mp3');
      audio.play().catch(() => {
        // Handle browsers that block autoplay
        console.log('Audio autoplay blocked');
      });
    }
  }, [currentNumber]);

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
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
            <div className="relative bg-gray-800 rounded-2xl p-8 text-center border border-cyan-500/30">
              <span className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                {currentNumber}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last 5 Numbers */}
      <div className="flex justify-center gap-2">
        {lastNumbers.slice(0, 5).map((number, index) => (
          <motion.div
            key={`${number}-${index}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 0.6 }}
            className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg text-gray-400 text-sm border border-gray-700"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {number}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NumberDisplay;