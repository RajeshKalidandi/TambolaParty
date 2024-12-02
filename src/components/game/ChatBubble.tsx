import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 p-3 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-500 transition-colors"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-gray-300 font-medium">Game Chat</h3>
          </div>
          <div className="h-96 p-4 space-y-4 overflow-y-auto">
            {/* Chat messages would go here */}
          </div>
          <div className="p-4 border-t border-gray-700">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      )}
    </>
  );
}