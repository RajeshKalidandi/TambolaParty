import React from 'react';
import { Coins, Banknote, Smartphone, PartyPopper, Shield, Zap, Gift, Users2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Feature = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div 
    className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="p-4 bg-gradient-to-br from-[#FF5722] to-[#1A237E] rounded-2xl mb-6 transform hover:rotate-6 transition-transform">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-600 text-center">{description}</p>
  </motion.div>
);

export default function Features() {
  const features = [
    {
      icon: Coins,
      title: "Host & Earn",
      description: "Create games and earn rewards for hosting exciting tambola sessions. Set your own prize pools!"
    },
    {
      icon: Banknote,
      title: "Zero Platform Fee",
      description: "No hidden charges or platform fees. Keep 100% of what you earn from hosting games."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Bank-grade security for all transactions. Your money is always safe with us."
    },
    {
      icon: Zap,
      title: "Real-time Experience",
      description: "Enjoy smooth, lag-free gameplay with our advanced real-time technology."
    },
    {
      icon: Gift,
      title: "Special Events",
      description: "Join tournament modes and special events with bigger prize pools and rewards."
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Play anywhere, anytime. Our platform works perfectly on all devices."
    },
    {
      icon: Users2,
      title: "Community Events",
      description: "Join a vibrant community of players and participate in exclusive events."
    },
    {
      icon: PartyPopper,
      title: "Perfect for Events",
      description: "Ideal for parties, corporate events, and family gatherings. Custom game modes available!"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#FF5722] to-[#1A237E] bg-clip-text text-transparent">
            Why Choose TambolaParty?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the most advanced and user-friendly platform for playing Tambola online.
            Host games, win big, and have fun with friends and family!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Feature 
              key={index} 
              {...feature} 
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}