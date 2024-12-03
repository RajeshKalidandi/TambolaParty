import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import BasicDetails from '../components/create-room/BasicDetails';
import TicketSettings from '../components/create-room/TicketSettings';
import PrizeDistribution from '../components/create-room/PrizeDistribution';
import PaymentSetup from '../components/create-room/PaymentSetup';
import ShareRoom from '../components/create-room/ShareRoom';
import StepIndicator from '../components/create-room/StepIndicator';
import type { RoomFormData } from '../types/room-creation';

const steps = ['Basic Details', 'Ticket Settings', 'Prize Distribution', 'Payment Setup', 'Share Room'];

export default function CreateRoom() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    type: 'Standard',
    startTime: new Date(),
    maxPlayers: 50,
    ticketPrice: 50,
    multipleTickets: false,
    prizes: {
      fullHouse: 0,
      earlyFive: 0,
      topLine: 0,
      middleLine: 0,
      bottomLine: 0
    },
    paymentDetails: {
      upiId: '',
      qrImage: '',
      isValid: false
    }
  });

  const handleChange = (data: Partial<RoomFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = async () => {
    try {
      if (currentStep === steps.length - 2) {
        // Create room in database before the final share step
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('Not authenticated');

        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const { data: room, error } = await supabase
          .from('rooms')
          .insert({
            name: formData.name,
            type: formData.type,
            start_time: formData.startTime.toISOString(),
            max_players: formData.maxPlayers,
            ticket_price: formData.ticketPrice,
            multiple_tickets: formData.multipleTickets,
            room_code: roomCode,
            host_id: userData.user.id,
            prizes: formData.prizes,
            payment_details: formData.paymentDetails
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw new Error('Could not create room');
        }

        // Update form data with room ID
        setFormData(prev => ({ ...prev, roomId: room.id }));
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
        return <TicketSettings data={formData} onChange={handleChange} />;
      case 2:
        return <PrizeDistribution data={formData} onChange={handleChange} />;
      case 3:
        return <PaymentSetup data={formData} onChange={handleChange} />;
      case 4:
        return <ShareRoom roomId={formData.roomId!} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Room</h1>
          <p className="mt-1 text-sm text-gray-600">
            Set up your Tambola room in a few simple steps
          </p>
        </div>

        <div className="mb-8">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          {renderStep()}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Back
          </button>
          {currentStep < steps.length - 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="ml-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {currentStep === steps.length - 2 ? 'Create Room' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}