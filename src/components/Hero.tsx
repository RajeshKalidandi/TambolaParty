import React from 'react';
import { Coins, Ticket } from 'lucide-react';

const FloatingElement = ({ children, className }: { children: React.ReactNode; className: string }) => (
  <div className={`absolute animate-float ${className}`}>
    {children}
  </div>
);

interface HeroProps {
  onHost: () => void;
  onJoin: () => void;
}

export default function Hero({ onHost, onJoin }: HeroProps) {
  return (
    <div className="relative min-h-[80vh] bg-gradient-to-br from-[#FF5722] to-[#1A237E] overflow-hidden">
      {/* Floating Elements */}
      <FloatingElement className="top-1/4 left-1/4">
        <Ticket className="w-12 h-12 text-white/80 rotate-12" />
      </FloatingElement>
      <FloatingElement className="top-1/3 right-1/4">
        <Coins className="w-10 h-10 text-[#FFD700] -rotate-12" />
      </FloatingElement>
      <FloatingElement className="bottom-1/4 left-1/3">
        <Ticket className="w-8 h-8 text-white/60 rotate-45" />
      </FloatingElement>
      <FloatingElement className="top-1/2 right-1/3">
        <Coins className="w-14 h-14 text-[#FFD700]/80 rotate-12" />
      </FloatingElement>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-6 animate-fadeIn">
          TambolaParty
        </h1>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          Host exciting tambola games online, earn rewards, and create unforgettable moments with friends and family
        </p>
        <div className="flex gap-6 justify-center">
          <button 
            onClick={onHost}
            className="px-8 py-4 bg-[#FF5722] text-white rounded-full font-semibold hover:bg-[#FF5722]/90 transform hover:scale-105 transition shadow-lg"
          >
            Host Game
          </button>
          <button
            onClick={onJoin}
            className="px-8 py-4 bg-[#1A237E] text-white rounded-full font-semibold hover:bg-[#1A237E]/90 transform hover:scale-105 transition shadow-lg"
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}