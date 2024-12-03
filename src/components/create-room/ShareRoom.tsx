import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, IndianRupee } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ShareRoomProps {
  roomId: string;
}

interface RoomDetails {
  room_code: string;
  name: string;
  ticket_price: number;
  payment_details: {
    upiId: string;
    qrImage: string;
  };
  expires_at: string;
}

export default function ShareRoomComponent({ roomId }: ShareRoomProps) {
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/join/${roomDetails?.room_code || ''}`;

  useEffect(() => {
    if (!roomId) return;
    void loadRoomDetails();
  }, [roomId]);

  const loadRoomDetails = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('room_code, name, ticket_price, payment_details, expires_at')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Room not found');

      setRoomDetails(data as RoomDetails);
    } catch (error) {
      console.error('Error loading room details:', error);
      toast.error('Failed to load room details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleWhatsAppShare = () => {
    if (!roomDetails) return;
    
    const message = encodeURIComponent(
      `Join my Tambola game!\n\n` +
      `🎮 Room: ${roomDetails.name}\n` +
      `🎫 Code: ${roomDetails.room_code}\n` +
      `💰 Price: ₹${roomDetails.ticket_price}\n\n` +
      `Join here: ${shareUrl}`
    );
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!roomDetails) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Failed to load room details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Share Room</h3>
        <p className="mt-1 text-sm text-gray-500">
          Share the room code or link with your friends
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        {/* Room Code */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Room Code</p>
            <p className="text-2xl font-bold text-indigo-600">{roomDetails.room_code}</p>
          </div>
          <button
            onClick={() => handleCopy(roomDetails.room_code)}
            className={`p-2 rounded-full transition-colors ${
              copied ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Copy className="h-5 w-5" />
          </button>
        </div>

        {/* Share Link */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Share Link</p>
            <p className="text-sm text-gray-500 truncate">{shareUrl}</p>
          </div>
          <button
            onClick={() => handleCopy(shareUrl)}
            className={`p-2 rounded-full transition-colors ${
              copied ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Copy className="h-5 w-5" />
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share on WhatsApp
          </button>
        </div>

        {/* QR Code */}
        {roomDetails.payment_details?.qrImage && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Scan to Pay</p>
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCodeSVG value={roomDetails.payment_details.qrImage} size={200} />
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">UPI ID: {roomDetails.payment_details.upiId}</p>
              <p className="text-sm text-gray-500 flex items-center">
                Amount: <IndianRupee className="h-4 w-4 mx-1" />
                {roomDetails.ticket_price}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}