import { useEffect, useState } from 'react';
import { Trophy, Check, X, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Claim {
  id: string;
  player_id: string;
  player_name: string;
  prize_type: 'early_five' | 'top_line' | 'middle_line' | 'bottom_line' | 'full_house';
  ticket_numbers: number[];
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

interface ClaimsFeedProps {
  gameId: string;
  isHost?: boolean;
}

const prizeNames = {
  early_five: 'Early Five',
  top_line: 'Top Line',
  middle_line: 'Middle Line',
  bottom_line: 'Bottom Line',
  full_house: 'Full House'
};

export default function ClaimsFeed({ gameId, isHost }: ClaimsFeedProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClaims();

    // Subscribe to claim updates
    const channel = supabase
      .channel(`game-claims-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_claims',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setClaims(prev => [payload.new as Claim, ...prev]);
            // Play notification sound for new claims
            const audio = new Audio('/claim-notification.mp3');
            audio.play().catch(console.error);
          } else if (payload.eventType === 'UPDATE') {
            setClaims(prev =>
              prev.map(c => (c.id === payload.new.id ? { ...c, ...payload.new } : c))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const loadClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('game_claims')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setClaims(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading claims:', error);
      toast.error('Failed to load claims');
      setLoading(false);
    }
  };

  const handleClaim = async (claimId: string, status: 'verified' | 'rejected') => {
    if (!isHost) return;

    try {
      const { error } = await supabase
        .from('game_claims')
        .update({ status })
        .eq('id', claimId);

      if (error) throw error;

      // If verified, update the game's winning_pattern
      if (status === 'verified') {
        const claim = claims.find(c => c.id === claimId);
        if (claim) {
          const { error: gameError } = await supabase
            .from('games')
            .update({
              winning_pattern: {
                [claim.prize_type]: true
              }
            })
            .eq('id', gameId);

          if (gameError) throw gameError;
        }
      }

      toast.success(`Claim ${status === 'verified' ? 'verified' : 'rejected'}`);
    } catch (error) {
      console.error('Error updating claim:', error);
      toast.error('Failed to update claim');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-gray-400" />
        <h3 className="text-gray-300 font-medium">Recent Claims</h3>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="bg-gray-700/50 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-medium">
                  {claim.player_name}
                </span>
                <span className="text-gray-400">claimed</span>
                <span className="text-gray-300">{prizeNames[claim.prize_type]}</span>
              </div>
              {claim.status === 'pending' ? (
                <Clock className="w-5 h-5 text-yellow-500" />
              ) : claim.status === 'verified' ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              {claim.ticket_numbers.map((num) => (
                <span
                  key={num}
                  className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300"
                >
                  {num}
                </span>
              ))}
            </div>

            {isHost && claim.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleClaim(claim.id, 'verified')}
                  className="flex-1 px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-500 transition-colors"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleClaim(claim.id, 'rejected')}
                  className="flex-1 px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-500 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}

            <div className="text-xs text-gray-500">
              {new Date(claim.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}

        {claims.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No claims yet
          </div>
        )}
      </div>
    </div>
  );
}