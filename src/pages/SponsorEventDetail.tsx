import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Calendar, Users, ArrowLeft, Loader2, Download, ChevronDown, ChevronRight, CheckCircle2, Circle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SponsorMessages } from '../components/SponsorMessages';

interface Lead {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  alternative_email: string | null;
  company: string | null;
  title: string | null;
  register_number: string | null;
  alternative_number: string | null;
  wishlist: string | null;
  stage: string | null;
  attendance_status: string | null;
  no_show_reason: string | null;
  lead_status: string | null;
  created_at: string;
}

interface IntakeItem {
  id: string;
  item_label: string;
  item_description: string | null;
  is_completed: boolean;
  display_order: number;
  notes: string | null;
}

interface SponsorEvent {
  id: string;
  event_name: string;
  event_date: string;
  published_at: string;
  source_event_id: string;
  source_database: string;
  minimum_attendees: number | null;
}

export function SponsorEventDetail({ eventId }: { eventId: string }) {
  return (
    <ProtectedRoute requireSponsor requireApproved>
      <SponsorEventDetailContent eventId={eventId} />
    </ProtectedRoute>
  );
}

function SponsorEventDetailContent({ eventId }: { eventId: string }) {
  const { sponsorUser } = useAuth();
  const [event, setEvent] = useState<SponsorEvent | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [intakeItems, setIntakeItems] = useState<IntakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [intakeExpanded, setIntakeExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [attendedCount, setAttendedCount] = useState(0);

  useEffect(() => {
    loadEventData();
  }, [eventId, sponsorUser]);

  const loadEventData = async () => {
    if (!sponsorUser?.sponsor_id) return;

    try {
      const eventData = await supabase
        .from('sponsor_events')
        .select('*, events(*)')
        .eq('sponsor_id', sponsorUser.sponsor_id)
        .eq('id', eventId)
        .maybeSingle();

      console.log('Event data:', eventData);

      if (!eventData.data || !eventData.data.events) {
        console.log('No event found for ID:', eventId);
        setLoading(false);
        return;
      }

      const eventWithDetails = {
        ...eventData.data,
        event_name: eventData.data.events.event_name,
        event_date: eventData.data.events.event_date,
        source_event_id: eventData.data.events.source_event_id,
        source_database: eventData.data.events.source_database,
        minimum_attendees: eventData.data.events.minimum_attendees
      };

      setEvent(eventWithDetails);

      const actualEventId = eventData.data.event_id;

      console.log('Loading leads for event_id:', actualEventId);

      const [leadsData, intakeData] = await Promise.all([
        supabase
          .from('sponsor_leads')
          .select('*')
          .eq('sponsor_id', sponsorUser.sponsor_id)
          .eq('event_id', actualEventId)
          .order('created_at', { ascending: false }),
        supabase
          .from('event_intake_items')
          .select('id, item_label, item_description, is_completed, display_order, notes')
          .eq('sponsor_id', sponsorUser.sponsor_id)
          .eq('event_id', actualEventId)
          .order('display_order')
      ]);

      console.log('Leads data:', leadsData);
      console.log('Intake data:', intakeData);

      if (leadsData.data) {
        setLeads(leadsData.data);
        const attended = leadsData.data.filter((lead: Lead) => lead.attendance_status === 'attended').length;
        setAttendedCount(attended);
      }
      if (intakeData.data) setIntakeItems(intakeData.data);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
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
        setEditingNotes(prev => {
          const updated = { ...prev };
          delete updated[itemId];
          return updated;
        });
      }
    } catch (error) {
      console.error('Error updating intake item:', error);
    }
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;

    const headers = ['First Name', 'Last Name', 'Email', 'Alternative Email', 'Company', 'Title', 'Phone', 'Phone 2', 'Attendance Status', 'Lead Status', 'Wishlist'];
    const rows = leads.map(lead => {
      return [
        lead.first_name || '',
        lead.last_name || '',
        lead.email || '',
        lead.alternative_email || '',
        lead.company || '',
        lead.title || '',
        lead.register_number || '',
        lead.alternative_number || '',
        lead.attendance_status || '',
        lead.lead_status || '',
        lead.wishlist || ''
      ].map(field => `"${field}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.event_name || 'event'}-leads.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Event not found or not published</p>
          <a href="/sponsor/events" className="text-blue-600 hover:text-blue-700 text-sm mt-4 inline-block">
            Back to Events
          </a>
        </div>
      </div>
    );
  }

  const hasMinimum = event.minimum_attendees && event.minimum_attendees > 0;
  const hasAttendees = attendedCount > 0;
  const showDelivery = hasMinimum && hasAttendees;

  let deliveryStatus: 'over' | 'under' | 'met' | null = null;
  let deliveryDiff = 0;

  if (showDelivery && event.minimum_attendees) {
    deliveryDiff = attendedCount - event.minimum_attendees;
    if (deliveryDiff > 0) {
      deliveryStatus = 'over';
    } else if (deliveryDiff < 0) {
      deliveryStatus = 'under';
    } else {
      deliveryStatus = 'met';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href="/sponsor"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.event_name}</h1>
              <p className="text-gray-600 mb-2">
                {new Date(event.event_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {showDelivery && deliveryStatus && (
                <div className="flex items-center gap-3 mt-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    deliveryStatus === 'over'
                      ? 'bg-green-100 text-green-700'
                      : deliveryStatus === 'under'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {deliveryStatus === 'over' && <TrendingUp className="w-5 h-5" />}
                    {deliveryStatus === 'under' && <TrendingDown className="w-5 h-5" />}
                    {deliveryStatus === 'met' && <Minus className="w-5 h-5" />}
                    <span className="text-sm">
                      {attendedCount} of {event.minimum_attendees} minimum attendees
                    </span>
                    {deliveryStatus === 'over' && <span className="font-bold">(+{deliveryDiff})</span>}
                    {deliveryStatus === 'under' && <span className="font-bold">({deliveryDiff})</span>}
                  </div>
                </div>
              )}
              {event.published_at && (
                <p className="text-sm text-gray-500 mt-2">
                  Published on {new Date(event.published_at).toLocaleDateString()}
                </p>
              )}
            </div>
            {leads.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {intakeItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setIntakeExpanded(!intakeExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {intakeExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <h2 className="text-lg font-semibold text-gray-900">Event Intake Form</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  intakeItems.every(item => item.is_completed)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {intakeItems.filter(item => item.is_completed).length} of {intakeItems.length} complete
                </span>
              </div>
            </button>

            {intakeExpanded && (
              <div className="border-t border-gray-200 p-6">
                <div className="space-y-4">
                  {intakeItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {item.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.item_label}</p>
                          {item.item_description && (
                            <p className="text-sm text-gray-500 mt-1">{item.item_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="ml-8">
                        <textarea
                          value={editingNotes[item.id] !== undefined ? editingNotes[item.id] : (item.notes || '')}
                          onChange={(e) => setEditingNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                          onBlur={() => {
                            if (editingNotes[item.id] !== undefined) {
                              updateIntakeItemNotes(item.id, editingNotes[item.id]);
                            }
                          }}
                          placeholder="Enter your response here..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Attendees</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {leads.length}
              </span>
            </div>
          </div>
          {leads.length === 0 ? (
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
                      Name
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
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => {
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{lead.name || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600">{lead.email || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600">{lead.company || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600">{lead.title || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600">{lead.register_number || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            lead.attendance_status === 'attended'
                              ? 'bg-green-100 text-green-700'
                              : lead.attendance_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : lead.attendance_status === 'no_show'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {lead.attendance_status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {sponsorUser?.sponsor_id && (
          <SponsorMessages sponsorId={sponsorUser.sponsor_id} />
        )}
      </div>
    </div>
  );
}
