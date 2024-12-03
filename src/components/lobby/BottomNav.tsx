import { useEffect, useState } from 'react';
import { GamepadIcon, Ticket, Coins, User, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { useAuth } from '../../lib/auth/AuthContext';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  active?: boolean;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, path, active = false, badge }) => (
  <Link 
    to={path}
    className={`relative flex flex-col items-center gap-1 flex-1 p-2 transition-colors ${
      active ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-300'
    }`}
  >
    <Icon size={24} />
    <span className="text-xs">{label}</span>
    {badge !== undefined && badge > 0 && (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
      >
        {badge}
      </motion.span>
    )}
  </Link>
);

const BottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();
  const [activeGames, setActiveGames] = useState<number>(0);
  const [notifications, setNotifications] = useState<number>(0);
  const [walletUpdates, setWalletUpdates] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;

    void loadCounts();

    const gameChannel = supabase
      .channel(`user-games-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void loadActiveGames();
        }
      )
      .subscribe();

    const notificationChannel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setNotifications((prev) => prev + 1);
        }
      )
      .subscribe();

    const walletChannel = supabase
      .channel(`user-wallet-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setWalletUpdates((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(gameChannel);
      void supabase.removeChannel(notificationChannel);
      void supabase.removeChannel(walletChannel);
    };
  }, [user?.id]);

  const loadCounts = async (): Promise<void> => {
    if (!user?.id) return;
    await Promise.all([
      loadActiveGames(),
      loadNotifications(),
      loadWalletUpdates(),
    ]);
  };

  const loadActiveGames = async (): Promise<void> => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('game_players')
        .select('game_id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      setActiveGames(data?.length ?? 0);
    } catch (error) {
      console.error('Error loading active games:', error);
    }
  };

  const loadNotifications = async (): Promise<void> => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      setNotifications(data?.length ?? 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadWalletUpdates = async (): Promise<void> => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('seen', false);

      if (error) throw error;
      setWalletUpdates(data?.length ?? 0);
    } catch (error) {
      console.error('Error loading wallet updates:', error);
    }
  };

  const navItems = [
    { icon: GamepadIcon, label: 'Games', path: '/lobby', badge: activeGames },
    { icon: Ticket, label: 'Tickets', path: '/tickets' },
    { icon: Coins, label: 'Wallet', path: '/wallet', badge: walletUpdates },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: notifications },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex items-center justify-around px-2 py-1">
      {navItems.map((item) => (
        <NavItem
          key={item.path}
          {...item}
          active={currentPath === item.path}
        />
      ))}
    </nav>
  );
};

export default BottomNav;