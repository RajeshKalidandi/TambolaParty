import React from 'react';
import SearchBar from '../components/lobby/SearchBar';
import RoomCard from '../components/lobby/RoomCard';
import BottomNav from '../components/lobby/BottomNav';
import CreateRoomButton from '../components/lobby/CreateRoomButton';
import type { Room } from '../types/room';

const MOCK_ROOMS: Room[] = [
  {
    id: '1',
    name: 'Weekend Bonanza',
    hostRating: 4.8,
    ticketPrice: 100,
    prizes: {
      fullHouse: 1000,
      topLine: 300,
      middleLine: 300,
      bottomLine: 300,
    },
    players: [
      { id: '1', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: '2', avatar: 'https://i.pravatar.cc/150?img=2' },
      { id: '3', avatar: 'https://i.pravatar.cc/150?img=3' },
      { id: '4', avatar: 'https://i.pravatar.cc/150?img=4' },
    ],
    maxPlayers: 15,
    startTime: new Date(Date.now() + 30 * 60000).toISOString(), // 30 mins from now
  },
  {
    id: '2',
    name: 'Quick Game',
    hostRating: 4.5,
    ticketPrice: 50,
    prizes: {
      fullHouse: 500,
      topLine: 150,
      middleLine: 150,
      bottomLine: 150,
    },
    players: [
      { id: '5', avatar: 'https://i.pravatar.cc/150?img=5' },
      { id: '6', avatar: 'https://i.pravatar.cc/150?img=6' },
    ],
    maxPlayers: 10,
    startTime: new Date(Date.now() + 15 * 60000).toISOString(), // 15 mins from now
  },
];

export default function GameLobby() {
  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <SearchBar />
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_ROOMS.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>
      <CreateRoomButton />
      <BottomNav />
    </div>
  );
}