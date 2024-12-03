import React, { useEffect, useState } from 'react';
import { Edit, Wallet, Trophy, History, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { supabase, Database } from '../lib/supabase';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type Player = Database['public']['Tables']['players']['Row'];

interface PlayerData extends Omit<Player, 'id' | 'created_at'> {
  username: string;
  avatar_url: string;
  wallet_balance: number;
  games_played: number;
  games_won: number;
  rating: number;
}

// WithdrawModal Component
const WithdrawModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  playerData: PlayerData | null;
  userId: string;
}> = ({ isOpen, onClose, playerData, userId }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!userId || !amount || isNaN(Number(amount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    const withdrawAmount = Number(amount);
    if (withdrawAmount <= 0 || withdrawAmount > (playerData?.wallet_balance || 0)) {
      toast.error('Invalid withdrawal amount');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('players')
        .update({ 
          wallet_balance: (playerData?.wallet_balance || 0) - withdrawAmount 
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Successfully withdrew ₹${withdrawAmount}`);
      onClose();
    } catch (error) {
      toast.error('Failed to process withdrawal');
      console.error('Withdrawal error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-purple-900 rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">Withdraw Funds</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-purple-300 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-purple-800 rounded px-3 py-2 text-white"
              placeholder="Enter amount"
              min="0"
              max={playerData?.wallet_balance}
            />
          </div>
          <div className="text-sm text-purple-300">
            Available Balance: ₹{playerData?.wallet_balance}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-purple-700 hover:bg-purple-600 transition-colors rounded-lg p-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleWithdraw()}
              disabled={isLoading}
              className="flex-1 bg-purple-500 hover:bg-purple-400 transition-colors rounded-lg p-2 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PlayerProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    // Fetch initial player data
    const fetchPlayerData = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        toast.error('Error fetching profile data');
        return;
      }

      setPlayerData(data as PlayerData);
      setNewUsername(data.username);
    };

    void fetchPlayerData();

     // Subscribe to real-time changes
     const subscription = supabase
     .channel('player_changes')
     .on<PlayerData>(
       'postgres_changes',
       {
         event: '*',
         schema: 'public',
         table: 'players',
         filter: `id=eq.${user?.id}`,
       },
       (payload) => {
         if (payload.new && 'username' in payload.new) {
           setPlayerData(payload.new as PlayerData);
         }
       }
     )
     .subscribe();

   return () => {
     void subscription.unsubscribe();
   };
  }, [user]);

  const handleUpdateUsername = async () => {
    if (!user || !newUsername.trim()) return;

    const { error } = await supabase
      .from('players')
      .update({ username: newUsername })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update username');
      return;
    }

    setIsEditing(false);
    toast.success('Username updated successfully');
  };

  const handleButtonClick = (action: string) => {
    switch (action) {
      case 'Join Game':
        navigate('/lobby');
        break;
      case 'Buy Tickets':
        navigate('/tickets');
        break;
      case 'Withdraw':
        setIsWithdrawModalOpen(true);
        break;
      case 'History':
        navigate('/history');
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };

  if (!playerData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 
                    flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }

  const winRate = playerData.games_played > 0 
    ? Math.round((playerData.games_won / playerData.games_played) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 text-white p-4">
      {/* Top Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl bg-white/10 backdrop-blur-lg p-6 mb-4"
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={playerData.avatar_url}
              alt="Profile"
              className="w-20 h-20 rounded-full border-2 border-purple-400"
            />
            <button 
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="absolute bottom-0 right-0 bg-purple-500 p-1 rounded-full hover:bg-purple-400 transition-colors"
            >
              <Edit size={16} />
            </button>
          </div>
          <div>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-purple-800 rounded px-2 py-1 text-white"
                />
                <button
                  type="button"
                  onClick={() => void handleUpdateUsername()}
                  className="bg-purple-500 px-3 py-1 rounded hover:bg-purple-400 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <motion.h1 
                key={playerData.username}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold"
              >
                {playerData.username}
              </motion.h1>
            )}
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-xl font-bold">{playerData.games_played}</p>
            <p className="text-sm text-purple-300">Games</p>
          </motion.div>
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-xl font-bold">{winRate}%</p>
            <p className="text-sm text-purple-300">Win Rate</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Wallet Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-white/10 backdrop-blur-lg p-6 mb-4"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-purple-300">Wallet Balance</p>
            <motion.p 
              key={playerData.wallet_balance}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold"
            >
              ₹{playerData.wallet_balance}
            </motion.p>
          </div>
          <Wallet className="text-purple-400" size={24} />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Join Game", icon: Trophy },
            { title: "Buy Tickets", icon: Wallet },
            { title: "Withdraw", icon: ArrowRight },
            { title: "History", icon: History }
          ].map((action) => (
            <motion.button
              type="button"
              key={action.title}
              onClick={() => handleButtonClick(action.title)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center space-x-2 bg-purple-700 hover:bg-purple-600 
                       transition-colors rounded-lg p-3"
            >
              <action.icon size={18} />
              <span>{action.title}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Statistics Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl bg-white/10 backdrop-blur-lg p-6"
      >
        <h2 className="text-xl font-bold mb-4">Statistics</h2>
        <div className="space-y-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex justify-between items-center"
          >
            <p className="text-purple-300">Rating</p>
            <p className="font-bold">{playerData.rating}</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex justify-between items-center"
          >
            <p className="text-purple-300">Games Won</p>
            <p className="font-bold">{playerData.games_won}</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Render WithdrawModal */}
      <WithdrawModal 
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        playerData={playerData}
        userId={user?.id || ''}
      />
    </div>
  );
};

export default PlayerProfile;