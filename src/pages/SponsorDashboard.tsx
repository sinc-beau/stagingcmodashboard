import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatEventType } from '../lib/eventUtils';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { SponsorAllLeads } from '../components/SponsorAllLeads';
import { SponsorMyEvents } from '../components/SponsorMyEvents';
import { SponsorMessages } from '../components/SponsorMessages';
import { ObligationDisplay } from '../components/ObligationDisplay';
import { FileUpload } from '../components/FileUpload';
import { EventTargeting } from '../components/EventTargeting';
import { Calendar, Users, MessageSquare, Building2, LogOut, Loader2, ArrowLeft, FileText, CheckCircle2, MapPin, ChevronDown, ChevronRight, Circle, Download, ArrowUpDown, Eye, UserCog, Shield, TrendingUp } from 'lucide-react';

interface SponsorEvent {
  id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  event_location: string | null;
  event_venue: string | null;
  event_brand: string | null;
  is_published: boolean;
  published_at: string | null;
  source_event_id: string;
  source_database: string;
}

interface IntakeItem {
  id: string;
  item_label: string;
  item_description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  display_order: number;
  item_type?: string;
  file_url?: string | null;
  file_urls?: string[];
  file_accept?: string | null;
  max_file_size_mb?: number | null;
  max_files?: number | null;
}

interface SponsorInfo {
  id: string;
  name: string;
  url: string | null;
  logo_url: string | null;
  about: string | null;
  sinc_rep: string | null;
}

type TabType = 'leads' | 'events' | 'messages' | 'obligations';

export function SponsorDashboard() {
  return (
    <ProtectedRoute requireSponsor requireApproved>
      <SponsorDashboardContent />
    </ProtectedRoute>
  );
}

