import { useMemo } from 'react';
import { IndianRupee, Users, Wallet } from 'lucide-react';
import { RoomFormData } from '../../types/room-creation';

interface TicketSettingsProps {
  data: RoomFormData;
  onChange: (data: Partial<RoomFormData>) => void;
}

export default function TicketSettings({ data, onChange }: TicketSettingsProps) {
  const calculations = useMemo(() => {
    const totalPool = data.ticketPrice * data.maxPlayers;
    const hostEarnings = totalPool; // Host gets 100% as they manage their own payments
    const perPrize = totalPool * 0.8 / 5; // 80% for prizes, divided by 5 prizes

    return {
      totalPool,
      hostEarnings,
      perPrize: Math.floor(perPrize)
    };
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
            onChange={(e) => {
              const price = parseInt(e.target.value);
              onChange({ 
                ticketPrice: price,
                prizes: {
                  ...data.prizes,
                  fullHouse: Math.floor(price * data.maxPlayers * 0.3), // 30%
                  earlyFive: Math.floor(price * data.maxPlayers * 0.1), // 10%
                  topLine: Math.floor(price * data.maxPlayers * 0.13), // 13%
                  middleLine: Math.floor(price * data.maxPlayers * 0.13), // 13%
                  bottomLine: Math.floor(price * data.maxPlayers * 0.14) // 14%
                }
              });
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={10}
            step={10}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Players
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="number"
            value={data.maxPlayers}
            onChange={(e) => {
              const players = parseInt(e.target.value);
              onChange({ 
                maxPlayers: players,
                prizes: {
                  ...data.prizes,
                  fullHouse: Math.floor(data.ticketPrice * players * 0.3),
                  earlyFive: Math.floor(data.ticketPrice * players * 0.1),
                  topLine: Math.floor(data.ticketPrice * players * 0.13),
                  middleLine: Math.floor(data.ticketPrice * players * 0.13),
                  bottomLine: Math.floor(data.ticketPrice * players * 0.14)
                }
              });
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={5}
            max={100}
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

      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium text-gray-900">Prize Pool Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-lg">
            <p className="text-sm text-gray-600">Total Collection</p>
            <div className="flex items-center text-lg font-medium text-gray-900">
              <IndianRupee className="w-4 h-4 mr-1" />
              {calculations.totalPool}
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-sm text-gray-600">Your Earnings</p>
            <div className="flex items-center text-lg font-medium text-green-600">
              <Wallet className="w-4 h-4 mr-1" />
              {calculations.hostEarnings}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          As the host, you'll manage payments directly through your UPI. Make sure to verify payments before allowing players to join.
        </p>
      </div>
    </div>
  );
}