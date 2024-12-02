import React from 'react';
import { Trophy, Check } from 'lucide-react';

interface PrizeStatusProps {
  prizes: {
    fullHouse: boolean;
    earlyFive: boolean;
    topLine: boolean;
    middleLine: boolean;
    bottomLine: boolean;
  };
}

export default function PrizeStatus({ prizes }: PrizeStatusProps) {
  const prizeList = [
    { name: 'Full House', claimed: prizes.fullHouse },
    { name: 'Early Five', claimed: prizes.earlyFive },
    { name: 'Top Line', claimed: prizes.topLine },
    { name: 'Middle Line', claimed: prizes.middleLine },
    { name: 'Bottom Line', claimed: prizes.bottomLine },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto p-2">
      {prizeList.map((prize) => (
        <div
          key={prize.name}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap
            ${prize.claimed 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
        >
          {prize.claimed ? (
            <Check className="w-4 h-4" />
          ) : (
            <Trophy className="w-4 h-4" />
          )}
          {prize.name}
        </div>
      ))}
    </div>
  );
}