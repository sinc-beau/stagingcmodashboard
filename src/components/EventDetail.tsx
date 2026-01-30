import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Calendar, MapPin, User, RefreshCw, CheckCircle, XCircle, AlertCircle, Filter, ChevronDown, ChevronUp, ChevronRight, Users } from 'lucide-react';
import { supabase, forumEventClient, nonForumEventClient, forumAttendeeClient, nonForumAttendeeClient } from '../lib/supabase';

interface Attendee {
  id: string;
  name: string;
  email: string;
  company: string | null;
  title: string | null;
  phone: string | null;
  stage: string | null;
  approval_status: string | null;
  alternative_email?: string | null;
  alternative_number?: string | null;
  wishlist?: string | null;
  no_show_reason?: string | null;
}

interface IntakeItem {
  id: string;
  item_label: string;
  item_description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  display_order: number;
}

interface LocalEvent {
  id: string;
  minimum_attendees: number | null;
  solution_provider_topic: string | null;
  event_notes: string | null;
  one_on_one_meetings: Record<string, { status: string; time_slot?: string; notes?: string }>;
}

interface OneOnOneMeeting {
  attendee_id: string;
  attendee_name: string;
  status: 'requested' | 'confirmed' | 'scheduled';
  time_slot?: string;
  notes?: string;
}

interface EventDetailProps {
  eventId: string;
  eventName: string;
  eventType: string;
  sponsorId: string;
  sponsorName: string;
  sourceEventId: string;
  sourceDatabase: string;
  onBack: () => void;
}

type Tab = 'attendees' | 'config' | 'meetings';

