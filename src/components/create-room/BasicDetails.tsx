import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { RoomFormData, RoomType } from '../../types/room-creation';

interface BasicDetailsProps {
  data: RoomFormData;
  onChange: (data: Partial<RoomFormData>) => void;
}

const ROOM_TYPES: RoomType[] = ['Quick', 'Standard', 'Premium', 'Private'];

export default function BasicDetails({ data, onChange }: BasicDetailsProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Name
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter room name..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          {ROOM_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onChange({ type })}
              className={`px-4 py-2 rounded-lg border ${
                data.type === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-500'
              } transition-colors`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date & Time
        </label>
        <DatePicker
          selected={data.startTime}
          onChange={(date) => onChange({ startTime: date || new Date() })}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
          minDate={new Date()}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Players: {data.maxPlayers}
        </label>
        <input
          type="range"
          min={5}
          max={50}
          value={data.maxPlayers}
          onChange={(e) => onChange({ maxPlayers: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}