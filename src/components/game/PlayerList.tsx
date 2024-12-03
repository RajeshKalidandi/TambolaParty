import { useEffect, useState } from 'react';
import { User, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Player {
  id: string;
  user_id: string;
  player_name: string;
  status: 'active' | 'away' | 'offline';
  tickets: any[];
  joined_at: string;
}

interface PlayerListProps {
  gameId: string;
  currentUserId?: string;
}

export default function PlayerList({ gameId, currentUserId }: PlayerListProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();

    // Subscribe to player updates
    const channel = supabase
      .channel(`game-players-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlayers(prev => [...prev, payload.new as Player]);
          } else if (payload.eventType === 'DELETE') {
            setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setPlayers(prev =>
              prev.map(p => (p.id === payload.new.id ? { ...p, ...payload.new } : p))
            );
          }
        }
      )
      .subscribe();

    // Update current user's status periodically
    const statusInterval = setInterval(updateUserStatus, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(statusInterval);
    };
  }, [gameId, currentUserId]);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error('Failed to load players');
      setLoading(false);
    }
  };

  const updateUserStatus = async () => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('game_players')
        .update({ status: 'active' })
        .eq('game_id', gameId)
        .eq('user_id', currentUserId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-gray-400" />
        <h3 className="text-gray-300 font-medium">Players ({players.length})</h3>
      </div>
      
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors
              ${player.user_id === currentUserId ? 'bg-gray-700/50' : ''}`}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-800
                  ${
                    player.status === 'active'
                      ? 'bg-green-500'
                      : player.status === 'away'
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
                  }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-300 text-sm truncate">
                {player.player_name}
                {player.user_id === currentUserId && ' (You)'}
              </p>
              <p className="text-gray-500 text-xs">
                {player.tickets.length} ticket{player.tickets.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}

        {players.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No players have joined yet
          </div>
        )}
      </div>
    </div>
  );
}