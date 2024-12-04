import React from 'react';
import { motion } from 'framer-motion';

const TambolaTicket = () => {
  // Generate random numbers for the ticket
  const generateTicketNumbers = () => {
    const numbers: (number | null)[][] = Array(3).fill(null).map(() => Array(9).fill(null));
    const usedNumbers = new Set<number>();

    // For each row
    for (let row = 0; row < 3; row++) {
      // We need 5 numbers per row
      let numbersInRow = 0;
      while (numbersInRow < 5) {
        // Pick a random column
        const col = Math.floor(Math.random() * 9);
        // If this position is already filled, try again
        if (numbers[row][col] !== null) continue;

        // Calculate the range for this column
        const min = col * 10 + (col === 0 ? 1 : 0);
        const max = col * 10 + 9;

        // Generate a random number in this range
        let number;
        do {
          number = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (usedNumbers.has(number));

        numbers[row][col] = number;
        usedNumbers.add(number);
        numbersInRow++;
      }
    }

    return numbers;
  };

  const ticketNumbers = generateTicketNumbers();

  return (
    <motion.div
      className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-lg mx-auto transform perspective-1000"
      initial={{ rotateY: -30 }}
      animate={{ 
        rotateY: [0, -5, 0],
        y: [0, -10, 0]
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* Ticket Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-[#1A237E] mb-2">TAMBOLA TICKET</h3>
        <div className="text-sm text-gray-500">Ticket #12345</div>
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-rows-3 gap-2 relative">
        {ticketNumbers.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-9 gap-1">
            {row.map((number, colIndex) => (
              <div
                key={colIndex}
                className={`aspect-square flex items-center justify-center ${
                  number === null 
                    ? 'bg-gray-50' 
                    : 'bg-gradient-to-br from-[#FF5722]/10 to-[#1A237E]/10'
                } rounded-lg border border-gray-200 text-lg font-semibold ${
                  number === null ? 'text-transparent' : 'text-gray-700'
                }`}
              >
                {number || 0}
              </div>
            ))}
          </div>
        ))}

        {/* Decorative Elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#FF5722] rounded-full"></div>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#1A237E] rounded-full"></div>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#1A237E] rounded-full"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#FF5722] rounded-full"></div>
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <div className="text-6xl font-bold text-[#1A237E] rotate-45">
          TambolaParty
        </div>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl pointer-events-none"></div>
    </motion.div>
  );
};

export default TambolaTicket;
