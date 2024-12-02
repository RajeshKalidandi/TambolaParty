import React from 'react';

interface NumberDisplayProps {
  currentNumber: number | null;
  lastNumbers: number[];
}

export default function NumberDisplay({ currentNumber, lastNumbers }: NumberDisplayProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
      {/* Current Number */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
        <div className="relative bg-gray-800 rounded-2xl p-8 text-center border border-cyan-500/30">
          <span className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            {currentNumber ?? '--'}
          </span>
        </div>
      </div>

      {/* Last 5 Numbers */}
      <div className="flex justify-center gap-2">
        {lastNumbers.slice(0, 5).map((number, index) => (
          <div
            key={index}
            className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg text-gray-400 text-sm border border-gray-700"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {number}
          </div>
        ))}
      </div>
    </div>
  );
}