import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import type { Ticket } from '../../types/game';

interface TicketViewProps {
  tickets: Ticket[];
  autoDaub: boolean;
  onToggleAutoDaub: () => void;
  onNumberMark: (ticketId: string, row: number, col: number) => void;
  onClaim: (prizeType: string) => void;
}

export default function TicketView({ 
  tickets, 
  autoDaub, 
  onToggleAutoDaub, 
  onNumberMark,
  onClaim 
}: TicketViewProps) {
  const [currentTicket, setCurrentTicket] = useState(0);

  const handlePrevTicket = () => {
    setCurrentTicket((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextTicket = () => {
    setCurrentTicket((prev) => (prev < tickets.length - 1 ? prev + 1 : prev));
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
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onNumberMark(tickets[currentTicket].id, rowIndex, colIndex)}
              disabled={!number || autoDaub}
              className={`aspect-square flex items-center justify-center rounded-md text-sm font-medium
                ${number === null ? 'bg-gray-900/50' : 'bg-gray-700'}
                ${tickets[currentTicket].marked[rowIndex][colIndex] 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-gray-300'}`}
            >
              {number ?? ''}
            </button>
          ))
        ))}
      </div>

      {/* Quick Claim Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onClaim('early-five')}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
        >
          Claim Early 5
        </button>
        <button
          onClick={() => onClaim('full-house')}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
        >
          Claim Full House
        </button>
      </div>
    </div>
  );
}