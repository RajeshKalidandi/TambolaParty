import { useState } from 'react';
import { Gamepad, Wallet, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import type { RecentActivity } from '../../types/dashboard';

interface RecentActivitiesProps {
  activities: RecentActivity[];
  itemsPerPage?: number;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'game':
      return <Gamepad className="w-8 h-8 text-cyan-500" />;
    case 'transaction':
      return <Wallet className="w-8 h-8 text-green-500" />;
    case 'message':
      return <MessageSquare className="w-8 h-8 text-purple-500" />;
    default:
      return null;
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

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
      <div className="space-y-4">
        {paginatedActivities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {activity.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {activity.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
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
                    activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.amount > 0 ? '+' : ''}{activity.amount} ₹
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}