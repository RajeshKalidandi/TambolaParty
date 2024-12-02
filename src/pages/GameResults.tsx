import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Trophy, Home, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GameResult } from '../types/game';

const PRIZE_COLORS = {
  EARLY_FIVE: 'bg-purple-500',
  TOP_LINE: 'bg-blue-500',
  MIDDLE_LINE: 'bg-green-500',
  BOTTOM_LINE: 'bg-yellow-500',
  FULL_HOUSE: 'bg-red-500',
};

const GameResults: React.FC<{ result: GameResult }> = ({ result }) => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Play celebration sound
    if (audioRef.current) {
      audioRef.current.play();
    }

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const interval = setInterval(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const shareResults = async () => {
    const text = `🎉 Game Results from ${result.roomName}!\n` +
      `Total Prize Pool: ₹${result.totalPrizePool}\n` +
      `Winners:\n${result.winners.map(w => 
        `${w.name} - ${w.prizeType.replace('_', ' ')} - ₹${w.amount}`
      ).join('\n')}`;

    if (navigator.share) {
      await navigator.share({
        title: 'Tambola Game Results',
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      // Show toast notification
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 text-white p-4">
      <audio ref={audioRef} src="/sounds/victory.mp3" />
      
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-2">Game Over! 🎉</h1>
        <p className="text-xl text-purple-200">{result.roomName}</p>
        <p className="text-purple-300">
          Hosted by {result.hostName} • {result.totalPlayers} Players
        </p>
      </div>

      {/* Prize Pool */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 animate-slide-up">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">Total Prize Pool</h2>
          <p className="text-3xl font-bold text-green-400">₹{result.totalPrizePool}</p>
        </div>
      </div>

      {/* Winners List */}
      <div className="space-y-4 mb-8">
        {result.winners.map((winner, index) => (
          <div
            key={winner.id}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4 animate-slide-up"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <div className={`${PRIZE_COLORS[winner.prizeType]} p-3 rounded-full`}>
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <img
                  src={winner.avatar}
                  alt={winner.name}
                  className="w-8 h-8 rounded-full"
                />
                <h3 className="font-medium">{winner.name}</h3>
              </div>
              <p className="text-sm text-purple-200">
                {winner.prizeType.replace('_', ' ')}
              </p>
            </div>
            <p className="text-xl font-bold text-green-400">₹{winner.amount}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={shareResults}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 
                   transition-colors rounded-xl py-3 px-6"
        >
          <Share2 className="w-5 h-5" />
          Share Results
        </button>
        <button
          onClick={() => navigate('/lobby')}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 
                   transition-colors rounded-xl py-3 px-6"
        >
          <Home className="w-5 h-5" />
          Return to Lobby
        </button>
        <button
          onClick={() => window.location.reload()}
          className="col-span-2 flex items-center justify-center gap-2 border border-purple-500 
                   hover:bg-purple-500/20 transition-colors rounded-xl py-3 px-6"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameResults;