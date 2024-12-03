import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth/AuthContext';
import { supabase } from '../lib/supabase';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import QuickActions from '../components/dashboard/QuickActions';
import StatisticsGrid from '../components/dashboard/StatisticsGrid';
import RecentActivities from '../components/dashboard/RecentActivities';
import type { HostStats, RecentActivity } from '../types/dashboard';
import type { Database } from '../lib/supabase';

type Room = Database['public']['Tables']['rooms']['Row'];
type HostActivity = Database['public']['Tables']['host_activities']['Row'];

export default function HostDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<HostStats>({
    totalEarnings: 0,
    rating: 0,
    gamesHosted: 0,
    todayGames: 0,
    activePlayers: 0,
    successRate: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    void loadHostStats();
    void loadRecentActivities();

    // Subscribe to real-time updates
    const roomsChannel = supabase
      .channel('host-rooms')
      .on<Room>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `host_id=eq.${user.id}`,
        },
        () => {
          void loadHostStats();
        }
      )
      .subscribe();

    const activitiesChannel = supabase
      .channel('host-activities')
      .on<HostActivity>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'host_activities',
          filter: `host_id=eq.${user.id}`,
        },
        (payload) => {
          setActivities((prev) => [transformActivity(payload.new), ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(roomsChannel);
      void supabase.removeChannel(activitiesChannel);
    };
  }, [user?.id]);

  const loadHostStats = async () => {
    if (!user?.id) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const roomsPromise = supabase
        .from('rooms')
        .select('id, status, ticket_price, max_players, created_at')
        .eq('host_id', user.id);

      const ratingsPromise = supabase
        .from('host_ratings')
        .select('rating')
        .eq('host_id', user.id);

      const activeRoomsPromise = supabase
        .from('rooms')
        .select('id')
        .eq('host_id', user.id)
        .eq('status', 'active');

      const [roomsData, ratingsData, activeRooms] = await Promise.all([
        roomsPromise,
        ratingsPromise,
        activeRoomsPromise,
      ]);

      if (roomsData.error) throw roomsData.error;
      if (ratingsData.error) throw ratingsData.error;
      if (activeRooms.error) throw activeRooms.error;

      const playersData = await supabase
        .from('room_players')
        .select('room_id', { count: 'exact' })
        .in('room_id', activeRooms.data?.map((r) => r.id) || []);

      if (playersData.error) throw playersData.error;

      const completedGames = roomsData.data.filter((r) => r.status === 'completed');
      const totalEarnings = completedGames.reduce(
        (sum, room) => sum + (room.ticket_price * room.max_players * 0.1),
        0
      ); // Assuming 10% host commission

      const todayGames = roomsData.data.filter(
        (r) => new Date(r.created_at) >= today
      ).length;

      const avgRating =
        ratingsData.data.reduce((sum, r) => sum + r.rating, 0) /
        (ratingsData.data.length || 1);

      const successRate = (completedGames.length / (roomsData.data.length || 1)) * 100;

      setStats({
        totalEarnings: Math.round(totalEarnings),
        rating: Number(avgRating.toFixed(1)),
        gamesHosted: completedGames.length,
        todayGames,
        activePlayers: playersData.count || 0,
        successRate: Math.round(successRate),
      });
    } catch (error) {
      console.error('Error loading host stats:', error);
    }
  };

  const loadRecentActivities = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('host_activities')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setActivities(data.map(transformActivity));
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const transformActivity = (activity: HostActivity): RecentActivity => ({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    amount: activity.amount,
    timestamp: new Date(activity.created_at).getTime(),
    status: activity.status,
  });

  if (!user) {
    return null; // or redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DashboardHeader stats={stats} />
        <QuickActions />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <StatisticsGrid initialStats={stats} />
          </div>
          <div>
            <RecentActivities activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}