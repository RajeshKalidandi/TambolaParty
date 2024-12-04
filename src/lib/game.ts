import { supabase } from './supabase';
import type { Database } from './supabase';

type Room = Database['public']['Tables']['rooms']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type Ticket = Database['public']['Tables']['tickets']['Row'];

// Create a new game room
export const createRoom = async (roomData: Omit<Room, 'id' | 'created_at'>) => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      ...roomData,
      code,
      prizes: {
        full_house: roomData.prizes.fullHouse,
        early_five: roomData.prizes.earlyFive,
        top_line: roomData.prizes.topLine,
        middle_line: roomData.prizes.middleLine,
        bottom_line: roomData.prizes.bottomLine
      }
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Join a game room
export const joinRoom = async (roomId: string, playerId: string) => {
  // First check if room exists and has space
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*, players(*)')
    .eq('id', roomId)
    .single();

  if (roomError) throw roomError;
  if (!room) throw new Error('Room not found');
  
  // Generate ticket numbers (5x3 grid, numbers 1-90)
  const numbers = generateTicketNumbers();
  
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      room_id: roomId,
      player_id: playerId,
      numbers,
      claims: {
        full_house: false,
        top_line: false,
        middle_line: false,
        bottom_line: false
      }
    })
    .select()
    .single();

  if (ticketError) throw ticketError;
  return ticket;
};

// Subscribe to room updates
export const subscribeToRoom = (
  roomId: string,
  callbacks: {
    onNumberCalled?: (number: number) => void;
    onPlayerJoined?: (player: Player) => void;
    onClaimMade?: (claim: { type: string; playerId: string }) => void;
    onGameStateChange?: (status: Room['status']) => void;
  }
) => {
  const subscription = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'game_numbers',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => callbacks.onNumberCalled?.(payload.new.number)
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tickets',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => callbacks.onPlayerJoined?.(payload.new.player_id)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tickets',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        const newClaims = payload.new.claims;
        const oldClaims = payload.old.claims;
        // Check which claim was made
        Object.entries(newClaims).forEach(([type, claimed]) => {
          if (claimed && !oldClaims[type]) {
            callbacks.onClaimMade?.({
              type,
              playerId: payload.new.player_id
            });
          }
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`
      },
      (payload) => callbacks.onGameStateChange?.(payload.new.status)
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

// Helper function to generate ticket numbers
const generateTicketNumbers = (): number[][] => {
  const numbers: number[][] = Array(3).fill([]).map(() => Array(5).fill(0));
  const used = new Set<number>();
  
  // Generate unique numbers for each cell
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      let num;
      do {
        num = Math.floor(Math.random() * 90) + 1;
      } while (used.has(num));
      used.add(num);
      numbers[row][col] = num;
    }
  }
  
  return numbers;
};