import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import type { PaymentVerification } from '../../types/payment';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

type FilterStatus = 'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export default function PaymentTracker() {
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  useEffect(() => {
    loadVerifications();
    
    const subscription = supabase
      .channel('payment_verifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payment_verifications'
      }, () => {
        loadVerifications();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filterStatus, dateRange]);

  const loadVerifications = async () => {
    try {
      let query = supabase
        .from('payment_verifications')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filterStatus !== 'ALL') {
        query = query.eq('status', filterStatus);
      }

      if (dateRange.start) {
        query = query.gte('timestamp', dateRange.start.toISOString());
      }

      if (dateRange.end) {
        query = query.lte('timestamp', dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error loading verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (id: string, status: 'VERIFIED' | 'REJECTED', note?: string) => {
    try {
      const { error } = await supabase
        .from('payment_verifications')
        .update({
          status,
          verified_at: new Date().toISOString(),
          host_note: note
        })
        .eq('id', id);

      if (error) throw error;
      await loadVerifications();
      toast.success(`Payment ${status.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Payment Verifications</h2>
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="rounded-lg border-gray-300 text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
          
          <input
            type="date"
            value={dateRange.start?.toISOString().split('T')[0] || ''}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              start: e.target.value ? new Date(e.target.value) : null
            }))}
            className="rounded-lg border-gray-300 text-sm"
          />
          
          <input
            type="date"
            value={dateRange.end?.toISOString().split('T')[0] || ''}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              end: e.target.value ? new Date(e.target.value) : null
            }))}
            className="rounded-lg border-gray-300 text-sm"
          />
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {verifications.filter(v => v.status === 'PENDING').length} Pending
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {verifications.filter(v => v.status === 'VERIFIED').length} Verified
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {verifications.filter(v => v.status === 'REJECTED').length} Rejected
        </span>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {verifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No payment verifications found
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {verifications.map((verification) => (
              <li key={verification.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {verification.status === 'PENDING' && (
                          <span className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                          </span>
                        )}
                        {verification.status === 'VERIFIED' && (
                          <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </span>
                        )}
                        {verification.status === 'REJECTED' && (
                          <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-red-600" />
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">
                          {verification.playerName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Amount: ₹{verification.amount}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(verification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {verification.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleVerification(verification.id, 'VERIFIED')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleVerification(verification.id, 'REJECTED')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {verification.screenshot && (
                        <button
                          onClick={() => window.open(verification.screenshot, '_blank')}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Screenshot
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}