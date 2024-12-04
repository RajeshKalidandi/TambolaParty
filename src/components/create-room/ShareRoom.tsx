import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, IndianRupee } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface ShareRoomProps {
  roomId: string;
}

interface RoomDetails {
  room_code: string;
  name: string;
  ticket_price: number;
  payment_details?: {
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5722]"></div>
      </div>
    );
  }

  if (!roomDetails) {
    return (
      <div className="text-center p-8">
        <p className="text-white/60">Failed to load room details</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-white/10"
    >
      <motion.div variants={item} className="text-center">
        <h3 className="text-lg font-medium text-white">Share Room</h3>
        <p className="mt-1 text-sm text-white/60">
          Share the room code or link with your friends
        </p>
      </motion.div>

      <motion.div variants={item} className="space-y-4">
        {/* Room Code */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#FF5722] to-[#FF8A65] rounded-lg blur opacity-20 group-hover:opacity-30 transition-all duration-300" />
          <div className="relative p-4 bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Room Code</p>
                <p className="text-2xl font-bold text-[#FF5722]">{roomDetails.room_code}</p>
              </div>
              <button
                onClick={() => handleCopy(roomDetails.room_code)}
                className={`p-2 rounded-full transition-colors ${
                  copied ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/5 text-white/60'
                }`}
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Share Link */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1A237E] to-[#3949AB] rounded-lg blur opacity-20 group-hover:opacity-30 transition-all duration-300" />
          <div className="relative p-4 bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-white/60">Share Link</p>
                <p className="text-sm text-white/40 truncate">{shareUrl}</p>
              </div>
              <button
                onClick={() => handleCopy(shareUrl)}
                className={`p-2 rounded-full transition-colors ${
                  copied ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/5 text-white/60'
                }`}
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={handleWhatsAppShare}
            className="relative group inline-flex items-center px-6 py-3 rounded-lg overflow-hidden"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-green-500 to-green-700 rounded-lg blur opacity-50 group-hover:opacity-70 transition-all duration-300" />
            <div className="relative flex items-center bg-black/30 backdrop-blur-xl px-6 py-2 rounded-lg border border-white/10">
              <Share2 className="h-5 w-5 mr-2" />
              Share on WhatsApp
            </div>
          </button>
        </div>

        {/* QR Code */}
        {roomDetails.payment_details?.qrImage && (
          <motion.div variants={item} className="relative group mt-6">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-[#FFD700] to-[#FFA000] rounded-lg blur opacity-20 group-hover:opacity-30 transition-all duration-300" />
            <div className="relative p-6 bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg text-center">
              <p className="text-sm font-medium text-white/60 mb-4">Scan to Pay</p>
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCodeSVG value={roomDetails.payment_details.qrImage} size={200} />
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm text-white/40">UPI ID: {roomDetails.payment_details.upiId}</p>
                <p className="text-sm text-white/40 flex items-center justify-center">
                  Amount: <IndianRupee className="h-4 w-4 mx-1" />
                  <span className="text-white">{roomDetails.ticket_price}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
