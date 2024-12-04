import React from 'react';
import { Coins, Ticket, Star, Trophy, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import TambolaTicket from './TambolaTicket';

const FloatingElement = ({ children, className }: { children: React.ReactNode; className: string }) => (
  <motion.div 
    className={`absolute ${className}`}
    animate={{
      y: [0, -10, 0],
      rotate: [-5, 5, -5]
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.div>
);

interface HeroProps {
  onHost: () => void;
  onJoin: () => void;
}

export default function Hero({ onHost, onJoin }: HeroProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#FF5722] via-[#FF8A65] to-[#1A237E] overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 animate-slide"></div>
      
      {/* Floating Elements */}
      <FloatingElement className="top-1/4 left-1/4">
        <Ticket className="w-12 h-12 text-white/80" />
      </FloatingElement>
      <FloatingElement className="top-1/3 right-1/4">
        <Coins className="w-10 h-10 text-[#FFD700]" />
      </FloatingElement>
      <FloatingElement className="bottom-1/4 left-1/3">
        <Trophy className="w-12 h-12 text-[#FFD700]/80" />
      </FloatingElement>
      <FloatingElement className="top-1/2 right-1/3">
        <Star className="w-8 h-8 text-white/60" />
      </FloatingElement>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 py-32 flex flex-col lg:flex-row items-center justify-between">
        <motion.div 
          className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Host Epic <span className="text-[#FFD700]">Tambola</span> Games Online
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-2xl">
            Create unforgettable moments with friends and family. Host games, win prizes, 
            and enjoy the classic game of Tambola in a modern way!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
            <motion.button 
              onClick={onHost}
              className="group px-8 py-4 bg-[#FFD700] text-[#1A237E] rounded-full font-semibold hover:bg-white transform hover:scale-105 transition shadow-lg flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Host Game
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              onClick={onJoin}
              className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-full font-semibold hover:bg-white/20 transform hover:scale-105 transition shadow-lg flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join Game
              <Users className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
            </motion.button>
          </div>
        </motion.div>

        {/* 3D Ticket Mockup */}
        <motion.div 
          className="lg:w-1/2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative p-8">
            <TambolaTicket />
            {/* Shadow and Glow Effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl filter blur-xl -z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF5722]/20 to-[#1A237E]/20 rounded-3xl filter blur-3xl -z-20 animate-pulse"></div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/10 backdrop-blur-md">
          <div className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Stat number="10K+" label="Active Players" />
              <Stat number="₹1M+" label="Prizes Won" />
              <Stat number="1000+" label="Games Hosted" />
              <Stat number="4.9" label="User Rating" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Stat = ({ number, label }: { number: string; label: string }) => (
  <motion.div 
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.5 }}
  >
    <div className="text-2xl md:text-3xl font-bold text-white mb-1">{number}</div>
    <div className="text-sm text-white/80">{label}</div>
  </motion.div>
);