import { ClipboardList, Users, Trophy, Gamepad2, Ticket, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const Step = ({ number, icon: Icon, title, description, delay }: { 
  number: number, 
  icon: any, 
  title: string, 
  description: string,
  delay: number 
}) => (
  <motion.div 
    className="relative flex flex-col items-center max-w-sm mx-auto"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="relative mb-8">
      <div className="w-20 h-20 bg-gradient-to-br from-[#FF5722] to-[#1A237E] rounded-2xl flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
        <Icon className="w-10 h-10 text-white" />
      </div>
      <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center text-[#1A237E] font-bold text-lg shadow-lg">
        {number}
      </div>
    </div>
    <h3 className="text-2xl font-semibold mb-4 text-gray-900">{title}</h3>
    <p className="text-gray-600 text-center max-w-xs leading-relaxed">{description}</p>
  </motion.div>
);

export default function HowToPlay() {
  const steps = [
    {
      icon: ClipboardList,
      title: "Create or Join",
      description: "Start a new game as host or join an existing game with a room code. It's quick and easy!"
    },
    {
      icon: Ticket,
      title: "Get Your Tickets",
      description: "Choose from a variety of ticket options. The more tickets you have, the better your chances!"
    },
    {
      icon: Users,
      title: "Invite Players",
      description: "Share the game code with friends and family. Play with people from anywhere in the world!"
    },
    {
      icon: Gamepad2,
      title: "Play Together",
      description: "Numbers are called out in real-time. Mark them on your digital tickets with just a tap!"
    },
    {
      icon: Trophy,
      title: "Win Prizes",
      description: "Claim your prizes for Early 5, Lines, and Full House. Winnings are instantly credited!"
    },
    {
      icon: Gift,
      title: "Earn Rewards",
      description: "Get bonus points and special rewards for hosting games and participating regularly!"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#FF5722] to-[#1A237E] bg-clip-text text-transparent">
            How to Play
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started with TambolaParty in just a few simple steps. 
            Host or join games, win prizes, and have fun with friends!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {steps.map((step, index) => (
            <Step 
              key={index} 
              number={index + 1} 
              {...step} 
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <a 
            href="/register"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#FF5722] to-[#1A237E] text-white rounded-full font-semibold hover:opacity-90 transform hover:scale-105 transition shadow-lg"
          >
            Start Playing Now
            <Trophy className="w-5 h-5 ml-2" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}