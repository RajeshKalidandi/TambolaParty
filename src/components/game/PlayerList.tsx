import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Circle } from 'lucide-react';
import { RealtimePostgresChangesPayload, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Ticket {
  id: string;
  numbers: number[][];
  claims: Array<{
    type: string;
    claimed: boolean;
    timestamp?: number;
  }>;
}

interface Player {
  id: string;
  user_id: string;
  player_name: string;
  status: 'active' | 'away' | 'offline';
  tickets: Ticket[];
  joined_at: string;
  updated_at?: string;
}

interface PlayerListProps {
  gameId: string;
  currentUserId?: string;
}

const statusColors = {
  active: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-500'
};

const PlayerList: React.FC<PlayerListProps> = ({ gameId, currentUserId }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadPlayers();

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
        (payload: RealtimePostgresChangesPayload<Player>) => {
          if (payload.eventType === 'INSERT') {
            setPlayers(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setPlayers(prev =>
              prev.map(p => (p.id === payload.new.id ? payload.new : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [gameId]);

  const loadPlayers = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId)
        .order('joined_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      setPlayers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load players');
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

  const sortedPlayers = [...players].sort((a, b) => {
    // Sort by status (active first, then away, then offline)
    const statusOrder = { active: 0, away: 1, offline: 2 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Then sort by name
    return a.player_name.localeCompare(b.player_name);
  });

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Players</h2>
        </div>
        <span className="text-sm text-gray-400">
          {players.filter(p => p.status === 'active').length}/{players.length} Online
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {sortedPlayers.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`p-3 rounded-lg ${
                player.user_id === currentUserId
                  ? 'bg-purple-500/20 border border-purple-500/30'
                  : 'bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <motion.div
                    initial={false}
                    animate={{
                      scale: player.status === 'active' ? [1, 1.2, 1] : 1,
                      transition: { repeat: Infinity, duration: 2 }
                    }}
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 
                              ${statusColors[player.status]}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {player.player_name}
                    {player.user_id === currentUserId && (
                      <span className="ml-2 text-xs text-purple-400">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {player.status === 'active' ? 'Online' : player.status}
                  </p>
                </div>
                <motion.div
                  animate={player.status === 'active' ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center gap-1"
                >
                  <Circle className={`w-2 h-2 ${
                    player.status === 'active' ? 'text-green-500' :
                    player.status === 'away' ? 'text-yellow-500' : 'text-gray-500'
                  }`} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {players.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-400"
          >
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No players yet</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlayerList;