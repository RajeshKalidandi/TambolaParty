import { useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { RoomFormData } from '../../types/room-creation';
import { IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PrizeDistributionProps {
  data: RoomFormData;
  onChange: (data: Partial<RoomFormData>) => void;
  onValidityChange?: (isValid: boolean) => void;
}

export default function PrizeDistribution({ data, onChange, onValidityChange }: PrizeDistributionProps) {
  const totalPrizePool = (data.ticketPrice || 0) * (data.maxPlayers || 0) * 0.9; // 90% of total pool

  const chartData = {
    labels: ['Full House', 'Early Five', 'Lines'],
    datasets: [
      {
        data: [40, 20, 40],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',
          'rgba(33, 150, 243, 0.8)',
          'rgba(255, 193, 7, 0.8)'
        ],
        borderWidth: 0,
      },
    ],
  };

  const prizes = {
    fullHouse: totalPrizePool * 0.4,
    earlyFive: totalPrizePool * 0.2,
    lines: totalPrizePool * 0.4 / 3, // Split equally between 3 lines
  };

  useEffect(() => {
    // Update prize values in form data
    onChange({
      prizes: {
        fullHouse: prizes.fullHouse,
        earlyFive: prizes.earlyFive,
        topLine: prizes.lines,
        middleLine: prizes.lines,
        bottomLine: prizes.lines,
      }
    });
    
    // Validate prizes
    const isValid = totalPrizePool > 0 && 
                   prizes.fullHouse > 0 && 
                   prizes.earlyFive > 0 && 
                   prizes.lines > 0;
                   
    onValidityChange?.(isValid);
  }, [totalPrizePool, prizes.fullHouse, prizes.earlyFive, prizes.lines]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-white/10"
    >
      <motion.div variants={item} className="max-w-xs mx-auto">
        <Pie 
          data={chartData} 
          options={{ 
            plugins: { 
              legend: { 
                position: 'bottom',
                labels: {
                  color: 'rgba(255, 255, 255, 0.8)',
                  font: {
                    size: 12
                  }
                }
              } 
            } 
          }} 
        />
      </motion.div>

      <motion.div variants={item} className="space-y-4 mt-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-green-500 to-green-700 rounded-lg blur opacity-20 group-hover:opacity-30 transition-all duration-300" />
          <div className="relative p-4 bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg">
            <h4 className="text-green-400 font-medium mb-2">Full House</h4>
            <div className="flex items-center text-green-300">
              <IndianRupee className="w-4 h-4 mr-1" />
              <span className="text-xl font-bold">{prizes.fullHouse.toFixed(0)}</span>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg blur opacity-20 group-hover:opacity-30 transition-all duration-300" />
          <div className="relative p-4 bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-2">Early Five</h4>
            <div className="flex items-center text-blue-300">
              <IndianRupee className="w-4 h-4 mr-1" />
              <span className="text-xl font-bold">{prizes.earlyFive.toFixed(0)}</span>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg blur opacity-20 group-hover:opacity-30 transition-all duration-300" />
          <div className="relative p-4 bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg">
            <h4 className="text-yellow-400 font-medium mb-2">Each Line</h4>
            <div className="flex items-center text-yellow-300">
              <IndianRupee className="w-4 h-4 mr-1" />
              <span className="text-xl font-bold">{prizes.lines.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
