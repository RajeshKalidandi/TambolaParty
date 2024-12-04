import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRoomCreation } from '../contexts/RoomCreationContext';
import BasicDetails from '../components/create-room/BasicDetails';
import TicketSettings from '../components/create-room/TicketSettings';
import ShareRoom from '../components/create-room/ShareRoom';
import StepIndicator from '../components/create-room/StepIndicator';

const steps = ['Basic Details', 'Ticket Settings', 'Share Room'];

export default function RoomCreation() {
  const navigate = useNavigate();
  const { currentStep, formData, nextStep, prevStep, createRoom } = useRoomCreation();

  const handleNext = async () => {
    if (currentStep === steps.length) {
      const result = await createRoom();
      if (result.success && result.roomId) {
        navigate(`/room/${result.roomId}`);
      }
    } else {
      nextStep();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicDetails />;
      case 2:
        return <TicketSettings />;
      case 3:
        return <ShareRoom />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Room</h1>
          <p className="text-gray-600">Set up your Tambola room in a few simple steps</p>
        </motion.div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 md:p-8">
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

          <div className="mt-8 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors duration-200
                ${currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#FF5722] to-[#FF8A65]
                       text-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              {currentStep === steps.length ? 'Create Room' : 'Next'}
              {currentStep !== steps.length && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
