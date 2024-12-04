import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function HostGameButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/create');
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF8A65] 
                 text-white font-medium rounded-lg shadow-lg hover:shadow-xl
                 transition-shadow duration-300"
    >
      <Plus className="w-5 h-5" />
      Host Now
    </motion.button>
  );
}
