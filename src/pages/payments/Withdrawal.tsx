import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Building2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../lib/auth/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Transaction } from '../../types/wallet';

interface BankAccount {
  id: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  account_holder: string;
  is_primary: boolean;
}

export default function Withdrawal() {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const bankModalRef = useRef<HTMLDialogElement>(null);
  const withdrawModalRef = useRef<HTMLDialogElement>(null);
  const { user } = useAuth();

  // Form state for adding bank account
  const [bankForm, setBankForm] = useState({
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountHolder: '',
  });

  useEffect(() => {
    if (user?.id) {
      void fetchWalletData();
      void fetchBankAccounts();
      void fetchTransactions();
    }
  }, [user?.id]);

  const fetchWalletData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_wallet_balance', {
        user_id: user?.id
      });

      if (error) throw error;
      setBalance(data || 0);
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
      toast.error('Failed to load wallet balance');
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (err) {
      console.error('Failed to fetch bank accounts:', err);
      toast.error('Failed to load bank accounts');
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      toast.error('Failed to load transactions');
    }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bankForm.accountNumber !== bankForm.confirmAccountNumber) {
      toast.error('Account numbers do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('bank_accounts').insert([
        {
          user_id: user?.id,
          account_number: bankForm.accountNumber,
          ifsc_code: bankForm.ifscCode,
          account_holder: bankForm.accountHolder,
          is_primary: bankAccounts.length === 0 // First account is primary
        }
      ]);

      if (error) throw error;

      toast.success('Bank account added successfully');
      bankModalRef.current?.close();
      void fetchBankAccounts();
      setBankForm({
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        accountHolder: '',
      });
    } catch (err) {
      console.error('Failed to add bank account:', err);
      toast.error('Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (bankAccounts.length === 0) {
      toast.error('Please add a bank account first');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('create_withdrawal', {
        amount,
        bank_account_id: bankAccounts.find(acc => acc.is_primary)?.id
      });

      if (error) throw error;

      toast.success('Withdrawal request submitted successfully');
      setWithdrawAmount('');
      withdrawModalRef.current?.close();
      void fetchWalletData();
      void fetchTransactions();
    } catch (err) {
      console.error('Withdrawal failed:', err);
      toast.error('Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/lobby" className="text-gray-400 hover:text-white mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Wallet</h1>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-6 mb-6"
        >
          <div className="text-sm text-cyan-100 mb-2">Available Balance</div>
          <div className="text-3xl font-bold mb-4">₹{balance.toFixed(2)}</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => bankModalRef.current?.showModal()}
              className="flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors"
            >
              <Building2 size={18} className="mr-2" />
              Add Bank
            </button>
            <button
              onClick={() => withdrawModalRef.current?.showModal()}
              className="flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors"
            >
              <CreditCard size={18} className="mr-2" />
              Withdraw
            </button>
          </div>
        </motion.div>

        {/* Bank Accounts */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 mb-6">
          <h2 className="text-lg font-bold mb-4">Bank Accounts</h2>
          <div className="space-y-3">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
              >
                <div className="flex items-center">
                  <Building2 size={20} className="text-cyan-400 mr-3" />
                  <div>
                    <div className="font-medium">{account.bank_name}</div>
                    <div className="text-sm text-gray-400">
                      ****{account.account_number.slice(-4)}
                    </div>
                  </div>
                </div>
                {account.is_primary && (
                  <div className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4">
          <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
              >
                <div className="flex items-center">
                  {tx.type === 'credit' ? (
                    <ArrowDownCircle size={20} className="text-green-400 mr-3" />
                  ) : (
                    <ArrowUpCircle size={20} className="text-red-400 mr-3" />
                  )}
                  <div>
                    <div className="font-medium">{tx.description}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`font-medium ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Add Bank Modal */}
        <dialog ref={bankModalRef} className="modal bg-gray-900/95 backdrop-blur-lg rounded-xl p-6 text-white">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Add Bank Account</h3>
            <p className="text-gray-400 text-sm">Enter your bank account details</p>
          </div>
          <form onSubmit={handleAddBank} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account Holder Name</label>
              <input
                type="text"
                value={bankForm.accountHolder}
                onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              <input
                type="text"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Account Number</label>
              <input
                type="text"
                value={bankForm.confirmAccountNumber}
                onChange={(e) => setBankForm({ ...bankForm, confirmAccountNumber: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IFSC Code</label>
              <input
                type="text"
                value={bankForm.ifscCode}
                onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => bankModalRef.current?.close()}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Account'}
              </button>
            </div>
          </form>
        </dialog>

        {/* Withdraw Modal */}
        <dialog ref={withdrawModalRef} className="modal bg-gray-900/95 backdrop-blur-lg rounded-xl p-6 text-white">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Withdraw Money</h3>
            <p className="text-gray-400 text-sm">Enter amount to withdraw</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="1"
                max={balance}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => withdrawModalRef.current?.close()}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
}