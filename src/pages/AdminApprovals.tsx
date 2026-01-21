import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserCheck, UserX, Building2, Mail, Calendar, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface PendingUser {
  id: string;
  email: string;
  company_name: string | null;
  created_at: string;
  status: string;
}

interface Sponsor {
  id: string;
  name: string;
}

export function AdminApprovals() {
  return (
    <ProtectedRoute requireAdmin requireApproved>
      <AdminApprovalsContent />
    </ProtectedRoute>
  );
}

function AdminApprovalsContent() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSponsor, setSelectedSponsor] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, sponsorsData] = await Promise.all([
        supabase
          .from('sponsor_users')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('sponsors')
          .select('id, name')
          .order('name', { ascending: true })
      ]);

      if (usersData.data) setPendingUsers(usersData.data);
      if (sponsorsData.data) setSponsors(sponsorsData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    const sponsorId = selectedSponsor[userId];
    if (!sponsorId) {
      alert('Please select a sponsor to associate with this user');
      return;
    }

    try {
      const { error } = await supabase
        .from('sponsor_users')
        .update({
          status: 'approved',
          sponsor_id: sponsorId,
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', userId);

      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user. Please try again.');
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt('Enter rejection reason (optional):');

    try {
      const { error } = await supabase
        .from('sponsor_users')
        .update({
          status: 'rejected',
          rejection_reason: reason || null,
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', userId);

      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
              <p className="text-gray-600 mt-1">Review and approve sponsor access requests</p>
            </div>
            <a
              href="/admin"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pendingUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending approval requests at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {user.company_name || 'No company name provided'}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>
                              Requested {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Associate with Sponsor
                          </label>
                          <select
                            value={selectedSponsor[user.id] || ''}
                            onChange={(e) => setSelectedSponsor({
                              ...selectedSponsor,
                              [user.id]: e.target.value
                            })}
                            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          >
                            <option value="">Select a sponsor...</option>
                            {sponsors.map((sponsor) => (
                              <option key={sponsor.id} value={sponsor.id}>
                                {sponsor.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <UserCheck className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <UserX className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
