import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2 } from 'lucide-react';

interface ShareRoomProps {
  roomCode: string;
  shareUrl: string;
}

export default function ShareRoom({ roomCode, shareUrl }: ShareRoomProps) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleWhatsAppShare = () => {
    const text = `Join my Tambola game! Room Code: ${roomCode}\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Room Code</h3>
        <div className="bg-gray-100 p-4 rounded-lg inline-block">
          <span className="text-3xl font-mono tracking-wider">{roomCode}</span>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <QRCodeSVG value={shareUrl} size={200} />
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleCopy(shareUrl)}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Copy className="w-5 h-5" />
          Copy Link
        </button>

        <button
          onClick={handleWhatsAppShare}
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-lg hover:bg-[#22BC5C] transition-colors"
        >
          <Share2 className="w-5 h-5" />
          Share on WhatsApp
        </button>
      </div>
    </div>
  );
}