import { useState, useEffect } from 'react';
import { subscribeToRoom } from '../game';
import type { Database } from '../supabase';

type Room = Database['public']['Tables']['rooms']['Row'];
type Player = Database['public']['Tables']['players']['Row'];

export const useGame = (roomId: string) => {
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStatus, setGameStatus] = useState<Room['status']>('waiting');
  const [claims, setClaims] = useState<Array<{
    type: string;
    playerId: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomId, {
      onNumberCalled: (number) => {
        setCalledNumbers(prev => [...prev, number]);
      },
      onPlayerJoined: (player) => {
        setPlayers(prev => [...prev, player]);
      },
      onClaimMade: (claim) => {
        setClaims(prev => [...prev, { ...claim, timestamp: new Date().toISOString() }]);
      },
      onGameStateChange: (status) => {
        setGameStatus(status);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  return {
    calledNumbers,
    players,
    gameStatus,
    claims
  };
};