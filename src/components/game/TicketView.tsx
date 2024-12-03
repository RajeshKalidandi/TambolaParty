import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Ticket } from '../../types/game';

interface TicketViewProps {
  tickets: Ticket[];
  autoDaub: boolean;
  currentNumber: number | null;
  onToggleAutoDaub: () => void;
  onNumberMark: (ticketId: string, row: number, col: number) => void;
  onClaim: (prizeType: string) => void;
  prizes: {
    fullHouse: boolean;
    earlyFive: boolean;
    topLine: boolean;
    middleLine: boolean;
    bottomLine: boolean;
  };
}

const markSound = new Audio('/sounds/mark.mp3');
markSound.volume = 0.5;

export default function TicketView({ 
  tickets, 
  autoDaub, 
  currentNumber,
  onToggleAutoDaub, 
  onNumberMark,
  onClaim,
  prizes 
}: TicketViewProps) {
  const [currentTicket, setCurrentTicket] = useState(0);
  const [claimablePatterns, setClaimablePatterns] = useState<string[]>([]);

  useEffect(() => {
    // Auto-daub current number if enabled
    if (autoDaub && currentNumber !== null) {
      tickets[currentTicket].numbers.forEach((row, rowIndex) => {
        row.forEach((number, colIndex) => {
          if (number === currentNumber && !tickets[currentTicket].marked[rowIndex][colIndex]) {
            onNumberMark(tickets[currentTicket].id, rowIndex, colIndex);
          }
        });
      });
    }
  }, [currentNumber, autoDaub, currentTicket, tickets, onNumberMark]);

  useEffect(() => {
    // Check for claimable patterns
    const patterns: string[] = [];
    const ticket = tickets[currentTicket];
    
    // Early Five
    if (!prizes.earlyFive) {
      const markedCount = ticket.marked.flat().filter(Boolean).length;
      if (markedCount >= 5) patterns.push('early-five');
    }

    // Top Line
    if (!prizes.topLine && ticket.marked[0].every(Boolean)) {
      patterns.push('top-line');
    }

    // Middle Line
    if (!prizes.middleLine && ticket.marked[1].every(Boolean)) {
      patterns.push('middle-line');
    }

    // Bottom Line
    if (!prizes.bottomLine && ticket.marked[2].every(Boolean)) {
      patterns.push('bottom-line');
    }

    // Full House
    if (!prizes.fullHouse && ticket.marked.every(row => row.every(Boolean))) {
      patterns.push('full-house');
    }

    setClaimablePatterns(patterns);
  }, [tickets, currentTicket, prizes]);

  const handlePrevTicket = () => {
    setCurrentTicket((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextTicket = () => {
    setCurrentTicket((prev) => (prev < tickets.length - 1 ? prev + 1 : prev));
  };

  const handleNumberMark = (ticketId: string, row: number, col: number) => {
    void markSound.play();
    onNumberMark(ticketId, row, col);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {/* Auto-daub Toggle */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Wand2 className={`w-5 h-5 ${autoDaub ? 'text-cyan-400' : 'text-gray-400'}`} />
          <span className="text-sm text-gray-300">Auto-daub</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={autoDaub}
            onChange={onToggleAutoDaub}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
      </div>

      {/* Ticket Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevTicket}
          disabled={currentTicket === 0}
          className="p-2 text-gray-400 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-gray-300">
          Ticket {currentTicket + 1} of {tickets.length}
        </span>
        <button
          onClick={handleNextTicket}
          disabled={currentTicket === tickets.length - 1}
          className="p-2 text-gray-400 disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-9 gap-1 mb-4">
        {tickets[currentTicket].numbers.map((row, rowIndex) => (
          row.map((number, colIndex) => (
            <motion.button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleNumberMark(tickets[currentTicket].id, rowIndex, colIndex)}
              disabled={!number || autoDaub}
              whileHover={{ scale: number && !autoDaub ? 1.1 : 1 }}
              whileTap={{ scale: number && !autoDaub ? 0.95 : 1 }}
              animate={{
                scale: number === currentNumber ? [1, 1.2, 1] : 1,
                transition: { duration: 0.3 }
              }}
              className={`aspect-square flex items-center justify-center rounded-md text-sm font-medium
                ${number === null ? 'bg-gray-900/50' : 'bg-gray-700'}
                ${tickets[currentTicket].marked[rowIndex][colIndex] 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-gray-300'}
                ${number === currentNumber ? 'ring-2 ring-cyan-400 ring-opacity-50' : ''}`}
            >
              {number ?? ''}
              {tickets[currentTicket].marked[rowIndex][colIndex] && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-cyan-400 opacity-20 rounded-md"
                />
              )}
            </motion.button>
          ))
        ))}
      </div>

      {/* Claimable Patterns Indicator */}
      <AnimatePresence>
        {claimablePatterns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg"
          >
            <p className="text-cyan-400 text-sm text-center">
              You can claim: {claimablePatterns.map(p => p.replace('-', ' ')).join(', ')}!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Claim Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          onClick={() => onClaim('early-five')}
          disabled={prizes.earlyFive || !claimablePatterns.includes('early-five')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {prizes.earlyFive ? 'Early 5 Claimed' : 'Claim Early 5'}
        </motion.button>
        <motion.button
          onClick={() => onClaim('full-house')}
          disabled={prizes.fullHouse || !claimablePatterns.includes('full-house')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {prizes.fullHouse ? 'Full House Claimed' : 'Claim Full House'}
        </motion.button>
      </div>
    </div>
  );
}