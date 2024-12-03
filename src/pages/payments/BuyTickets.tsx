import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, ArrowLeft, Info, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../lib/auth/AuthContext';
import { supabase } from '../../lib/supabase';

interface TicketPackage {
  id: string;
  name: string;
  price: number;
  tickets: number;
  benefits: string[];
  popular?: boolean;
}

const ticketPackages: TicketPackage[] = [
  {
    id: 'basic',
    name: 'Starter Pack',
    price: 99,
    tickets: 5,
    benefits: [
      'Valid for all regular games',
      '24-hour validity',
      'Basic support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    price: 199,
    tickets: 12,
    tickets_bonus: 3,
    benefits: [
      'Valid for all games including tournaments',
      '48-hour validity',
      'Priority support',
      '3 bonus tickets'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    price: 499,
    tickets: 30,
    tickets_bonus: 10,
    benefits: [
      'Valid for all games including special events',
      '7-day validity',
      'Premium support',
      '10 bonus tickets',
      'Exclusive access to premium rooms'
    ]
  }
];

export default function BuyTickets() {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<TicketPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTickets, setActiveTickets] = useState<number>(0);

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (pkg: TicketPackage) => {
    try {
      setLoading(true);
      
      // Load Razorpay script
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        toast.error('Failed to load payment gateway');
        return;
      }

      // Create order in your backend
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user?.id,
            package_id: pkg.id,
            amount: pkg.price,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: pkg.price * 100, // amount in paisa
        currency: 'INR',
        name: 'Tambola Party',
        description: `Purchase ${pkg.name}`,
        order_id: order.razorpay_order_id,
        handler: async (response: any) => {
          try {
            // Verify payment with your backend
            const { error: verifyError } = await supabase
              .from('orders')
              .update({
                status: 'completed',
                payment_id: response.razorpay_payment_id
              })
              .eq('id', order.id);

            if (verifyError) throw verifyError;

            // Add tickets to user's account
            const { error: ticketError } = await supabase.rpc('add_tickets', {
              user_id: user?.id,
              ticket_count: pkg.tickets + (pkg.tickets_bonus || 0)
            });

            if (ticketError) throw ticketError;

            toast.success('Tickets purchased successfully!');
            // Refresh active tickets count
            fetchActiveTickets();
          } catch (err) {
            console.error('Payment verification failed:', err);
            toast.error('Failed to verify payment');
          }
        },
        prefill: {
          email: user?.email
        },
        theme: {
          color: '#0891b2' // Tailwind cyan-600
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Purchase failed:', err);
      toast.error('Failed to initiate purchase');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTickets = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('player_tickets')
      .select('tickets_available')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setActiveTickets(data.tickets_available);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/lobby" className="text-gray-400 hover:text-white mr-4">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold">Buy Tickets</h1>
          </div>
          <div className="flex items-center bg-cyan-500/20 px-3 py-1 rounded-full">
            <Ticket size={16} className="text-cyan-400 mr-2" />
            <span className="text-cyan-100">{activeTickets} tickets</span>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid gap-4 mb-8">
          {ticketPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border-2 transition-colors ${
                selectedPackage?.id === pkg.id
                  ? 'border-cyan-500'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 -right-2">
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Popular
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold mb-1">{pkg.name}</h3>
                  <div className="flex items-center text-2xl font-bold text-cyan-400">
                    ₹{pkg.price}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-cyan-400">{pkg.tickets}</div>
                  <div className="text-sm text-gray-400">tickets</div>
                  {pkg.tickets_bonus && (
                    <div className="text-xs text-orange-400">+{pkg.tickets_bonus} bonus</div>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {pkg.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start text-sm text-gray-300">
                    <Check size={16} className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePurchase(pkg)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Buy Now'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/30 rounded-lg p-4 flex items-start"
        >
          <Info size={20} className="text-gray-400 mr-3 flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-400">
            Tickets are valid for their specified duration from the time of purchase.
            Unused tickets will expire after their validity period.
            For any issues with ticket purchases, please contact support.
          </div>
        </motion.div>
      </div>
    </div>
  );
}