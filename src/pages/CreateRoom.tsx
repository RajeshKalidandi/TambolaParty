import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import BasicDetails from '../components/create-room/BasicDetails';
import PrizeDistribution from '../components/create-room/PrizeDistribution';
import ShareRoomComponent from '../components/create-room/ShareRoom';
import StepIndicator from '../components/create-room/StepIndicator';
import type { RoomFormData } from '../types/room-creation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const steps = ['Basic Details', 'Prize Distribution', 'Share Room'];

export default function CreateRoom() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    type: 'Standard',
    startTime: new Date(),
    maxPlayers: 50,
    ticketPrice: 100,
    prizes: {
      fullHouse: 0,
      earlyFive: 0,
      topLine: 0,
      middleLine: 0,
      bottomLine: 0
    }
  });

  const handleChange = (data: Partial<RoomFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = async () => {
    try {
      if (currentStep === steps.length - 2) {
        // Validate form data
        if (!formData.name.trim()) {
          throw new Error('Please enter a room name');
        }
        if (formData.type === 'paid' && (!formData.ticketPrice || formData.ticketPrice < 10)) {
          throw new Error('Please enter a valid ticket price (minimum ₹10)');
        }
        if (!formData.maxPlayers || formData.maxPlayers < 2) {
          throw new Error('Please enter valid maximum players (minimum 2)');
        }

        // Create room in database before the final share step
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('Not authenticated');
        
        // Create room with minimal required fields first
        const { data: room, error } = await supabase
          .from('rooms')
          .insert({
            name: formData.name,
            host_id: userData.user.id,
            ticket_price: formData.ticketPrice,
            max_players: formData.maxPlayers,
            start_time: formData.startTime.toISOString(),
            status: 'waiting',
            type: formData.type,
            code: Math.random().toString(36).substring(2, 8).toUpperCase(),
            prizes: {
              full_house: formData.prizes.fullHouse,
              early_five: formData.prizes.earlyFive,
              top_line: formData.prizes.topLine,
              middle_line: formData.prizes.middleLine,
              bottom_line: formData.prizes.bottomLine
            }
          })
          .select()
          .single();

        if (error) throw error;
        if (!room) throw new Error('Failed to create room');

        // Update form data with room ID
        setFormData(prev => ({ ...prev, roomId: room.id }));
        toast.success('Room created successfully!');
      }

      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create room');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicDetails data={formData} onChange={handleChange} />;
      case 1:
        return <PrizeDistribution data={formData} onChange={handleChange} />;
      case 2:
        return currentStep === steps.length - 1 && formData.roomId && (
          <ShareRoomComponent roomId={formData.roomId} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1A237E]/20 to-[#FF5722]/10 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#FFD700]/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 left-0 w-64 h-64 bg-[#FF5722]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1A237E]/20 rounded-full blur-3xl"></div>
      </div>

      {/* Rangoli Pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.1
      }}></div>

      <div className="relative max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Create New Room</h1>
          <p className="text-white/60">Set up your Tambola room in a few simple steps</p>
        </motion.div>

        <div className="mb-8">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between mt-8"
        >
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
              ${currentStep === 0
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : 'bg-black/30 backdrop-blur-xl border border-white/10 text-white hover:bg-white/5'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep < steps.length - 1 && (
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF8A65]
                       text-white rounded-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30
                       transition-all duration-300"
            >
              {currentStep === steps.length - 2 ? 'Create Room' : 'Next'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}