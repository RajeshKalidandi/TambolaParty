import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, User } from 'lucide-react';
import data from '@emoji-mart/data';
import type { EmojiData } from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  message: string;
  timestamp: number;
}

interface ChatBubbleProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
}

interface EmojiPickerProps {
  data: EmojiData;
  onEmojiSelect: (emoji: { native: string }) => void;
  theme?: 'light' | 'dark';
  previewPosition?: 'none' | 'top' | 'bottom';
}

const formatTime = (timestamp: number): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date(timestamp));
};

const ChatBubble: React.FC<ChatBubbleProps> = ({
  messages,
  currentUserId,
  onSendMessage,
}) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (): void => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setShowEmoji(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addEmoji = (emoji: { native: string }): void => {
    setMessage(prev => prev + emoji.native);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Game Chat</h2>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`flex items-start gap-3 ${
                msg.userId === currentUserId ? 'flex-row-reverse' : ''
              }`}
            >
              <div className="flex-shrink-0">
                {msg.avatar ? (
                  <img
                    src={msg.avatar}
                    alt={msg.userName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-400" />
                  </div>
                )}
              </div>
              <div
                className={`flex flex-col ${
                  msg.userId === currentUserId ? 'items-end' : ''
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs break-words ${
                    msg.userId === currentUserId
                      ? 'bg-indigo-500/20 text-indigo-100'
                      : 'bg-gray-700/50 text-gray-100'
                  }`}
                >
                  <p className="text-sm mb-1">{msg.message}</p>
                  <p className="text-xs text-gray-400">
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {msg.userName}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="relative">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-gray-700 text-white rounded-lg pl-4 pr-12 py-2 resize-none h-10 min-h-[2.5rem] max-h-32"
              style={{ lineHeight: '1.5rem' }}
            />
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="absolute right-2 bottom-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg p-2 transition-colors"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full right-0 mb-2"
            >
              <Picker
                data={data as EmojiData}
                onEmojiSelect={addEmoji}
                theme="dark"
                previewPosition="none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatBubble;