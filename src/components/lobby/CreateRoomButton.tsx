import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface CreateRoomButtonProps {
  userId: string;
}

interface RoomFormData {
  title: string;
  description: string;
  entry_fee: number;
  max_players: number;
  start_time: string;
  category: 'quick' | 'tournament' | 'casual';
  prizes: {
    early_five: number;
    top_line: number;
    middle_line: number;
    bottom_line: number;
    full_house: number;
  };
  rules: {
    auto_daub: boolean;
    voice_announce: boolean;
    claim_verification: boolean;
  };
}

const defaultFormData: RoomFormData = {
  title: '',
  description: '',
  entry_fee: 0,
  max_players: 100,
  start_time: new Date(Date.now() + 15 * 60000).toISOString().slice(0, 16),
  category: 'quick',
  prizes: {
    early_five: 0,
    top_line: 0,
    middle_line: 0,
    bottom_line: 0,
    full_house: 0,
  },
  rules: {
    auto_daub: true,
    voice_announce: true,
    claim_verification: true,
  },
};

export default function CreateRoomButton({ userId }: CreateRoomButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<RoomFormData>(defaultFormData);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    setCreating(true);

    try {
      // Validate total prize equals entry fee * max players
      const totalPrize = Object.values(formData.prizes).reduce((a, b) => a + b, 0);
      const expectedPrize = formData.entry_fee * formData.max_players;
      if (totalPrize !== expectedPrize) {
        toast.error('Total prize must equal entry fee × max players');
        return;
      }

      // Create room
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          ...formData,
          host_id: userId,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Room created successfully');
      navigate(`/game/${data.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="fixed right-6 bottom-20 bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-full shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-gray-100">Create New Game Room</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Room Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1 w-full bg-gray-700 text-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter room title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 w-full bg-gray-700 text-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter room description"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Game Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-200">Game Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Entry Fee (₹)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.entry_fee}
                        onChange={(e) => setFormData(prev => ({ ...prev, entry_fee: Number(e.target.value) }))}
                        className="mt-1 w-full bg-gray-700 text-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300">Max Players</label>
                      <input
                        type="number"
                        required
                        min="2"
                        max="1000"
                        value={formData.max_players}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_players: Number(e.target.value) }))}
                        className="mt-1 w-full bg-gray-700 text-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300">Start Time</label>
                      <input
                        type="datetime-local"
                        required
                        min={new Date().toISOString().slice(0, 16)}
                        value={formData.start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                        className="mt-1 w-full bg-gray-700 text-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as RoomFormData['category'] }))}
                        className="mt-1 w-full bg-gray-700 text-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="quick">Quick Game</option>
                        <option value="tournament">Tournament</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Prize Distribution */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-200">Prize Distribution</h3>
                  <p className="text-sm text-gray-400">
                    Total prize pool: ₹{formData.entry_fee * formData.max_players}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(formData.prizes).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-300 capitalize">
                          {key.split('_').join(' ')} (₹)
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={value}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              prizes: {
                                ...prev.prizes,
                                [key]: Number(e.target.value)
                              }
                            }))
                          }
                          className="mt-1 w-full bg-gray-700 text-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Game Rules */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-200">Game Rules</h3>
                  
                  <div className="space-y-2">
                    {Object.entries(formData.rules).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              rules: {
                                ...prev.rules,
                                [key]: e.target.checked
                              }
                            }))
                          }
                          className="w-4 h-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-300 capitalize">
                          {key.split('_').join(' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-500 disabled:bg-cyan-600/50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Create Room'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}