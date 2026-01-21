import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, X, Save, Loader2, Mail, Shield, CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'account_manager' | 'sponsor';
  status: 'pending' | 'approved' | 'rejected';
  sponsor_id: string | null;
  created_at: string;
}

interface Sponsor {
  id: string;
  name: string;
}

interface UserManagementProps {
  onClose: () => void;
}

export function UserManagement({ onClose }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResult, sponsorsResult] = await Promise.all([
        supabase
          .from('sponsor_users')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('sponsors')
          .select('id, name')
          .order('name', { ascending: true })
      ]);

      if (usersResult.data) {
        setUsers(usersResult.data);
      }
      if (sponsorsResult.data) {
        setSponsors(sponsorsResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    setSaving(userId);
    try {
      const { error } = await supabase
        .from('sponsor_users')
        .update(updates)
        .eq('id', userId);

      if (!error) {
        setUsers(prev =>
          prev.map(user =>
            user.id === userId ? { ...user, ...updates } : user
          )
        );
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setSaving(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      account_manager: 'bg-blue-100 text-blue-700',
      sponsor: 'bg-green-100 text-green-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; label: string }> = {
      approved: { icon: CheckCircle, color: 'text-green-600', label: 'Approved' },
      pending: { icon: Clock, color: 'text-yellow-600', label: 'Pending' },
      rejected: { icon: XCircle, color: 'text-red-600', label: 'Rejected' }
    };
    return badges[status] || badges.pending;
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              {users.length} user{users.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm ? 'No users found matching your search' : 'No users yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map(user => {
                const statusBadge = getStatusBadge(user.status);
                const StatusIcon = statusBadge.icon;

                const assignedSponsor = sponsors.find(s => s.id === user.sponsor_id);

                return (
                  <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-900 truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>
                            Created {new Date(user.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {assignedSponsor && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                <span className="truncate font-medium">{assignedSponsor.name}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-gray-400" />
                            <select
                              value={user.role}
                              onChange={(e) =>
                                updateUser(user.id, { role: e.target.value as any })
                              }
                              disabled={saving === user.id}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                getRoleBadgeColor(user.role)
                              }`}
                            >
                              <option value="sponsor">Sponsor</option>
                              <option value="account_manager">Account Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-3.5 h-3.5 ${statusBadge.color}`} />
                            <select
                              value={user.status}
                              onChange={(e) =>
                                updateUser(user.id, { status: e.target.value as any })
                              }
                              disabled={saving === user.id}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            <select
                              value={user.sponsor_id || ''}
                              onChange={(e) =>
                                updateUser(user.id, { sponsor_id: e.target.value || null })
                              }
                              disabled={saving === user.id}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px]"
                            >
                              <option value="">No sponsor assigned</option>
                              {sponsors.map(sponsor => (
                                <option key={sponsor.id} value={sponsor.id}>
                                  {sponsor.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {saving === user.id && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
