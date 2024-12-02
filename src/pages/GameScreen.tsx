import React, { useState } from 'react';
import NumberDisplay from '../components/game/NumberDisplay';
import PrizeStatus from '../components/game/PrizeStatus';
import TicketView from '../components/game/TicketView';
import PlayerList from '../components/game/PlayerList';
import ClaimsFeed from '../components/game/ClaimsFeed';
import ChatBubble from '../components/game/ChatBubble';
import { Volume2, VolumeX } from 'lucide-react';
import type { GameState, Ticket } from '../types/game';

const MOCK_TICKETS: Ticket[] = [
  {
    id: '1',
    numbers: [
      [1, 12, null, 34, 45, null, 67, 78, 90],
      [2, null, 23, 35, null, 56, 68, null, 89],
      [3, 14, 25, null, 47, 58, null, 80, null],
    ],
    marked: Array(3).fill(Array(9).fill(false)),
  },
  {
    id: '2',
    numbers: [
      [4, 15, null, 36, 48, null, 69, 79, 88],
      [5, null, 24, 37, null, 57, 70, null, 87],
      [6, 13, 26, null, 46, 59, null, 81, null],
    ],
    marked: Array(3).fill(Array(9).fill(false)),
  },
];

const MOCK_STATE: GameState = {
  currentNumber: 45,
  lastNumbers: [42, 13, 78, 90, 55],
  prizes: {
    fullHouse: false,
    earlyFive: false,
    topLine: false,
    middleLine: false,
    bottomLine: false,
  },
  players: [
    { id: '1', name: 'Player 1', avatar: 'https://i.pravatar.cc/150?img=1', status: 'active' },
    { id: '2', name: 'Player 2', avatar: 'https://i.pravatar.cc/150?img=2', status: 'away' },
    { id: '3', name: 'Player 3', avatar: 'https://i.pravatar.cc/150?img=3', status: 'offline' },
  ],
  claims: [
    { id: '1', playerName: 'Player 2', prizeType: 'Early Five', timestamp: Date.now() - 5000 },
    { id: '2', playerName: 'Player 1', prizeType: 'Top Line', timestamp: Date.now() - 60000 },
  ],
  soundEnabled: true,
  autoDaub: false,
};

export default function GameScreen() {
  const [gameState, setGameState] = useState<GameState>(MOCK_STATE);
  const [tickets] = useState<Ticket[]>(MOCK_TICKETS);

  const toggleSound = () => {
    setGameState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const toggleAutoDaub = () => {
    setGameState((prev) => ({ ...prev, autoDaub: !prev.autoDaub }));
  };

  const handleNumberMark = (ticketId: string, row: number, col: number) => {
    // Implementation for marking numbers
  };

  const handleClaim = (prizeType: string) => {
    // Implementation for handling claims
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Top Section */}
        <div className="space-y-4">
          <NumberDisplay
            currentNumber={gameState.currentNumber}
            lastNumbers={gameState.lastNumbers}
          />
          <PrizeStatus prizes={gameState.prizes} />
        </div>

        {/* Middle Section */}
        <TicketView
          tickets={tickets}
          autoDaub={gameState.autoDaub}
          onToggleAutoDaub={toggleAutoDaub}
          onNumberMark={handleNumberMark}
          onClaim={handleClaim}
        />

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-4">
          <PlayerList players={gameState.players} />
          <ClaimsFeed claims={gameState.claims} />
        </div>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className="fixed top-4 right-4 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {gameState.soundEnabled ? (
            <Volume2 className="w-6 h-6 text-cyan-400" />
          ) : (
            <VolumeX className="w-6 h-6 text-gray-400" />
          )}
        </button>

        {/* Chat Bubble */}
        <ChatBubble />
      </div>
    </div>
  );
}