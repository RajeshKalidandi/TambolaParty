import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { RoomFormData } from '../../types/room-creation';
import { IndianRupee } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PrizeDistributionProps {
  data: RoomFormData;
  onChange: (data: Partial<RoomFormData>) => void;
}

export default function PrizeDistribution({ data }: PrizeDistributionProps) {
  const totalPrizePool = data.ticketPrice * data.maxPlayers * 0.9; // 90% of total pool

  const chartData = {
    labels: ['Full House', 'Early Five', 'Lines'],
    datasets: [
      {
        data: [40, 20, 40],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107'],
        borderWidth: 0,
      },
    ],
  };

  const prizes = {
    fullHouse: totalPrizePool * 0.4,
    earlyFive: totalPrizePool * 0.2,
    lines: totalPrizePool * 0.4 / 3, // Split equally between 3 lines
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="max-w-xs mx-auto">
        <Pie data={chartData} options={{ plugins: { legend: { position: 'bottom' } } }} />
      </div>

      <div className="space-y-4 mt-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-green-800 font-medium mb-2">Full House</h4>
          <div className="flex items-center text-green-600">
            <IndianRupee className="w-4 h-4 mr-1" />
            <span className="text-xl font-bold">{prizes.fullHouse.toFixed(0)}</span>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-blue-800 font-medium mb-2">Early Five</h4>
          <div className="flex items-center text-blue-600">
            <IndianRupee className="w-4 h-4 mr-1" />
            <span className="text-xl font-bold">{prizes.earlyFive.toFixed(0)}</span>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="text-yellow-800 font-medium mb-2">Each Line</h4>
          <div className="flex items-center text-yellow-600">
            <IndianRupee className="w-4 h-4 mr-1" />
            <span className="text-xl font-bold">{prizes.lines.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}