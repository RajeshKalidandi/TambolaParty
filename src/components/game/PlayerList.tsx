import React from 'react';
import type { Player } from '../../types/game';

interface PlayerListProps {
  players: Player[];
}

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-gray-300 font-medium mb-3">Players ({players.length})</h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div key={player.id} className="flex items-center gap-3">
            <div className="relative">
              <img
                src={player.avatar}
                alt={player.name}
                className="w-8 h-8 rounded-full"
              />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-800
                ${player.status === 'active' ? 'bg-green-500' :
                  player.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'}`}
              />
            </div>
            <span className="text-gray-300 text-sm">{player.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}