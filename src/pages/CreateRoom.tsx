import { useState } from 'react';
import { RoomFormData } from '../types/room-creation';
import StepIndicator from '../components/create-room/StepIndicator';
import BasicDetails from '../components/create-room/BasicDetails';
import TicketSettings from '../components/create-room/TicketSettings';
import PrizeDistribution from '../components/create-room/PrizeDistribution';
import PaymentSetup from '../components/create-room/PaymentSetup';
import ShareRoom from '../components/create-room/ShareRoom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const STEPS = ['Basic Details', 'Ticket Settings', 'Prize Distribution', 'Payment Setup', 'Share Room'];

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
  paymentDetails: {
    upiId: '',
    qrImage: '',
    isValid: false
  }
};

export default function CreateRoom() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RoomFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (data: Partial<RoomFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = async () => {
    if (currentStep === STEPS.length - 2) {
      // Create room in Supabase before showing share screen
      setIsSubmitting(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('Not authenticated');

        const { data: room, error } = await supabase
          .from('rooms')
          .insert({
            name: formData.name,
            host_id: userData.user.id,
            ticket_price: formData.ticketPrice,
            max_players: formData.maxPlayers,
            start_time: formData.startTime.toISOString(),
            status: 'waiting',
            prizes: {
              fullHouse: formData.prizes.fullHouse,
              earlyFive: formData.prizes.earlyFive,
              topLine: formData.prizes.topLine,
              middleLine: formData.prizes.middleLine,
              bottomLine: formData.prizes.bottomLine
            },
            payment_details: {
              upiId: formData.paymentDetails.upiId,
              qrImage: formData.paymentDetails.qrImage
            }
          })
          .select()
          .single();

        if (error) throw error;
        
        // Move to share screen with room data
        setFormData(prev => ({ ...prev, roomId: room.id }));
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        console.error('Error creating room:', error);
        toast.error('Failed to create room. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0: // Basic Details
        return !formData.name || !formData.type;
      case 1: // Ticket Settings
        return formData.ticketPrice <= 0 || formData.maxPlayers <= 0;
      case 2: // Prize Distribution
        return Object.values(formData.prizes).some(prize => prize <= 0);
      case 3: // Payment Setup
        return !formData.paymentDetails.upiId || !formData.paymentDetails.qrImage || !formData.paymentDetails.isValid;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <StepIndicator currentStep={currentStep} steps={STEPS} />

      <div className="mt-8">
        {currentStep === 0 && <BasicDetails data={formData} onChange={handleChange} />}
        {currentStep === 1 && <TicketSettings data={formData} onChange={handleChange} />}
        {currentStep === 2 && <PrizeDistribution data={formData} onChange={handleChange} />}
        {currentStep === 3 && <PaymentSetup data={formData} onChange={handleChange} />}
        {currentStep === 4 && <ShareRoom roomId={formData.roomId} />}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Back
        </button>
        
        {currentStep < STEPS.length - 1 && (
          <button
            onClick={handleNext}
            disabled={isNextDisabled() || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Room...
              </span>
            ) : (
              'Next'
            )}
          </button>
        )}
      </div>
    </div>
  );
}