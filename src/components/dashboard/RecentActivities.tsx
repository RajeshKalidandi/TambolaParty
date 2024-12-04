import { useState } from 'react';
import { Gamepad, Wallet, MessageSquare, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RecentActivity } from '../../types/dashboard';

interface RecentActivitiesProps {
  activities: RecentActivity[];
  itemsPerPage?: number;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'game':
      return <Gamepad className="w-8 h-8 text-[#FF5722]" />;
    case 'transaction':
      return <Wallet className="w-8 h-8 text-[#FFD700]" />;
    case 'message':
      return <MessageSquare className="w-8 h-8 text-purple-500" />;
    default:
      return null;
  }
};

const getActivityGradient = (type: string) => {
  switch (type) {
    case 'game':
      return 'from-[#FF5722] to-[#FF8A65]';
    case 'transaction':
      return 'from-[#FFD700] to-[#FFA000]';
    case 'message':
      return 'from-purple-500 to-purple-700';
    default:
      return 'from-gray-500 to-gray-700';
  }
};

export default function RecentActivities({ activities, itemsPerPage = 5 }: RecentActivitiesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  
  const paginatedActivities = activities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[#FFD700]" />
            <h2 className="text-xl font-semibold text-white">Recent Activities</h2>
          </div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {paginatedActivities.map((activity) => (
              <motion.div 
                key={activity.id}
                variants={item}
                layout
                className="relative group"
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getActivityGradient(activity.type)} rounded-xl blur-lg group-hover:blur-xl transition-all opacity-10`}></div>
                
                {/* Content */}
                <div className="relative flex items-start gap-4 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                  <div className={`flex-shrink-0 p-2 bg-gradient-to-br ${getActivityGradient(activity.type)} rounded-lg`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <h3 className="text-white font-medium truncate">
                      {activity.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {activity.amount && (
                        <span className={`text-xs font-medium ${
                          activity.amount > 0 ? 'text-[#4CAF50]' : 'text-red-500'
                        }`}>
                          {activity.amount > 0 ? '+' : ''}{activity.amount} ₹
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </motion.button>
            
            <span className="text-sm text-white/60">
              Page {currentPage} of {totalPages}
            </span>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}