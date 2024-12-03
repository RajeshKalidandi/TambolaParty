import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthContext';
import { supabase } from '../lib/supabase';
import NumberDisplay from '../components/game/NumberDisplay';
import PrizeStatus from '../components/game/PrizeStatus';
import TicketView from '../components/game/TicketView';
import PlayerList from '../components/game/PlayerList';
import ClaimsFeed from '../components/game/ClaimsFeed';
import ChatBubble from '../components/game/ChatBubble';
import { Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import type { GameStatus, Player, PrizeClaim } from '../types/game';

interface GameState {
  currentNumber: number | null;
  calledNumbers: number[];
  players: Player[];
  gameStatus: GameStatus;
  claims: PrizeClaim[];
  ticket: number[][] | null;
  error: string | null;
}

const GameScreen = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    currentNumber: null,
    calledNumbers: [],
    players: [],
    gameStatus: 'waiting',
    claims: [],
    ticket: null,
    error: null,
  });

  useEffect(() => {
    if (!user?.id || !roomId) return;

    void loadInitialGameState();

    // Subscribe to real-time game updates
    const gameChannel = supabase
      .channel(`game-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_numbers',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const number = payload.new.number;
            setGameState((prev) => ({
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
        {
          event: '*',
          schema: 'public',
          table: 'prize_claims',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGameState((prev) => ({
              ...prev,
              claims: [...prev.claims, transformClaim(payload.new)],
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          void loadPlayers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setGameState((prev) => ({
            ...prev,
            gameStatus: payload.new.status as GameStatus,
          }));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(gameChannel);
    };
  }, [user?.id, roomId, soundEnabled]);

  const loadInitialGameState = async () => {
    if (!roomId || !user?.id) return;

    try {
      const [roomData, numbersData, claimsData, playersData, ticketData] = await Promise.all([
        // Get room status
        supabase.from('rooms').select('status').eq('id', roomId).single(),
        // Get called numbers
        supabase
          .from('game_numbers')
          .select('number')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true }),
        // Get prize claims
        supabase
          .from('prize_claims')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true }),
        // Get players
        supabase
          .from('room_players')
          .select('user_id, nickname, payment_status, ticket_number')
          .eq('room_id', roomId),
        // Get user's ticket
        supabase
          .from('player_tickets')
          .select('numbers')
          .eq('room_id', roomId)
          .eq('player_id', user.id)
          .single(),
      ]);

      if (roomData.error) throw roomData.error;
      if (numbersData.error) throw numbersData.error;
      if (claimsData.error) throw claimsData.error;
      if (playersData.error) throw playersData.error;

      const numbers = numbersData.data.map((n) => n.number);
      
      setGameState({
        currentNumber: numbers[numbers.length - 1] || null,
        calledNumbers: numbers,
        players: playersData.data.map(transformPlayer),
        gameStatus: roomData.data.status as GameStatus,
        claims: claimsData.data.map(transformClaim),
        ticket: ticketData.data?.numbers || null,
        error: null,
      });
    } catch (error) {
      console.error('Error loading game state:', error);
      setGameState((prev) => ({
        ...prev,
        error: 'Failed to load game state. Please try refreshing the page.',
      }));
    }
  };

  const loadPlayers = async () => {
    if (!roomId) return;

    try {
      const { data, error } = await supabase
        .from('room_players')
        .select('user_id, nickname, payment_status, ticket_number')
        .eq('room_id', roomId);

      if (error) throw error;

      setGameState((prev) => ({
        ...prev,
        players: data.map(transformPlayer),
      }));
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const transformPlayer = (player: any): Player => ({
    id: player.user_id,
    nickname: player.nickname,
    paymentStatus: player.payment_status,
    ticketNumber: player.ticket_number,
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
    setSoundEnabled((prev) => !prev);
  };

  if (!roomId || !user) {
    return <div>Room ID not found or user not authenticated</div>;
  }

  if (gameState.error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
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
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Game Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <NumberDisplay 
              currentNumber={gameState.currentNumber}
              lastNumbers={gameState.calledNumbers.slice(-5, -1).reverse()}
            />
            <button
              onClick={toggleSound}
              className="mt-2 p-2 rounded-full hover:bg-gray-100"
              aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 /> : <VolumeX />}
            </button>
          </div>

          {gameState.ticket && (
            <div className="bg-white rounded-lg shadow p-4">
              <TicketView 
                numbers={gameState.ticket}
                calledNumbers={gameState.calledNumbers}
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <PrizeStatus claims={gameState.claims} />
          </div>
        </div>

        {/* Right Column - Social */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <PlayerList 
              players={gameState.players}
              gameStatus={gameState.gameStatus}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <ClaimsFeed claims={gameState.claims} />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <ChatBubble roomId={roomId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;