import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Trophy, Clock } from 'lucide-react';
import type { Claim } from '../../types/game';

interface ClaimsFeedProps {
  claims: Claim[];
}

type PrizeType = 'early-five' | 'top-line' | 'middle-line' | 'bottom-line' | 'full-house';

const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) {
    return 'Just now';
  } else if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  } else {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
};

const prizeEmoji: Record<PrizeType, string> = {
  'early-five': '🎯',
  'top-line': '⬆️',
  'middle-line': '↔️',
  'bottom-line': '⬇️',
  'full-house': '🏆',
} as const;

const ClaimsFeed: React.FC<ClaimsFeedProps> = ({ claims }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Claims Feed</h2>
        </div>
        <span className="text-sm text-gray-400">
          {claims.length} claim{claims.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {claims.map((claim) => (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-700/50 rounded-lg p-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
                  {prizeEmoji[claim.prizeType as keyof typeof prizeEmoji] || '🎮'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-medium">{claim.playerName}</span>
                    {' claimed '}
                    <span className="text-purple-400">
                      {claim.prizeType.replace(/-/g, ' ')}
                    </span>
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(claim.timestamp)}
                    </span>
                  </div>
                </div>
                <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {claims.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-400"
          >
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No claims yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Be the first to claim a prize!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClaimsFeed;