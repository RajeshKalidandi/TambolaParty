import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, ArrowLeft, GamepadIcon, Coins, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../lib/auth/AuthContext';
import { supabase } from '../lib/supabase';
import type { Notification } from '../types/wallet';

export default function Notifications() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) throw error;

      // Update local state to reflect the change
      setNotifications(prev =>
        prev.map((notification): Notification => ({
          ...notification,
          read: true
        }))
      );
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      void fetchNotifications();
      void markAllAsRead();

      // Subscribe to notification changes
      const notificationSubscription = supabase
        .channel('notification_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new) {
              const newNotification = payload.new as Notification;
              setNotifications(prev => [newNotification, ...prev]);
              
              // Show toast notification based on type
              const { type, title } = newNotification;
              const toastIcon = type === 'game' ? '🎮' : 
                              type === 'wallet' ? '💰' : 
                              type === 'win' ? '🏆' : '🔔';
              
              toast(title, {
                icon: toastIcon,
                duration: 4000,
                position: 'top-right'
              });
            }
          }
        )
        .subscribe();

      // Automatically mark notifications as read when viewed
      const markAsReadTimeout = setTimeout(() => {
        void markAllAsRead();
      }, 2000);

      return () => {
        notificationSubscription.unsubscribe();
        clearTimeout(markAsReadTimeout);
      };
    }
  }, [user?.id]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'game':
        return <GamepadIcon className="w-6 h-6 text-cyan-500" />;
      case 'wallet':
        return <Coins className="w-6 h-6 text-green-500" />;
      case 'win':
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center">
        <Link to="/lobby" className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      {/* Notifications List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`bg-gray-800 rounded-lg p-4 ${
                  !notification.read ? 'border-l-4 border-cyan-500' : ''
                }`}
              >
                <div className="flex gap-4">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{notification.title}</h3>
                    <p className="text-sm text-gray-400">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}