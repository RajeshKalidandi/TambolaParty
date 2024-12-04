import { useNavigate } from 'react-router-dom';
import { Plus, Wallet, BarChart2, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function QuickActions() {
  const navigate = useNavigate();

  const handleWithdraw = () => {
    navigate('/payments/withdraw');
  };

  const handleAnalytics = () => {
    navigate('/analytics');
  };

  const handleSupport = () => {
    window.open('https://support.tambolaparty.com/chat', '_blank');
  };

  const actions = [
    {
      icon: Plus,
      label: 'Create Room',
      description: 'Start a new game session',
      gradient: 'from-[#FF5722] to-[#FF8A65]',
      onClick: () => navigate('/create'),
    },
    {
      icon: Wallet,
      label: 'Withdraw',
      description: 'Cash out your earnings',
      gradient: 'from-[#FFD700] to-[#FFA000]',
      onClick: handleWithdraw,
    },
    {
      icon: BarChart2,
      label: 'Analytics',
      description: 'View detailed insights',
      gradient: 'from-[#1A237E] to-[#3949AB]',
      onClick: handleAnalytics,
    },
    {
      icon: MessageCircle,
      label: 'Support',
      description: '24/7 customer service',
      gradient: 'from-purple-500 to-purple-700',
      onClick: handleSupport,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show" 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8"
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          variants={item}
          onClick={action.onClick}
          className="relative group text-left"
        >
          {/* Glow Effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-25`}></div>
          
          {/* Card Content */}
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 h-full hover:transform hover:scale-105 transition-all duration-300">
            <div className={`bg-gradient-to-br ${action.gradient} rounded-2xl p-4 mb-4 w-fit`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">{action.label}</h3>
            <p className="text-gray-400 text-sm mb-4">{action.description}</p>
            
            <div className="flex items-center text-white/60 group-hover:text-white transition-colors">
              <span className="text-sm">Get Started</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 p-4">
              <div className="w-2 h-2 rounded-full bg-white/20"></div>
            </div>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}