import React, { createContext, useContext, useState } from 'react';
import { nanoid } from 'nanoid';
import { RoomType } from '../types/database';
import { supabase } from '../lib/supabaseClient';

interface RoomFormData {
  name: string;
  type: RoomType;
  startTime: Date;
  maxPlayers: number;
  ticketPrice: number;
  multipleTickets: boolean;
  prizes: {
    fullHouse: number;
    earlyFive: number;
    topLine: number;
    middleLine: number;
    bottomLine: number;
  };
  paymentDetails?: {
    upiId: string;
    qrImage?: string;
  };
}

interface RoomCreationContextType {
  formData: RoomFormData;
  currentStep: number;
  updateFormData: (data: Partial<RoomFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  createRoom: () => Promise<{ success: boolean; roomId?: string; error?: string }>;
  generateRoomCode: () => string;
  generateShareLink: (roomId: string) => string;
}

const defaultFormData: RoomFormData = {
  name: '',
  type: 'Standard',
  startTime: new Date(),
  maxPlayers: 50,
  ticketPrice: 100,
  multipleTickets: false,
  prizes: {
    fullHouse: 0,
    earlyFive: 0,
    topLine: 0,
    middleLine: 0,
    bottomLine: 0,
  }
};

const RoomCreationContext = createContext<RoomCreationContextType | undefined>(undefined);

export function RoomCreationProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<RoomFormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (data: Partial<RoomFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const generateRoomCode = () => {
    // Generate a 6-character alphanumeric code
    return nanoid(6).toUpperCase();
  };

  const generateShareLink = (roomId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/room/${roomId}`;
  };

  const createRoom = async () => {
    try {
      const roomCode = generateRoomCode();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data: room, error } = await supabase
        .from('rooms')
        .insert({
          name: formData.name,
          type: formData.type,
          start_time: formData.startTime.toISOString(),
          max_players: formData.maxPlayers,
          host_id: userId,
          room_code: roomCode,
          share_link: '',
          status: 'pending',
          ticket_price: formData.ticketPrice,
          multiple_tickets_allowed: formData.multipleTickets,
          prizes: {
            full_house: formData.prizes.fullHouse,
            early_five: formData.prizes.earlyFive,
            top_line: formData.prizes.topLine,
            middle_line: formData.prizes.middleLine,
            bottom_line: formData.prizes.bottomLine,
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Update the room with the share link that includes the room ID
      const shareLink = generateShareLink(room.id);
      await supabase
        .from('rooms')
        .update({ share_link: shareLink })
        .eq('id', room.id);

      // If payment details are provided, create QR code entry
      if (formData.paymentDetails?.upiId) {
        await supabase
          .from('payment_qr_codes')
          .insert({
            room_id: room.id,
            host_id: userId,
            qr_image_url: formData.paymentDetails.qrImage,
            upi_id: formData.paymentDetails.upiId
          });
      }

      return { success: true, roomId: room.id };
    } catch (error) {
      console.error('Error creating room:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create room' 
      };
    }
  };

  return (
    <RoomCreationContext.Provider
      value={{
        formData,
        currentStep,
        updateFormData,
        nextStep,
        prevStep,
        createRoom,
        generateRoomCode,
        generateShareLink,
      }}
    >
      {children}
    </RoomCreationProvider>
  );
}

export function useRoomCreation() {
  const context = useContext(RoomCreationContext);
  if (context === undefined) {
    throw new Error('useRoomCreation must be used within a RoomCreationProvider');
  }
  return context;
}