export default function EventDetail({ eventId, eventName, eventType, sponsorId, sponsorName, sourceEventId, sourceDatabase, onBack }: EventDetailProps) {
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [intakeItems, setIntakeItems] = useState<IntakeItem[]>([]);
  const [localEvent, setLocalEvent] = useState<LocalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');
  const [activeTab, setActiveTab] = useState<Tab>('attendees');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [intakeExpanded, setIntakeExpanded] = useState(false);
  const isLoadingIntakeItems = useRef(false);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  function getDefaultMinimumAttendees(type: string): number {
    const typeMap: Record<string, number> = {
      'forum': 60,
      'dinner': 8,
      'vrt': 6,
      'learn_go': 8,
      'activation': 30,
      'veb': 8,
      'other': 8
    };
    return typeMap[type] || 8;
  }

  async function loadEventData() {
    setLoading(true);

    const isForum = sourceDatabase === 'forum_event';
    const eventClient = isForum ? forumEventClient : nonForumEventClient;

    const { data: eventData } = await eventClient
      .from(isForum ? 'forums' : 'events')
      .select('*')
      .eq('id', sourceEventId)
      .maybeSingle();

    setEvent(eventData);

    await loadAttendees();
    await loadIntakeItems();
    await loadOrCreateLocalEvent();

    setLoading(false);
  }

  async function loadOrCreateLocalEvent() {
    const { data: centralEvent } = await supabase
      .from('events')
      .select('id, minimum_attendees')
      .eq('source_event_id', sourceEventId)
      .eq('source_database', sourceDatabase)
      .maybeSingle();

    if (!centralEvent) {
      console.error('Central event not found. Please run sync first.');
      return;
    }

    const { data: sponsorEvent } = await supabase
      .from('sponsor_events')
      .select('id, solution_provider_topic, event_notes, one_on_one_meetings')
      .eq('sponsor_id', sponsorId)
      .eq('event_id', centralEvent.id)
      .maybeSingle();

    if (sponsorEvent) {
      setLocalEvent({
        ...sponsorEvent,
        minimum_attendees: centralEvent.minimum_attendees
      });
    } else {
      const { data: newSponsorEvent } = await supabase
        .from('sponsor_events')
        .insert({
          sponsor_id: sponsorId,
          event_id: centralEvent.id,
          one_on_one_meetings: false,
          is_published: true
        })
        .select('id, solution_provider_topic, event_notes, one_on_one_meetings')
        .single();

      if (newSponsorEvent) {
        setLocalEvent({
          ...newSponsorEvent,
          minimum_attendees: centralEvent.minimum_attendees
        });
      }
    }
  }

  async function loadAttendees() {
    const isForum = sourceDatabase === 'forum_event';
    const attendeeClient = isForum ? forumAttendeeClient : nonForumAttendeeClient;

    let attendeeData = [];

    if (isForum) {
      const { data } = await attendeeClient
        .from('attendees')
        .select('id, first_name, last_name, email, company, title, stage, cellphone, forum_id')
        .eq('forum_id', sourceEventId);

      attendeeData = (data || []).map((a: any) => ({
        id: a.id,
        name: `${a.first_name || ''} ${a.last_name || ''}`.trim(),
        email: a.email,
        company: a.company,
        title: a.title,
        phone: a.cellphone,
        stage: a.stage,
        approval_status: null,
      }));
    } else {
      const tableName = getAttendeeTableName(eventType);
      const selectFields = getAttendeeSelectFields(eventType);

      const { data } = await attendeeClient
        .from(tableName)
        .select(selectFields)
        .eq('event_id', sourceEventId);

      attendeeData = (data || []).map((a: any) => ({
        id: a.id,
        name: `${a.first_name || ''} ${a.last_name || ''}`.trim(),
        email: a.email,
        company: a.company,
        title: a.title,
        phone: a.register_number || null,
        stage: null,
        approval_status: a.attendance_status,
        alternative_email: a.alternative_email || null,
        alternative_number: a.alternative_number || null,
        wishlist: a.wishlist || null,
        no_show_reason: a.no_show_reason || null,
      }));
    }

    setAttendees(attendeeData);
  }

  function getAttendeeTableName(type: string): string {
    const tableMap: Record<string, string> = {
      'dinner': 'dinner_attendees',
      'veb': 'veb_attendees',
      'vrt': 'vrt_attendees',
      'activation': 'activation_attendees',
      'learn_go': 'learn_go_attendees'
    };
    return tableMap[type] || 'attendees';
  }

  function getAttendeeSelectFields(type: string): string {
    const baseFields = 'id, first_name, last_name, email, company, title, attendance_status, wishlist, no_show_reason, event_id';

    const typeFieldsMap: Record<string, string> = {
      'dinner': `${baseFields}, alternative_email, register_number, alternative_number`,
      'activation': `${baseFields}, alternative_email, register_number, alternative_number`,
      'veb': `${baseFields}, register_number, alternative_number`,
      'vrt': `${baseFields}, register_number, alternative_number`,
      'learn_go': 'id, first_name, last_name, email, company, title, attendance_status, no_show_reason, event_id'
    };

    return typeFieldsMap[type] || baseFields;
  }

  async function loadIntakeItems() {
    if (isLoadingIntakeItems.current) {
      return;
    }

    isLoadingIntakeItems.current = true;

    try {
      const { data: existingItems } = await supabase
        .from('event_intake_items')
        .select('*')
        .eq('event_id', eventId)
        .eq('sponsor_id', sponsorId)
        .order('display_order');

      if (existingItems && existingItems.length > 0) {
        setIntakeItems(existingItems);
        return;
      }

      const { data: templates } = await supabase
        .from('intake_item_templates')
        .select('*')
        .eq('event_type', eventType)
        .order('display_order');

      if (templates && templates.length > 0) {
        const newItems = templates.map(template => ({
          sponsor_id: sponsorId,
          event_id: eventId,
          event_name: eventName,
          event_type: eventType,
          item_label: template.item_label,
          item_description: template.item_description,
          is_completed: false,
          completed_at: null,
          notes: null,
          display_order: template.display_order
        }));

        const { data: insertedItems } = await supabase
          .from('event_intake_items')
          .insert(newItems)
          .select('*');

        if (insertedItems) {
          setIntakeItems(insertedItems);
        }
      }
    } finally {
      isLoadingIntakeItems.current = false;
    }
  }

  async function syncAttendees() {
    setSyncing(true);
    await loadAttendees();
    setSyncing(false);
  }

  function getUniqueStatuses(): string[] {
    const isForum = sourceDatabase === 'forum_event';
    const statuses = new Set<string>();

    attendees.forEach(attendee => {
      const status = isForum ? attendee.stage : attendee.approval_status;
      if (status) {
        statuses.add(status);
      }
    });

    return Array.from(statuses).sort();
  }

  function handleOpenSyncModal() {
    const uniqueStatuses = getUniqueStatuses();
    setSelectedStatuses(uniqueStatuses);
    setShowSyncModal(true);
  }

  function toggleStatus(status: string) {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  }

  function getAttendeesToSync(): Attendee[] {
    if (selectedStatuses.length === 0) return [];

    const isForum = sourceDatabase === 'forum_event';
    return attendees.filter(attendee => {
      const status = isForum ? attendee.stage : attendee.approval_status;
      return status && selectedStatuses.includes(status);
    });
  }

  async function confirmSync() {
    const attendeesToSync = getAttendeesToSync();

    setSyncing(true);
    setShowSyncModal(false);

    try {
      const { data: centralEvent } = await supabase
        .from('events')
        .select('id')
        .eq('source_event_id', sourceEventId)
        .eq('source_database', sourceDatabase)
        .maybeSingle();

      if (!centralEvent) {
        console.error('Central event not found. Please run sync first.');
        setSyncing(false);
        return;
      }

      const isForum = sourceDatabase === 'forum_event';

      for (const attendee of attendeesToSync) {
        const nameParts = attendee.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await supabase
          .from('sponsor_leads')
          .upsert({
            sponsor_id: sponsorId,
            event_id: centralEvent.id,
            attendee_id: attendee.id,
            name: attendee.name,
            first_name: firstName,
            last_name: lastName,
            email: attendee.email,
            alternative_email: attendee.alternative_email || null,
            company: attendee.company,
            title: attendee.title,
            register_number: attendee.phone,
            alternative_number: attendee.alternative_number || null,
            wishlist: attendee.wishlist || null,
            stage: isForum ? attendee.stage : null,
            attendance_status: isForum ? null : attendee.approval_status,
            no_show_reason: attendee.no_show_reason || null,
            lead_status: 'new',
            source_database: sourceDatabase
          }, {
            onConflict: 'sponsor_id,attendee_id,event_id',
            ignoreDuplicates: false
          });
      }
    } catch (error) {
      console.error('Error syncing attendees:', error);
    } finally {
      setSyncing(false);
    }
  }

  async function updateLocalEvent(updates: Partial<LocalEvent>) {
    if (!localEvent) return;

    setSaving(true);
    await supabase
      .from('sponsor_events')
      .update(updates)
      .eq('id', localEvent.id);

    setLocalEvent({ ...localEvent, ...updates });
    setSaving(false);
  }

  async function updateOneOnOneMeeting(attendeeId: string, status: 'requested' | 'confirmed' | 'scheduled', timeSlot?: string, notes?: string) {
    if (!localEvent) return;

    const meetings = { ...localEvent.one_on_one_meetings };

    if (status === 'requested' && !timeSlot && !notes && meetings[attendeeId]) {
      delete meetings[attendeeId];
    } else {
      meetings[attendeeId] = {
        status,
        ...(timeSlot && { time_slot: timeSlot }),
        ...(notes && { notes })
      };
    }

    await updateLocalEvent({ one_on_one_meetings: meetings });
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }


  function getStatusColor(status: string | null): string {
    if (!status) return 'bg-gray-100 text-gray-700';

    const colorMap: Record<string, string> = {
      'confirmed': 'bg-green-100 text-green-700',
      'approved': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'in_queue': 'bg-yellow-100 text-yellow-700',
      'registered': 'bg-blue-100 text-blue-700',
      'waitlisted': 'bg-orange-100 text-orange-700',
      'cancelled': 'bg-red-100 text-red-700',
      'declined': 'bg-red-100 text-red-700',
      'attended': 'bg-emerald-100 text-emerald-700',
      'no_show': 'bg-slate-100 text-slate-700',
      '1': 'bg-blue-100 text-blue-700',
      '2': 'bg-green-100 text-green-700',
      '3': 'bg-purple-100 text-purple-700',
      '4': 'bg-pink-100 text-pink-700'
    };

    return colorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  }

  function getFilteredAndSortedAttendees(): Attendee[] {
    const isForum = sourceDatabase === 'forum_event';

    let filtered = attendees;

    if (statusFilter !== 'all') {
      filtered = attendees.filter(attendee => {
        const status = isForum ? attendee.stage : attendee.approval_status;
        return status === statusFilter;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'status') {
        const statusA = (isForum ? a.stage : a.approval_status) || '';
        const statusB = (isForum ? b.stage : b.approval_status) || '';
        return statusA.localeCompare(statusB);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return sorted;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading event...</div>
      </div>
    );
  }

  const completedCount = intakeItems.filter(item => item.is_completed).length;
  const totalCount = intakeItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const oneOnOneMeetings: OneOnOneMeeting[] = attendees
    .filter(a => localEvent?.one_on_one_meetings?.[a.id])
    .map(a => ({
      attendee_id: a.id,
      attendee_name: a.name,
      status: localEvent?.one_on_one_meetings[a.id].status as 'requested' | 'confirmed' | 'scheduled',
      time_slot: localEvent?.one_on_one_meetings[a.id].time_slot,
      notes: localEvent?.one_on_one_meetings[a.id].notes
    }));

  const requestedMeetingsCount = oneOnOneMeetings.filter(m => m.status === 'requested').length;

  const isForum = eventType === 'forum';
  const uniqueStatuses = getUniqueStatuses();
  const filteredSortedAttendees = getFilteredAndSortedAttendees();
  const attendeesToSync = getAttendeesToSync();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to {sponsorName}
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                    {sponsorName}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-medium text-sm">
                    {eventType.toUpperCase()}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{eventName}</h1>
                <p className="text-sm text-slate-500 mb-3">
                  Viewing event details for <span className="font-semibold text-slate-700">{sponsorName}</span>
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  {event?.date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDate(event.date)}
                    </div>
                  )}
                  {event?.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {event.city}
                    </div>
                  )}
                </div>
              </div>
              {saving && <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Saving...</span>}
            </div>
          </div>

          <div className="border-b border-slate-200">
            <div className="flex gap-1 px-6">
              <button
                onClick={() => setActiveTab('attendees')}
                className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === 'attendees'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Attendees ({attendees.length})
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === 'config'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Event Config
              </button>
              {isForum && (
                <button
                  onClick={() => setActiveTab('meetings')}
                  className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === 'meetings'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1:1 Meetings {requestedMeetingsCount > 0 && `(${requestedMeetingsCount})`}
                </button>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'attendees' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Attendees ({attendees.length})</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={syncAttendees}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button
                    onClick={handleOpenSyncModal}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <Users className="w-4 h-4" />
                    Sync to Sponsor
                  </button>
                </div>
              </div>

              {attendees.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                          statusFilter === 'all'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        All
                      </button>
                      {uniqueStatuses.map(status => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                            statusFilter === status
                              ? 'bg-slate-900 text-white'
                              : `${getStatusColor(status)} hover:opacity-80`
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Sort by:</span>
                    <button
                      onClick={() => setSortBy('name')}
                      className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                        sortBy === 'name'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Name
                    </button>
                    <button
                      onClick={() => setSortBy('status')}
                      className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                        sortBy === 'status'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Status
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              {attendees.length === 0 ? (
                <div className="text-sm text-slate-400 py-8 text-center">
                  No attendees found
                </div>
              ) : filteredSortedAttendees.length === 0 ? (
                <div className="text-sm text-slate-400 py-8 text-center">
                  No attendees match the selected filter
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredSortedAttendees.map((attendee) => {
                    const status = isForum ? attendee.stage : attendee.approval_status;
                    return (
                      <div key={attendee.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <div className="font-semibold text-slate-900 text-sm">
                              {attendee.name}
                            </div>
                          </div>
                          {status && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          )}
                        </div>
                        {(attendee.title || attendee.company) && (
                          <div className="text-sm text-slate-600 mb-1">
                            {attendee.title}{attendee.title && attendee.company ? ' • ' : ''}{attendee.company}
                          </div>
                        )}
                        <div className="text-sm text-slate-500 space-y-0.5">
                          <div>{attendee.email}</div>
                          {attendee.alternative_email && (
                            <div className="text-xs">Alt Email: {attendee.alternative_email}</div>
                          )}
                          {attendee.phone && (
                            <div>Phone: {attendee.phone}</div>
                          )}
                          {attendee.alternative_number && (
                            <div className="text-xs">Alt Phone: {attendee.alternative_number}</div>
                          )}
                          {attendee.wishlist && (
                            <div className="text-xs mt-1 pt-1 border-t border-slate-300">
                              <span className="font-medium">Wishlist:</span> {attendee.wishlist}
                            </div>
                          )}
                          {attendee.no_show_reason && status === 'no_show' && (
                            <div className="text-xs mt-1 pt-1 border-t border-slate-300 text-red-600">
                              <span className="font-medium">No Show Reason:</span> {attendee.no_show_reason}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Event Configuration</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Minimum Attendees Target
                  </label>
                  <input
                    type="number"
                    value={localEvent?.minimum_attendees || ''}
                    onChange={(e) => updateLocalEvent({ minimum_attendees: parseInt(e.target.value) || null })}
                    placeholder="Enter target number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Event Notes
                  </label>
                  <textarea
                    value={localEvent?.event_notes || ''}
                    onChange={(e) => updateLocalEvent({ event_notes: e.target.value })}
                    placeholder="Add internal notes about this event..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => setIntakeExpanded(!intakeExpanded)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {intakeExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                  <h2 className="text-lg font-bold text-slate-900">Event Intake Form</h2>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    progressPercent === 100
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {completedCount} of {totalCount} complete
                  </span>
                </div>
              </button>

              {intakeExpanded && (
                <div className="border-t border-slate-200">
                  <div className="px-6 py-3 bg-slate-50">
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                  {intakeItems.length === 0 ? (
                    <div className="text-sm text-slate-400 py-8 text-center">
                      No intake items
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {intakeItems.map((item) => (
                        <div key={item.id} className="px-6 py-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {item.is_completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className={`text-sm font-medium ${item.is_completed ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                                    {item.item_label}
                                  </div>
                                  {item.item_description && (
                                    <div className="text-xs text-slate-500 mt-0.5">
                                      {item.item_description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {item.notes && (
                                <div className="text-xs text-slate-700 mt-1.5 pl-3 border-l-2 border-slate-300">
                                  {item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'meetings' && isForum && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">1:1 Meeting Assignments</h2>
                {requestedMeetingsCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    {requestedMeetingsCount} Requested
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">
                {oneOnOneMeetings.length} of {attendees.length} attendees assigned
              </p>
            </div>

            {attendees.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No attendees available</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {attendees.map((attendee) => {
                  const meeting = localEvent?.one_on_one_meetings?.[attendee.id];
                  const isAssigned = !!meeting;

                  return (
                    <div key={attendee.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900 text-sm">{attendee.name}</span>
                          {attendee.company && (
                            <span className="text-xs text-slate-500">• {attendee.company}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">{attendee.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAssigned && (
                          <select
                            value={meeting.status}
                            onChange={(e) => updateOneOnOneMeeting(attendee.id, e.target.value as any, meeting.time_slot, meeting.notes)}
                            className="text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="requested">Requested</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="scheduled">Scheduled</option>
                          </select>
                        )}
                        <button
                          onClick={() => {
                            if (isAssigned) {
                              updateOneOnOneMeeting(attendee.id, 'requested');
                            } else {
                              updateOneOnOneMeeting(attendee.id, 'requested', '', '');
                            }
                          }}
                          className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                            isAssigned
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isAssigned ? 'Remove' : 'Assign'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Select Statuses to Sync</h3>
              <p className="text-sm text-slate-600 mt-1">
                Choose which attendee statuses you want to sync to {sponsorName}
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {uniqueStatuses.map(status => (
                  <label
                    key={status}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => toggleStatus(status)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <span className="text-sm text-slate-600 ml-auto">
                      {attendees.filter(a => (isForum ? a.stage : a.approval_status) === status).length}
                    </span>
                  </label>
                ))}
              </div>

              {selectedStatuses.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-blue-900">
                    Ready to sync {attendeesToSync.length} attendee{attendeesToSync.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    This will update existing attendee information and add new ones to the sponsor's lead list.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSync}
                disabled={selectedStatuses.length === 0}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sync {attendeesToSync.length} Attendee{attendeesToSync.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
