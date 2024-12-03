import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthContext';
import { supabase } from '../lib/supabase';
import NumberDisplay from '../components/game/NumberDisplay';
import PrizeStatus from '../components/game/PrizeStatus';
import TicketView from '../components/game/TicketView';
import PlayerList from '../components/game/PlayerList';
import ClaimsFeed from '../components/game/ClaimsFeed';
import ChatBubble from '../components/game/ChatBubble';
import { Volume2, VolumeX, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Ticket, Winner, Claim } from '../types/game';

// Types
export type GameStatus = 'waiting' | 'in_progress' | 'completed';

export interface Player {
  id: string;
  nickname: string;
  ticketNumber: string | null;
}

export interface PrizeClaim {
  id: string;
  type: 'full_house' | 'top_line' | 'middle_line' | 'bottom_line';
  playerId: string;
  timestamp: number;
  status: 'pending' | 'verified' | 'rejected';
}

interface GameMessage {
  id: string;
  playerId: string;
  message: string;
  timestamp: number;
}

interface GameState {
  currentNumber: number | null;
  calledNumbers: number[];
  players: Player[];
  gameStatus: GameStatus;
  claims: PrizeClaim[];
  ticket: Ticket | null;
  messages: GameMessage[];
  error: string | null;
  isLoading: boolean;
  totalPrizePool: number;
  winners: Winner[];
  autoDaub: boolean;
}

const INITIAL_GAME_STATE: GameState = {
  currentNumber: null,
  calledNumbers: [],
  players: [],
  gameStatus: 'waiting',
  claims: [],
  ticket: null,
  messages: [],
  error: null,
  isLoading: true,
  totalPrizePool: 0,
  winners: [],
  autoDaub: true
};

