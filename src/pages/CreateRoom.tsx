import React, { useState } from 'react';
import { RoomFormData } from '../types/room-creation';
import StepIndicator from '../components/create-room/StepIndicator';
import BasicDetails from '../components/create-room/BasicDetails';
import TicketSettings from '../components/create-room/TicketSettings';
import PrizeDistribution from '../components/create-room/PrizeDistribution';
import ShareRoom from '../components/create-room/ShareRoom';

const STEPS = ['Basic Details', 'Ticket Settings', 'Prize Distribution', 'Share Room'];

const initialFormData: RoomFormData = {
  name: '',
  type: 'Standard',
  startTime: new Date(),
  maxPlayers: 20,
  ticketPrice: 100,
  multipleTickets: false,
  prizes: {
    fullHouse: 0,
    earlyFive: 0,
    topLine: 0,
    middleLine: 0,
    bottomLine: 0,
  },
};

export default function CreateRoom() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RoomFormData>(initialFormData);

  const handleChange = (data: Partial<RoomFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicDetails data={formData} onChange={handleChange} />;
      case 1:
        return <TicketSettings data={formData} onChange={handleChange} />;
      case 2:
        return <PrizeDistribution data={formData} onChange={handleChange} />;
      case 3:
        return (
          <ShareRoom
            roomCode="ABC123"
            shareUrl="https://tambolaparty.com/room/ABC123"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Create New Room</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <StepIndicator currentStep={currentStep} steps={STEPS} />
          
          {renderStep()}

          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            {currentStep < STEPS.length - 1 && (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ml-auto"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}