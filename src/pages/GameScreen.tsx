import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../lib/hooks/useGame';
import NumberDisplay from '../components/game/NumberDisplay';
import PrizeStatus from '../components/game/PrizeStatus';
import TicketView from '../components/game/TicketView';
import PlayerList from '../components/game/PlayerList';
import ClaimsFeed from '../components/game/ClaimsFeed';
import ChatBubble from '../components/game/ChatBubble';
import { Volume2, VolumeX } from 'lucide-react';

interface GameState {
  currentNumber: number | null;
  lastNumbers: number[];
  soundEnabled: boolean;
  prizes: {
    fullHouse: boolean;
    topLine: boolean;
    middleLine: boolean;
    bottomLine: boolean;
  };
}

const GameScreen = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const {
    calledNumbers,
    players,
    gameStatus,
    claims
  } = useGame(roomId || '');

  const currentNumber = calledNumbers[calledNumbers.length - 1] || null;
  const lastNumbers = calledNumbers.slice(-5, -1).reverse();

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  if (!roomId) {
    return <div>Room ID not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Game Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <NumberDisplay 
              currentNumber={currentNumber}
              lastNumbers={lastNumbers}
            />
            <button
              onClick={toggleSound}
              className="mt-2 p-2 rounded-full hover:bg-gray-100"
            >
              {soundEnabled ? <Volume2 /> : <VolumeX />}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <TicketView 
              numbers={[[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15]]}
              calledNumbers={calledNumbers}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <PrizeStatus 
              claims={claims.map(claim => ({
                type: claim.type,
                claimed: true,
                claimedBy: claim.playerId
              }))}
            />
          </div>
        </div>

        {/* Right Column - Social */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <PlayerList 
              players={players}
              gameStatus={gameStatus}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <ClaimsFeed claims={claims} />
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