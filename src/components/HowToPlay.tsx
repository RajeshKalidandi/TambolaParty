import React from 'react';
import { ClipboardList, Users, Trophy } from 'lucide-react';

const Step = ({ number, icon: Icon, title, description }: { number: number, icon: any, title: string, description: string }) => (
  <div className="flex flex-col items-center">
    <div className="relative">
      <div className="w-16 h-16 bg-[#1A237E] rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <span className="absolute -top-2 -right-2 w-8 h-8 bg-[#FF5722] rounded-full flex items-center justify-center text-white font-bold">
        {number}
      </span>
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 text-center max-w-xs">{description}</p>
  </div>
);

export default function HowToPlay() {
  const steps = [
    {
      icon: ClipboardList,
      title: "Create or Join",
      description: "Start a new game as host or join an existing game with a code"
    },
    {
      icon: Users,
      title: "Invite Players",
      description: "Share the game code with friends and family to join the fun"
    },
    {
      icon: Trophy,
      title: "Play & Win",
      description: "Mark numbers as they're called and claim your prizes!"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">How to Play</h2>
        <div className="flex flex-col md:flex-row justify-around items-center gap-12">
          {steps.map((step, index) => (
            <Step key={index} number={index + 1} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}