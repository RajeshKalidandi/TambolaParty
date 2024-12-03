import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function JoinByCode() {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/join/${roomCode.toUpperCase()}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <form onSubmit={handleJoinRoom} className="flex items-center gap-2">
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          placeholder="Enter Room Code"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
          maxLength={6}
          pattern="[A-Z0-9]{6}"
          title="6 characters room code"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={!roomCode.trim() || roomCode.length !== 6}
        >
          Join
        </button>
      </form>
    </div>
  );
}