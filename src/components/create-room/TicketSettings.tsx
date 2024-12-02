import React, { useMemo } from 'react';
import { IndianRupee } from 'lucide-react';
import { RoomFormData } from '../../types/room-creation';

interface TicketSettingsProps {
  data: RoomFormData;
  onChange: (data: Partial<RoomFormData>) => void;
}

export default function TicketSettings({ data, onChange }: TicketSettingsProps) {
  const hostEarnings = useMemo(() => {
    const totalPool = data.ticketPrice * data.maxPlayers;
    return totalPool * 0.1; // 10% platform fee
  }, [data.ticketPrice, data.maxPlayers]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ticket Price
        </label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="number"
            value={data.ticketPrice}
            onChange={(e) => onChange({ ticketPrice: parseInt(e.target.value) })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={10}
            step={10}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Allow Multiple Tickets</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={data.multipleTickets}
            onChange={(e) => onChange({ multipleTickets: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="text-green-800 font-medium mb-2">Expected Earnings</h4>
        <div className="flex items-center text-green-600">
          <IndianRupee className="w-4 h-4 mr-1" />
          <span className="text-xl font-bold">{hostEarnings}</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Based on full capacity and 10% host commission
        </p>
      </div>
    </div>
  );
}