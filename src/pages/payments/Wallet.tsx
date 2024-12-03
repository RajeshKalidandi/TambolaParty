import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, ArrowLeft, CreditCard, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../lib/auth/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Transaction, Wallet } from '../../types/wallet';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export default function WalletPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useAuth();

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      if (data && typeof data.balance === 'number') {
        setBalance(data.balance);
      }
    } catch (error) {
      toast.error('Failed to fetch wallet balance');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      void fetchWalletData();
      void fetchTransactions();

      // Subscribe to wallet changes
      const walletSubscription = supabase
        .channel('wallet_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'wallets',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresChangesPayload<Wallet>) => {
            const newWallet = payload.new as Wallet;
            if (newWallet && typeof newWallet.balance === 'number') {
              setBalance(newWallet.balance);
            }
          }
        )
        .subscribe();

      // Subscribe to transaction changes
      const transactionSubscription = supabase
        .channel('transaction_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresChangesPayload<Transaction>) => {
            if (payload.new) {
              const newTransaction = payload.new as Transaction;
              setTransactions(prev => [newTransaction, ...prev].slice(0, 10));
              
              toast.success(
                `${newTransaction.type === 'credit' ? 'Received' : 'Sent'} ₹${newTransaction.amount}`,
                { icon: newTransaction.type === 'credit' ? '💰' : '📤' }
              );
            }
          }
        )
        .subscribe();

      return () => {
        walletSubscription.unsubscribe();
        transactionSubscription.unsubscribe();
      };
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center">
        <Link to="/lobby" className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Wallet</h1>
      </div>

      {/* Balance Card */}
      <div className="p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Coins className="w-8 h-8" />
            <CreditCard className="w-6 h-6" />
          </div>
          <p className="text-sm opacity-90">Available Balance</p>
          <h2 className="text-3xl font-bold">₹{balance.toFixed(2)}</h2>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Link
            to="/payments/add-money"
            className="bg-gray-800 rounded-xl p-4 text-center hover:bg-gray-750"
          >
            <ArrowDownCircle className="w-6 h-6 mx-auto mb-2" />
            <span>Add Money</span>
          </Link>
          <Link
            to="/payments/withdrawal"
            className="bg-gray-800 rounded-xl p-4 text-center hover:bg-gray-750"
          >
            <ArrowUpCircle className="w-6 h-6 mx-auto mb-2" />
            <span>Withdraw</span>
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10">
              <Coins className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No transactions yet</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {transaction.type === 'credit' ? (
                    <ArrowDownCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <ArrowUpCircle className="w-6 h-6 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}