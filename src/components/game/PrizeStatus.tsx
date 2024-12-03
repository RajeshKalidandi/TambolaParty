import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, ArrowRight } from 'lucide-react';
import type { Winner } from '../../types/game';

interface PrizeStatusProps {
  prizes: {
    fullHouse: number;
    topLine: number;
    middleLine: number;
    bottomLine: number;
    earlyFive: number;
  };
  winners: Winner[];
  totalPrizePool: number;
}

const prizeNames = {
  FULL_HOUSE: 'Full House',
  TOP_LINE: 'Top Line',
  MIDDLE_LINE: 'Middle Line',
  BOTTOM_LINE: 'Bottom Line',
  EARLY_FIVE: 'Early Five',
};

const PrizeStatus: React.FC<PrizeStatusProps> = ({ prizes, winners, totalPrizePool }) => {
  const getPrizeStatus = (prizeType: keyof typeof prizeNames) => {
    const winner = winners.find(w => w.prizeType === prizeType);
    return {
      claimed: !!winner,
      winner,
      amount: prizes[prizeType.toLowerCase().replace('_', '') as keyof typeof prizes],
    };
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">Prize Status</h2>
        </div>
        <div className="text-sm text-gray-400">
          Total Pool: ₹{totalPrizePool}
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(prizeNames).map(([key, name]) => {
          const status = getPrizeStatus(key as keyof typeof prizeNames);
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg border ${
                status.claimed
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-gray-700/50 border-gray-600/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {status.claimed && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className={`font-medium ${
                    status.claimed ? 'text-green-400' : 'text-white'
                  }`}>
                    {name}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  ₹{status.amount}
                </span>
              </div>

              {status.winner && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 flex items-center gap-2"
                >
                  <img
                    src={status.winner.avatar}
                    alt={status.winner.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-300">
                    {status.winner.name}
                  </span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto flex items-center gap-1 text-xs text-yellow-400"
                  >
                    <Trophy className="w-3 h-3" />
                    <span>Winner!</span>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PrizeStatus;