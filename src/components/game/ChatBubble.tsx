import { useEffect, useState, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  content: string;
  player_name: string;
  created_at: string;
  game_id: string;
  player_id?: string;
}

interface ChatBubbleProps {
  gameId: string;
  playerName: string;
  playerId?: string;
}

export default function ChatBubble({ gameId, playerName, playerId }: ChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    // Load initial messages
    loadMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`game-chat-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_messages',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
          if (!isOpen) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, isOpen]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('game_messages')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load chat messages');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('game_messages')
        .insert({
          content: newMessage.trim(),
          game_id: gameId,
          player_name: playerName,
          player_id: playerId
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        className="fixed bottom-4 right-4 p-3 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-500 transition-colors"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-gray-300 font-medium">Game Chat</h3>
          </div>
          
          <div className="h-96 p-4 space-y-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${
                  message.player_id === playerId ? 'items-end' : 'items-start'
                }`}
              >
                <span className="text-xs text-gray-500">{message.player_name}</span>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.player_id === playerId
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {message.content}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="p-2 bg-cyan-600 text-white rounded hover:bg-cyan-500"
                disabled={!newMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}