const GameScreen = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);

  const loadInitialGameState = useCallback(async () => {
    if (!roomId || !user?.id) return;

    try {
      const [roomData, numbersData, claimsData, playersData, ticketData, messagesData] = await Promise.all([
        supabase.from('rooms').select('status').eq('id', roomId).single(),
        supabase
          .from('game_numbers')
          .select('number, created_at')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true }),
        supabase
          .from('prize_claims')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true }),
        supabase
          .from('room_players')
          .select('user_id, nickname, ticket_number')
          .eq('room_id', roomId),
        supabase
          .from('player_tickets')
          .select('numbers')
          .eq('room_id', roomId)
          .eq('player_id', user.id)
          .single(),
        supabase
          .from('game_messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true })
      ]);

      if (roomData.error) throw roomData.error;
      if (numbersData.error) throw numbersData.error;
      if (claimsData.error) throw claimsData.error;
      if (playersData.error) throw playersData.error;

      const numbers = numbersData.data.map(n => n.number);
      
      setGameState({
        currentNumber: numbers[numbers.length - 1] || null,
        calledNumbers: numbers,
        players: playersData.data.map(transformPlayer),
        gameStatus: roomData.data.status as GameStatus,
        claims: claimsData.data.map(transformClaim),
        ticket: ticketData.data?.numbers || null,
        messages: messagesData.data?.map(transformMessage) || [],
        error: null,
        isLoading: false,
        totalPrizePool: 0,
        winners: [],
        autoDaub: true
      });
    } catch (error) {
      console.error('Error loading game state:', error);
      setGameState(prev => ({
        ...prev,
        error: 'Failed to load game state. Please try refreshing the page.',
        isLoading: false,
      }));
      toast.error('Failed to load game state');
    }
  }, [roomId, user?.id]);

  useEffect(() => {
    if (!user?.id || !roomId) {
      setGameState(prev => ({ ...prev, error: 'Invalid room or user' }));
      return;
    }

    void loadInitialGameState();

    const gameChannel = supabase
      .channel(`game-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_numbers', filter: `room_id=eq.${roomId}` },
        payload => {
          if (payload.eventType === 'INSERT') {
            const number = payload.new.number;
            setGameState(prev => ({
              ...prev,
              currentNumber: number,
              calledNumbers: [...prev.calledNumbers, number],
            }));
            if (soundEnabled) {
              void playNumberSound(number);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prize_claims', filter: `room_id=eq.${roomId}` },
        payload => {
          if (payload.eventType === 'INSERT') {
            setGameState(prev => ({
              ...prev,
              claims: [...prev.claims, transformClaim(payload.new)],
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        () => {
          void loadPlayers();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        payload => {
          setGameState(prev => ({
            ...prev,
            gameStatus: payload.new.status as GameStatus,
          }));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(gameChannel);
    };
  }, [user?.id, roomId, soundEnabled, loadInitialGameState]);

  const loadPlayers = async () => {
    if (!roomId) return;
  
    try {
      const { data, error } = await supabase
        .from('room_players')
        .select('user_id, nickname, ticket_number')
        .eq('room_id', roomId);
  
      if (error) throw error;
  
      setGameState(prev => ({
        ...prev,
        players: data.map(transformPlayer),
      }));
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error('Failed to update players list');
    }
  };
  
  const transformPlayer = (player: any): Player => ({
    id: player.user_id,
    nickname: player.nickname,
    ticketNumber: player.ticket_number
  });
  
  const transformMessage = (message: any): GameMessage => ({
    id: message.id,
    playerId: message.player_id,
    message: message.content,
    timestamp: new Date(message.created_at).getTime(),
  });

  const transformClaim = (claim: any): PrizeClaim => ({
    id: claim.id,
    type: claim.prize_type,
    playerId: claim.player_id,
    timestamp: new Date(claim.created_at).getTime(),
    status: claim.status,
  });

  const playNumberSound = async (number: number) => {
    try {
      const audio = new Audio(`/sounds/numbers/${number}.mp3`);
      await audio.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
    toast.success(`Sound ${soundEnabled ? 'disabled' : 'enabled'}`);
  };

  const handleSendMessage = async (message: string) => {
    if (!user?.id || !roomId) return;
    try {
      const { error } = await supabase.from('game_messages').insert({
        room_id: roomId,
        player_id: user.id,
        content: message,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const transformClaimToClaim = (prizeClaim: PrizeClaim): Claim => {
    const player = gameState.players.find(p => p.id === prizeClaim.playerId);
    return {
      id: prizeClaim.id,
      playerName: player?.nickname || 'Unknown Player',
      prizeType: prizeClaim.type,
      timestamp: prizeClaim.timestamp
    };
  };

  const handleToggleAutoDaub = () => {
    setGameState(prev => ({
      ...prev,
      autoDaub: !prev.autoDaub
    }));
  };

  const handleNumberMark = async (ticketId: string, row: number, col: number) => {
    // Implementation for marking numbers
    console.log('Marking number at', row, col, 'for ticket', ticketId);
  };

  const handleClaim = async (prizeType: string) => {
    // Implementation for claiming prizes
    console.log('Claiming prize:', prizeType);
  };

  if (!roomId || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold mb-2">Access Error</h2>
          <p className="text-gray-600">Room ID not found or user not authenticated</p>
          <button
            onClick={() => navigate('/lobby')}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (gameState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-center mb-2">Error</h2>
          <p className="text-gray-600 text-center">{gameState.error}</p>
          <button
            onClick={() => navigate('/lobby')}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="grid lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <NumberDisplay 
              gameId={roomId}
              isHost={false}
            />
            <button
              onClick={toggleSound}
              className="mt-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="text-green-500" /> : <VolumeX className="text-red-500" />}
            </button>
          </div>

          {gameState.ticket && (
            <div className="bg-white rounded-lg shadow p-4">
              <TicketView 
                tickets={[gameState.ticket]}
                autoDaub={gameState.autoDaub}
                currentNumber={gameState.currentNumber}
                onToggleAutoDaub={handleToggleAutoDaub}
                onNumberMark={handleNumberMark}
                onClaim={handleClaim}
                prizes={{
                  fullHouse: false,
                  earlyFive: false,
                  topLine: false,
                  middleLine: false,
                  bottomLine: false
                }}
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <PrizeStatus 
              prizes={{
                fullHouse: 1000,
                topLine: 500,
                middleLine: 500,
                bottomLine: 500,
                earlyFive: 300
              }}
              winners={gameState.winners}
              totalPrizePool={gameState.totalPrizePool}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <PlayerList 
              gameId={roomId}
              currentUserId={user?.id}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <ClaimsFeed claims={gameState.claims.map(transformClaimToClaim)} />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <ChatBubble 
              messages={gameState.messages.map(msg => ({
                id: msg.id,
                message: msg.message,
                sender: {
                  id: msg.playerId,
                  name: gameState.players.find(p => p.id === msg.playerId)?.nickname || 'Unknown Player'
                },
                timestamp: new Date(msg.timestamp)
              }))}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;