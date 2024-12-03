import { useNavigate } from 'react-router-dom';
import { Plus, Wallet, BarChart2, MessageCircle } from 'lucide-react';
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
    // Open support chat or navigate to support page
    window.open('https://support.tambolaparty.com/chat', '_blank');
  };

  const actions = [
    {
      icon: Plus,
      label: 'Create Room',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => navigate('/create'),
    },
    {
      icon: Wallet,
      label: 'Withdraw Earnings',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: handleWithdraw,
    },
    {
      icon: BarChart2,
      label: 'View Analytics',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: handleAnalytics,
    },
    {
      icon: MessageCircle,
      label: 'Support Chat',
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: handleSupport,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`${action.color} text-white rounded-xl p-4 transition-all duration-200 
                     hover:shadow-lg hover:scale-105 flex flex-col items-center gap-2`}
        >
          <action.icon className="w-6 h-6" />
          <span className="font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
}