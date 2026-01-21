import { useEffect, useState } from 'react';
import { supabase, forumEventClient, nonForumEventClient } from '../lib/supabase';
import { formatEventType, normalizeName, mapEventType } from '../lib/syncSponsors';
import { Calendar, Loader2, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
  minimum_attendees?: number;
  attendee_count?: number;
}

interface SponsorMyEventsProps {
  sponsorId: string;
  sponsorName: string;
  onViewEvent: (event: SponsorEvent) => void;
}

export function SponsorMyEvents({ sponsorId, sponsorName, onViewEvent }: SponsorMyEventsProps) {
  const [events, setEvents] = useState<SponsorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const eventTypes = [
    { key: 'all', label: 'All Events' },
    { key: 'forum', label: 'Forums' },
    { key: 'vrt', label: 'Virtual Roundtables' },
    { key: 'dinner', label: 'Dinners' },
    { key: 'learn_go', label: 'Learn and Gos' },
    { key: 'activation', label: 'Community Activations' }
  ];

  useEffect(() => {
    loadEvents();
  }, [sponsorId, sponsorName]);

  async function loadEvents() {
    setLoading(true);
    try {
      const { data: sponsorEvents } = await supabase
        .from('sponsor_events')
        .select(`
          id,
          is_published,
          published_at,
          events (
            id,
            event_name,
            event_type,
            event_date,
            event_location,
            event_venue,
            event_brand,
            source_event_id,
            source_database,
            minimum_attendees
          )
        `)
        .eq('sponsor_id', sponsorId);

      if (!sponsorEvents) {
        setEvents([]);
        setLoading(false);
        return;
      }

      const eventsToDisplay: SponsorEvent[] = sponsorEvents
        .filter(se => se.events)
        .map((se: any) => {
          const evt = se.events;
          return {
            id: evt.id,
            event_name: evt.event_name,
            event_type: evt.event_type,
            event_date: evt.event_date,
            event_location: evt.event_location,
            event_venue: evt.event_venue,
            event_brand: evt.event_brand,
            is_published: se.is_published,
            published_at: se.published_at,
            source_event_id: evt.source_event_id,
            source_database: evt.source_database,
            minimum_attendees: evt.minimum_attendees
          };
        });

      eventsToDisplay.sort((a, b) => {
        if (!a.event_date) return 1;
        if (!b.event_date) return -1;
        return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
      });

      const eventsWithMetrics = await Promise.all(
        eventsToDisplay.map(async (event) => {
          const { count: attendeeCount } = await supabase
            .from('sponsor_leads')
            .select('id', { count: 'exact', head: true })
            .eq('sponsor_id', sponsorId)
            .eq('event_id', event.id)
            .eq('attendance_status', 'attended');

          return {
            ...event,
            attendee_count: attendeeCount ?? 0
          };
        })
      );

      setEvents(eventsWithMetrics);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = typeFilter === 'all'
    ? events
    : events.filter(e => e.event_type === typeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-5 h-5 text-gray-500" />
        {eventTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setTypeFilter(type.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              typeFilter === type.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">
            {typeFilter === 'all'
              ? 'Published events will appear here'
              : `No ${eventTypes.find(t => t.key === typeFilter)?.label.toLowerCase()} found`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Min Attendance</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Attendance</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => {
                const hasMinimum = event.minimum_attendees && event.minimum_attendees > 0;
                const hasAttendees = event.attendee_count !== undefined && event.attendee_count > 0;
                const showDelivery = hasMinimum;
                const isPreEvent = event.event_date && new Date(event.event_date) > new Date();
                const isOngoing = !event.event_date;

                let deliveryStatus: 'over' | 'under' | 'met' | 'pre-event' | 'ongoing' | null = null;
                let deliveryDiff = 0;
                let deliveryPercent = 0;

                if (isOngoing) {
                  deliveryStatus = 'ongoing';
                } else if (isPreEvent) {
                  deliveryStatus = 'pre-event';
                } else if (hasMinimum && event.minimum_attendees && event.attendee_count !== undefined) {
                  deliveryDiff = event.attendee_count - event.minimum_attendees;
                  deliveryPercent = Math.round((deliveryDiff / event.minimum_attendees) * 100);
                  if (deliveryDiff > 0) {
                    deliveryStatus = 'over';
                  } else if (deliveryDiff < 0) {
                    deliveryStatus = 'under';
                  } else {
                    deliveryStatus = 'met';
                  }
                }

                return (
                  <tr
                    key={event.id}
                    onClick={() => onViewEvent(event)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{event.event_name}</div>
                      {event.event_location && (
                        <div className="text-xs text-gray-500 mt-1">{event.event_location}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-xs uppercase whitespace-nowrap">
                        {formatEventType(event.event_type)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {event.event_date
                        ? new Date(event.event_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'Ongoing'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {hasMinimum ? event.minimum_attendees : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {event.attendee_count !== undefined ? event.attendee_count : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {deliveryStatus === 'ongoing' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Ongoing
                        </span>
                      )}
                      {deliveryStatus === 'pre-event' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Pre-Event
                        </span>
                      )}
                      {deliveryStatus && deliveryStatus !== 'pre-event' && deliveryStatus !== 'ongoing' && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          deliveryStatus === 'over'
                            ? 'bg-green-100 text-green-700'
                            : deliveryStatus === 'under'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {deliveryStatus === 'over' && <TrendingUp className="w-3 h-3" />}
                          {deliveryStatus === 'under' && <TrendingDown className="w-3 h-3" />}
                          {deliveryStatus === 'met' && <Minus className="w-3 h-3" />}
                          {deliveryStatus === 'over' && `+${deliveryPercent}%`}
                          {deliveryStatus === 'under' && `${deliveryPercent}%`}
                          {deliveryStatus === 'met' && 'Met'}
                        </span>
                      )}
                      {!deliveryStatus && hasMinimum && (
                        <span className="text-xs text-gray-400">Pending</span>
                      )}
                      {!deliveryStatus && !hasMinimum && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
