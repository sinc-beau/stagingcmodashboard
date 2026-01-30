import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, forumEventClient, nonForumEventClient } from '../lib/supabase';
import { normalizeName, mapEventType, syncSponsorsFromExternal, syncSponsorEventsFromExternal } from '../lib/syncSponsors';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserManagement } from '../components/UserManagement';
import {
  Building2,
  Users,
  MessageSquare,
  LogOut,
  Loader2,
  UserCheck,
  Search,
  RefreshCw,
  Eye,
  UserCog,
  Shield,
  ChevronDown,
  Settings
} from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  sinc_rep: string | null;
  created_at: string;
  event_count: number;
  eventTypeCounts: Record<string, number>;
  undone_message_count: number;
}

interface Stats {
  totalSponsors: number;
  pendingApprovals: number;
  totalMessages: number;
  undoneMessages: number;
}

export function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin requireApproved>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const { sponsorUser, signOut, isAdmin, viewAs, setViewAs } = useAuth();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSponsors: 0,
    pendingApprovals: 0,
    totalMessages: 0,
    undoneMessages: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [sponsorsData, pendingData, messagesData, undoneConversationsData] = await Promise.all([
        supabase
          .from('sponsors')
          .select('*')
          .order('name', { ascending: true }),
        supabase
          .from('sponsor_users')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('sponsor_messages')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('sponsors')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_done', false)
      ]);

      // Load events from external databases
      const [{ data: forumSponsors }, { data: eventSponsors }] = await Promise.all([
        forumEventClient.from('sponsors').select('*, forums(*)'),
        nonForumEventClient.from('event_sponsors').select('*, events(*)')
      ]);

      // Build event counts by sponsor name
      const eventsBySponsorName = new Map<string, string[]>();

      if (forumSponsors) {
        forumSponsors.forEach((sponsor: any) => {
          if (sponsor.forums) {
            const normalizedName = normalizeName(sponsor.name);
            if (!eventsBySponsorName.has(normalizedName)) {
              eventsBySponsorName.set(normalizedName, []);
            }
            eventsBySponsorName.get(normalizedName)!.push('forum');
          }
        });
      }

      if (eventSponsors) {
        eventSponsors.forEach((sponsor: any) => {
          if (sponsor.events) {
            const normalizedName = normalizeName(sponsor.name);
            if (!eventsBySponsorName.has(normalizedName)) {
              eventsBySponsorName.set(normalizedName, []);
            }
            const eventType = mapEventType(sponsor.events.type);
            eventsBySponsorName.get(normalizedName)!.push(eventType);
          }
        });
      }

      // Build set of sponsors with undone conversations
      const undoneConversationsSet = new Set<string>();
      (undoneConversationsData.data || []).forEach((sponsor: any) => {
        undoneConversationsSet.add(sponsor.id);
      });

      // Merge event data with sponsors
      const sponsorsWithEvents: Sponsor[] = (sponsorsData.data || []).map((sponsor: any) => {
        const normalizedName = normalizeName(sponsor.name);
        const events = eventsBySponsorName.get(normalizedName) || [];
        const eventTypeCounts: Record<string, number> = {};

        events.forEach(type => {
          const displayType = formatEventType(type);
          eventTypeCounts[displayType] = (eventTypeCounts[displayType] || 0) + 1;
        });

        return {
          ...sponsor,
          event_count: events.length,
          eventTypeCounts,
          undone_message_count: undoneConversationsSet.has(sponsor.id) ? 1 : 0
        };
      });

      setSponsors(sponsorsWithEvents);

      setStats({
        totalSponsors: sponsorsData.data?.length || 0,
        pendingApprovals: pendingData.count || 0,
        totalMessages: messagesData.count || 0,
        undoneMessages: undoneConversationsData.count || 0
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventType = (type: string): string => {
    const typeMap: Record<string, string> = {
      forum: 'Forum',
      dinner: 'Dinner',
      vrt: 'VRT',
      learn_go: 'Learn & Go',
      activation: 'Activation',
      veb: 'VEB',
      other: 'Other'
    };
    return typeMap[type] || type;
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncSponsorsFromExternal();
      await syncSponsorEventsFromExternal();
      await loadDashboardData();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const filteredSponsors = sponsors.filter(sponsor =>
    sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sponsor.sinc_rep && sponsor.sinc_rep.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sinc-gray-light">
        <Loader2 className="w-8 h-8 animate-spin text-sinc-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sinc-gray-light">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-sinc-blue" />
              <div>
                <h1 className="text-xl font-heading font-bold text-sinc-gray-dark">Admin Portal</h1>
                <p className="text-xs text-gray-500">{sponsorUser?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/admin/messages"
                className="relative flex items-center gap-2 px-4 py-2 text-sinc-gray-dark hover:bg-sinc-gray-light rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-body font-semibold">Messages</span>
                {stats.undoneMessages > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </a>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-semibold">{syncing ? 'Syncing...' : 'Sync External Data'}</span>
              </button>
              {isAdmin && viewAs === null && (
                <button
                  onClick={() => setShowUserManagement(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sinc-gray-dark hover:bg-sinc-gray-light rounded-lg transition-colors border border-gray-300"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-body font-semibold">User Management</span>
                </button>
              )}
              {isAdmin && (
                <div className="relative">
                  <button
                    onClick={() => setShowViewMenu(!showViewMenu)}
                    className="flex items-center gap-2 px-4 py-2 text-sinc-gray-dark hover:bg-sinc-gray-light rounded-lg transition-colors border border-gray-300"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-body font-semibold">Dev View</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showViewMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowViewMenu(false)}></div>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                        <button
                          onClick={() => { setViewAs(null); setShowViewMenu(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            viewAs === null
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin View</span>
                        </button>
                        <button
                          onClick={() => { setViewAs('account_manager'); setShowViewMenu(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            viewAs === 'account_manager'
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <UserCog className="w-4 h-4" />
                          <span>Account Manager View</span>
                        </button>
                        <button
                          onClick={() => { setViewAs('sponsor'); setShowViewMenu(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            viewAs === 'sponsor'
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          <span>Sponsor View</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sinc-gray-dark hover:bg-sinc-gray-light rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-body font-semibold">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-red-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-center">
            This dashboard is currently in beta. Please forward feature requests to your SINC account representative.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage sponsors, approvals, and communications</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">All Sponsors</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sponsors..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sinc-blue focus:border-transparent outline-none w-full sm:w-64"
                />
              </div>
            </div>
          </div>
          {filteredSponsors.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {searchQuery ? 'No sponsors found' : 'No sponsors yet'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sinc-blue hover:text-sinc-blue/80 text-sm font-body font-semibold"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSponsors.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={`/admin/sponsors/${sponsor.id}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-16 h-10 bg-sinc-blue-light rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {sponsor.logo_url ? (
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-sinc-blue" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{sponsor.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {sponsor.sinc_rep && (
                          <span>{sponsor.sinc_rep}</span>
                        )}
                      </div>
                    </div>
                    {Object.keys(sponsor.eventTypeCounts).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(sponsor.eventTypeCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([type, count]) => (
                            <span
                              key={type}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-sinc-blue-light text-sinc-blue text-xs font-medium rounded"
                            >
                              <span className="font-bold">{count}</span>
                              <span>{count > 1 ? `${type}s` : type}</span>
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {sponsor.undone_message_count > 0 && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                    <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                      Manage
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
    </div>
  );
}
