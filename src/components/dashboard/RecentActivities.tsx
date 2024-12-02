import { Gamepad, Wallet, MessageSquare } from 'lucide-react';
import type { RecentActivity } from '../../types/dashboard';

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  const getIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'game':
        return Gamepad;
      case 'withdrawal':
        return Wallet;
      case 'feedback':
        return MessageSquare;
      default:
        return Gamepad;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{activity.title}</h3>
                  {activity.amount && (
                    <span className="text-green-600 font-medium">₹{activity.amount}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                  {activity.status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}