function SponsorDashboardContent() {
  const { sponsorUser, signOut, isAdmin, viewAs, setViewAs } = useAuth();
  const [sponsor, setSponsor] = useState<SponsorInfo | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SponsorEvent | null>(null);
  const [intakeItems, setIntakeItems] = useState<IntakeItem[]>([]);
  const [loadingIntake, setLoadingIntake] = useState(false);
  const [intakeExpanded, setIntakeExpanded] = useState(false);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [eventTab, setEventTab] = useState<'intake' | 'targeting' | 'messages' | 'attendees'>('intake');
  const [stats, setStats] = useState({ eventCount: 0, leadCount: 0, attendeeCount: 0, avgDelivery: 0 });

  useEffect(() => {
    loadDashboardData();
  }, [sponsorUser]);

  useEffect(() => {
    if (selectedEvent) {
      loadIntakeItems();
      loadAttendees();
    } else {
      setIntakeExpanded(false);
      setAttendees([]);
    }
  }, [selectedEvent]);

  const loadDashboardData = async () => {
    if (!sponsorUser?.sponsor_id) {
      setLoading(false);
      return;
    }

    try {
      const [sponsorData, messagesData, eventsData, leadsData, attendeesData] = await Promise.all([
        supabase
          .from('sponsors')
          .select('*')
          .eq('id', sponsorUser.sponsor_id)
          .maybeSingle(),
        supabase
          .from('sponsor_messages')
          .select('id', { count: 'exact', head: true })
          .eq('sponsor_id', sponsorUser.sponsor_id)
          .eq('sent_by_role', 'admin')
          .eq('is_read', false),
        supabase
          .from('sponsor_events')
          .select('id, events(id, minimum_attendees)', { count: 'exact' })
          .eq('sponsor_id', sponsorUser.sponsor_id)
          .eq('is_published', true),
        supabase
          .from('sponsor_leads')
          .select('id', { count: 'exact', head: true })
          .eq('sponsor_id', sponsorUser.sponsor_id),
        supabase
          .from('sponsor_leads')
          .select('id', { count: 'exact', head: true })
          .eq('sponsor_id', sponsorUser.sponsor_id)
          .eq('attendance_status', 'attended')
      ]);

      if (sponsorData.data) setSponsor(sponsorData.data);
      if (messagesData.count) setUnreadCount(messagesData.count);

      const eventCount = eventsData.count || 0;
      const leadCount = leadsData.count || 0;
      const attendeeCount = attendeesData.count || 0;

      let avgDelivery = 0;
      if (eventsData.data && eventsData.data.length > 0) {
        const eventsWithDetails = await Promise.all(
          eventsData.data.map(async (se: any) => {
            const eventId = se.events?.id;
            if (!eventId) return null;

            const { data: eventDetail } = await supabase
              .from('events')
              .select('event_date')
              .eq('id', eventId)
              .maybeSingle();

            const { count } = await supabase
              .from('sponsor_leads')
              .select('id', { count: 'exact', head: true })
              .eq('sponsor_id', sponsorUser.sponsor_id)
              .eq('event_id', eventId)
              .eq('attendance_status', 'attended');

            const minimum = se.events?.minimum_attendees || 0;
            const isPreEvent = eventDetail?.event_date && new Date(eventDetail.event_date) > new Date();
            const isOngoing = !eventDetail?.event_date;

            if (minimum > 0 && count !== null && !isPreEvent && !isOngoing) {
              return ((count - minimum) / minimum) * 100;
            }
            return null;
          })
        );

        const deliveryPercentages = eventsWithDetails.filter((p): p is number => p !== null);
        if (deliveryPercentages.length > 0) {
          avgDelivery = Math.round(deliveryPercentages.reduce((a, b) => a + b, 0) / deliveryPercentages.length);
        }
      }

      setStats({ eventCount, leadCount, attendeeCount, avgDelivery });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIntakeItems = async () => {
    if (!sponsorUser?.sponsor_id || !selectedEvent) return;

    setLoadingIntake(true);
    try {
      let { data: items } = await supabase
        .from('event_intake_items')
        .select('*')
        .eq('sponsor_id', sponsorUser.sponsor_id)
        .eq('event_id', selectedEvent.id)
        .order('display_order', { ascending: true });

      if (!items || items.length === 0) {
        const { data: templates } = await supabase
          .from('intake_item_templates')
          .select('*')
          .eq('event_type', selectedEvent.event_type)
          .order('display_order', { ascending: true });

        if (templates && templates.length > 0) {
          const newItems = templates.map(t => ({
            sponsor_id: sponsorUser.sponsor_id,
            event_id: selectedEvent.id,
            event_name: selectedEvent.event_name,
            event_type: selectedEvent.event_type,
            item_label: t.item_label,
            item_description: t.item_description,
            item_type: t.item_type || 'text',
            is_completed: false,
            display_order: t.display_order
          }));

          const { data: inserted } = await supabase
            .from('event_intake_items')
            .insert(newItems)
            .select('*');

          if (inserted) {
            items = inserted;
          }
        }
      }

      if (items) {
        setIntakeItems(items);
      }
    } catch (error) {
      console.error('Error loading intake items:', error);
    } finally {
      setLoadingIntake(false);
    }
  };

  const toggleIntakeItem = async (itemId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('event_intake_items')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', itemId);

      if (!error) {
        setIntakeItems(prev =>
          prev.map(item =>
            item.id === itemId
              ? { ...item, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating intake item:', error);
    }
  };

  const loadAttendees = async () => {
    if (!sponsorUser?.sponsor_id || !selectedEvent) return;

    try {
      const { data } = await supabase
        .from('sponsor_leads')
        .select('*')
        .eq('sponsor_id', sponsorUser.sponsor_id)
        .eq('event_id', selectedEvent.id)
        .order('created_at', { ascending: false });

      if (data) {
        setAttendees(data);
      }
    } catch (error) {
      console.error('Error loading attendees:', error);
    }
  };

  const updateIntakeItemNotes = async (itemId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('event_intake_items')
        .update({ notes })
        .eq('id', itemId);

      if (!error) {
        setIntakeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, notes } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const updateIntakeItemFile = async (itemId: string, fileUrl: string) => {
    try {
      const { error } = await supabase
        .from('event_intake_items')
        .update({ file_url: fileUrl })
        .eq('id', itemId);

      if (!error) {
        setIntakeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, file_url: fileUrl } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating file:', error);
    }
  };

  const updateIntakeItemFiles = async (itemId: string, fileUrls: string[]) => {
    try {
      const { error } = await supabase
        .from('event_intake_items')
        .update({ file_urls: fileUrls })
        .eq('id', itemId);

      if (!error) {
        setIntakeItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, file_urls: fileUrls } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating files:', error);
    }
  };

  const getDefaultValue = (label: string): string => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes('company name')) {
      return sponsor?.name || '';
    }
    if (normalizedLabel.includes('url') && sponsor?.url) {
      return sponsor.url;
    }
    if (normalizedLabel.includes('about') && sponsor?.about) {
      return sponsor.about;
    }
    return '';
  };

  const exportAttendees = () => {
    if (attendees.length === 0) return;

    const csvContent = [
      ['Name', 'Email', 'Company', 'Title', 'Status'].join(','),
      ...attendees.map(a => [
        a.name || '',
        a.email || '',
        a.company || '',
        a.title || '',
        getStatusLabel(a.attendance_status)
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent?.event_name || 'event'}-attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'attended':
        return 'Attended';
      case 'no_show':
        return 'Declined';
      case 'pending':
        return 'Registered';
      default:
        return 'Unknown';
    }
  };

  const getStatusStyle = (status: string): string => {
    switch (status) {
      case 'attended':
        return 'bg-green-100 text-green-700';
      case 'no_show':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const toggleSort = (column: 'name' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedAttendees = [...attendees].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return sortOrder === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else {
      const statusOrder = { attended: 0, pending: 1, no_show: 2 };
      const statusA = statusOrder[a.attendance_status as keyof typeof statusOrder] ?? 3;
      const statusB = statusOrder[b.attendance_status as keyof typeof statusOrder] ?? 3;
      return sortOrder === 'asc'
        ? statusA - statusB
        : statusB - statusA;
    }
  });

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!sponsorUser?.sponsor_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Sponsor Association</h2>
          <p className="text-gray-600 mb-6">
            This account is not associated with a sponsor. Please contact an administrator to set up your sponsor association.
          </p>
          <button
            onClick={handleSignOut}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (selectedEvent) {
    const completedCount = intakeItems.filter(item => item.is_completed).length;
    const totalCount = intakeItems.length;
    const intakeComplete = totalCount > 0 && completedCount === totalCount;

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Dashboard</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <div className="relative">
                    <button
                      onClick={() => setShowViewMenu(!showViewMenu)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Dev View</span>
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
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
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

        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-start gap-4">
              {sponsor?.logo_url && (
                <img
                  src={sponsor.logo_url}
                  alt="Company logo"
                  className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                />
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{selectedEvent.event_name}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedEvent.event_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  {selectedEvent.event_location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedEvent.event_location}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {formatEventType(selectedEvent.event_type)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 border-t border-gray-200">
              <button
                onClick={() => setEventTab('intake')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  eventTab === 'intake'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                Intake Form
                {!intakeComplete && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                {intakeComplete && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </button>
              <button
                onClick={() => setEventTab('targeting')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  eventTab === 'targeting'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4" />
                Target Attendee Profile
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => setEventTab('messages')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  eventTab === 'messages'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Messages
              </button>
              <button
                onClick={() => setEventTab('attendees')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  eventTab === 'attendees'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4" />
                Attendees
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {eventTab === 'intake' && intakeItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                {intakeItems.map((item) => {
                        const itemType = item.item_type || 'text';

                        return (
                          <div key={item.id} className="space-y-2">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.item_label}
                                </span>
                                {item.item_description && (
                                  <p className="text-xs text-gray-500 mt-1">{item.item_description}</p>
                                )}
                              </div>
                              <button
                                onClick={() => toggleIntakeItem(item.id, !item.is_completed)}
                                className={`ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  item.is_completed
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {item.is_completed ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Complete
                                  </>
                                ) : (
                                  <>
                                    <Circle className="w-3.5 h-3.5" />
                                    Mark Complete
                                  </>
                                )}
                              </button>
                            </div>

                            {itemType === 'file' && (
                              <FileUpload
                                label=""
                                accept={item.file_accept || '*/*'}
                                maxSizeMB={item.max_file_size_mb || 10}
                                maxFiles={1}
                                value={item.file_url || ''}
                                onChange={(value) => updateIntakeItemFile(item.id, value as string)}
                              />
                            )}

                            {itemType === 'multi_file' && (
                              <FileUpload
                                label=""
                                accept={item.file_accept || '*/*'}
                                maxSizeMB={item.max_file_size_mb || 10}
                                maxFiles={item.max_files || 2}
                                value={item.file_urls || []}
                                onChange={(value) => updateIntakeItemFiles(item.id, value as string[])}
                              />
                            )}

                            {itemType === 'text' && (
                              <textarea
                                value={item.notes || getDefaultValue(item.item_label)}
                                onChange={(e) => updateIntakeItemNotes(item.id, e.target.value)}
                                placeholder={`Enter ${item.item_label.toLowerCase()}...`}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            )}
                          </div>
                        );
                      })}
              </div>
            </div>
          )}

          {eventTab === 'targeting' && sponsorUser?.sponsor_id && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <EventTargeting
                sponsorId={sponsorUser.sponsor_id}
                eventId={selectedEvent.id}
                eventName={selectedEvent.event_name}
              />
            </div>
          )}

          {eventTab === 'messages' && sponsorUser?.sponsor_id && (
            <SponsorMessages sponsorId={sponsorUser.sponsor_id} />
          )}

          {eventTab === 'attendees' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Attendees</h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {attendees.length}
                  </span>
                </div>
                {attendees.length > 0 && (
                  <button
                    onClick={exportAttendees}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                )}
              </div>
              {attendees.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Check back soon</p>
                  <p className="text-sm text-gray-400 mt-2">Attendee information will be published here when available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => toggleSort('name')}
                            className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                          >
                            Name
                            {sortBy === 'name' && <ArrowUpDown className="w-3 h-3" />}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => toggleSort('status')}
                            className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                          >
                            Status
                            {sortBy === 'status' && <ArrowUpDown className="w-3 h-3" />}
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedAttendees.map((attendee) => (
                        <tr key={attendee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{attendee.name || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-600">{attendee.email || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-600">{attendee.company || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-600">{attendee.title || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(attendee.attendance_status)}`}>
                              {getStatusLabel(attendee.attendance_status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {sponsor?.logo_url ? (
                <img
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <Building2 className="w-8 h-8 text-blue-600" />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{sponsor?.name || 'Sponsor Portal'}</h1>
                <p className="text-xs text-gray-500">{sponsorUser?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('messages')}
                className="relative flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Messages</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {isAdmin && (
                <div className="relative">
                  <button
                    onClick={() => setShowViewMenu(!showViewMenu)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Dev View</span>
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
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Manage your events, leads, and communications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.eventCount}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.leadCount}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.attendeeCount}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Delivery</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.avgDelivery > 0 && '+'}{stats.avgDelivery}%
                </p>
              </div>
              <TrendingUp className={`w-10 h-10 ${stats.avgDelivery >= 0 ? 'text-green-600' : 'text-red-600'} opacity-80`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('leads')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'leads'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>All Leads</span>
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'events'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>My Events</span>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'messages'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('obligations')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'obligations'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Obligations</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'leads' && sponsorUser?.sponsor_id && (
              <SponsorAllLeads sponsorId={sponsorUser.sponsor_id} />
            )}
            {activeTab === 'events' && sponsorUser?.sponsor_id && (
              <SponsorMyEvents
                sponsorId={sponsorUser.sponsor_id}
                sponsorName={sponsor?.name || ''}
                onViewEvent={setSelectedEvent}
              />
            )}
            {activeTab === 'messages' && sponsorUser?.sponsor_id && (
              <SponsorMessages sponsorId={sponsorUser.sponsor_id} />
            )}
            {activeTab === 'obligations' && sponsorUser?.sponsor_id && (
              <ObligationDisplay sponsorId={sponsorUser.sponsor_id} />
            )}
          </div>
        </div>

        {sponsor && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Company Name</p>
                <p className="font-medium text-gray-900">{sponsor.name}</p>
              </div>
              {sponsor.sinc_rep && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">SINC Representative</p>
                  <p className="font-medium text-gray-900">{sponsor.sinc_rep}</p>
                </div>
              )}
              {sponsor.about && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">About</p>
                  <p className="text-gray-700">{sponsor.about}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
