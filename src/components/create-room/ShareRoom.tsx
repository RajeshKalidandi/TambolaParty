import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, IndianRupee } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ShareRoomProps {
  roomId: string;
}

interface RoomDetails {
  code: string;
  name: string;
  ticket_price: number;
  payment_details: {
    upiId: string;
    qrImage: string;
  };
}

export default function ShareRoom({ roomId }: ShareRoomProps) {
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const shareUrl = `${window.location.origin}/join/${roomId}`;

  useEffect(() => {
    loadRoomDetails();
  }, [roomId]);

  const loadRoomDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('code, name, ticket_price, payment_details')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      setRoomDetails(data as RoomDetails);
    } catch (error) {
      console.error('Error loading room details:', error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleWhatsAppShare = () => {
    if (!roomDetails) return;
    
    const text = `Join my Tambola game!\n\nRoom: ${roomDetails.name}\nCode: ${roomDetails.code}\nTicket Price: ₹${roomDetails.ticket_price}\nUPI ID: ${roomDetails.payment_details.upiId}\n\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  if (!roomDetails) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Room Created Successfully!</h3>
        <p className="text-gray-600 mb-4">Share these details with your players</p>
        
        <div className="bg-gray-100 p-4 rounded-lg inline-block mb-4">
          <span className="text-3xl font-mono tracking-wider">{roomDetails.code}</span>
        </div>

        <div className="flex justify-center items-center gap-2 text-lg text-gray-700">
          <IndianRupee className="w-5 h-5" />
          <span>{roomDetails.ticket_price} per ticket</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium text-gray-700 mb-2">Room QR Code</p>
          <QRCodeSVG value={shareUrl} size={150} />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium text-gray-700 mb-2">Payment QR Code</p>
          <img 
            src={roomDetails.payment_details.qrImage} 
            alt="Payment QR"
            className="w-[150px] h-[150px] object-contain"
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Payment Details</h4>
        <p className="text-sm text-blue-800">UPI ID: {roomDetails.payment_details.upiId}</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleCopy(shareUrl)}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Copy className="w-5 h-5" />
          Copy Link
        </button>

        <button
          onClick={handleWhatsAppShare}
          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          Share on WhatsApp
        </button>
      </div>
    </div>
  );
}