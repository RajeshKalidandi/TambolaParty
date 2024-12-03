import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateRoomButton() {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/create')}
      className="fixed right-6 bottom-20 bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-full shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}