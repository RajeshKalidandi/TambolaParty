import React from 'react';
import { Edit, Wallet, Trophy, History, ArrowRight } from 'lucide-react';

const PlayerProfile: React.FC = () => {
  // Mock data - replace with actual data from your backend
  const profile = {
    name: "Rahul Kumar",
    username: "@rahulk",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
    gamesPlayed: 45,
    winningPercentage: 68,
    walletBalance: 2500,
    statistics: {
      totalWinnings: 12000,
      favoriteHosts: [
        { id: "1", name: "Party Games", gamesPlayed: 15 },
        { id: "2", name: "Family Fun", gamesPlayed: 12 }
      ],
      luckyNumbers: [7, 15, 45, 67, 90]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 text-white p-4">
      {/* Top Section */}
      <div className="relative rounded-xl bg-white/10 backdrop-blur-lg p-6 mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={profile.profilePicture}
              alt="Profile"
              className="w-20 h-20 rounded-full border-2 border-purple-400"
            />
            <button className="absolute bottom-0 right-0 bg-purple-500 p-1 rounded-full">
              <Edit size={16} />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-purple-300">{profile.username}</p>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <div className="text-center">
            <p className="text-xl font-bold">{profile.gamesPlayed}</p>
            <p className="text-sm text-purple-300">Games</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{profile.winningPercentage}%</p>
            <p className="text-sm text-purple-300">Win Rate</p>
          </div>
        </div>
      </div>

      {/* Middle Section - Wallet & Quick Actions */}
      <div className="rounded-xl bg-white/10 backdrop-blur-lg p-6 mb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-purple-300">Wallet Balance</p>
            <p className="text-2xl font-bold">₹{profile.walletBalance}</p>
          </div>
          <Wallet className="text-purple-400" size={24} />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Join Game", icon: Trophy },
            { title: "Buy Tickets", icon: Wallet },
            { title: "Withdraw", icon: ArrowRight },
            { title: "History", icon: History }
          ].map((action, index) => (
            <button
              key={index}
              className="flex items-center justify-center space-x-2 bg-purple-700 hover:bg-purple-600 
                         transition-colors rounded-lg p-3"
            >
              <action.icon size={18} />
              <span>{action.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="rounded-xl bg-white/10 backdrop-blur-lg p-6">
        <h2 className="text-xl font-bold mb-4">Statistics</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-purple-300">Total Winnings</p>
            <p className="font-bold">₹{profile.statistics.totalWinnings}</p>
          </div>
          
          <div>
            <p className="text-purple-300 mb-2">Favorite Hosts</p>
            <div className="space-y-2">
              {profile.statistics.favoriteHosts.map(host => (
                <div key={host.id} className="flex justify-between items-center bg-purple-800/50 rounded-lg p-2">
                  <span>{host.name}</span>
                  <span className="text-sm">{host.gamesPlayed} games</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-purple-300 mb-2">Lucky Numbers</p>
            <div className="flex flex-wrap gap-2">
              {profile.statistics.luckyNumbers.map(number => (
                <div key={number} 
                     className="w-8 h-8 flex items-center justify-center bg-purple-700 rounded-full">
                  {number}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;