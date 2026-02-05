import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronDown, ChevronRight, Download, Users, Calendar, ArrowUpDown } from 'lucide-react';

interface HistoricalLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  title: string | null;
  attendance_status: string;
  historical_event_name: string;
  historical_event_date: string | null;
  created_at: string;
}

interface EventGroup {
  eventName: string;
  eventDate: string | null;
  leads: HistoricalLead[];
}

interface SponsorHistoricalLeadsProps {
  sponsorId: string;
}

export function SponsorHistoricalLeads({ sponsorId }: SponsorHistoricalLeadsProps) {
  const [leads, setLeads] = useState<HistoricalLead[]>([]);
  const [eventGroups, setEventGroups] = useState<EventGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadHistoricalLeads();
  }, [sponsorId]);

  useEffect(() => {
    groupLeadsByEvent();
  }, [leads, searchTerm]);

  const loadHistoricalLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sponsor_leads')
        .select('*')
        .eq('sponsor_id', sponsorId)
        .eq('is_historical', true)
        .order('historical_event_date', { ascending: false });

      if (error) throw error;
      if (data) setLeads(data);
    } catch (error) {
      console.error('Error loading historical leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupLeadsByEvent = () => {
    const filtered = leads.filter(lead => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(search) ||
        lead.email?.toLowerCase().includes(search) ||
        lead.company?.toLowerCase().includes(search) ||
        lead.title?.toLowerCase().includes(search) ||
        lead.historical_event_name?.toLowerCase().includes(search)
      );
    });

    const grouped = filtered.reduce((acc, lead) => {
      const eventName = lead.historical_event_name || 'Unknown Event';
      const existing = acc.find(g => g.eventName === eventName);

      if (existing) {
        existing.leads.push(lead);
      } else {
        acc.push({
          eventName,
          eventDate: lead.historical_event_date,
          leads: [lead]
        });
      }

      return acc;
    }, [] as EventGroup[]);

    grouped.sort((a, b) => {
      const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
      const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
      return dateB - dateA;
    });

    setEventGroups(grouped);
  };

  const toggleEvent = (eventName: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventName)) {
      newExpanded.delete(eventName);
    } else {
      newExpanded.add(eventName);
    }
    setExpandedEvents(newExpanded);
  };

  const expandAll = () => {
    setExpandedEvents(new Set(eventGroups.map(g => g.eventName)));
  };

  const collapseAll = () => {
    setExpandedEvents(new Set());
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'attended':
        return 'Attended';
      case 'no_show':
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
        return 'Registered';
      default:
        return status || 'Unknown';
    }
  };

  const getStatusStyle = (status: string): string => {
    switch (status) {
      case 'attended':
        return 'bg-green-100 text-green-700';
      case 'no_show':
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const exportAllLeads = () => {
    if (leads.length === 0) return;

    const csvContent = [
      ['Event Name', 'Event Date', 'Name', 'Email', 'Phone', 'Company', 'Title', 'Status'].join(','),
      ...leads.map(lead => [
        lead.historical_event_name || '',
        lead.historical_event_date || '',
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.company || '',
        lead.title || '',
        getStatusLabel(lead.attendance_status)
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historical-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportEventLeads = (eventGroup: EventGroup) => {
    if (eventGroup.leads.length === 0) return;

    const csvContent = [
      ['Name', 'Email', 'Phone', 'Company', 'Title', 'Status'].join(','),
      ...eventGroup.leads.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.company || '',
        lead.title || '',
        getStatusLabel(lead.attendance_status)
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedEventName = eventGroup.eventName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    a.download = `${sanitizedEventName}-leads.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sortLeads = (leadsToSort: HistoricalLead[]) => {
    return [...leadsToSort].sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return sortOrder === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else {
        const statusOrder = { attended: 0, pending: 1, no_show: 2, cancelled: 2 };
        const statusA = statusOrder[a.attendance_status as keyof typeof statusOrder] ?? 3;
        const statusB = statusOrder[b.attendance_status as keyof typeof statusOrder] ?? 3;
        return sortOrder === 'asc'
          ? statusA - statusB
          : statusB - statusA;
      }
    });
  };

  const toggleSort = (column: 'name' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const totalLeads = leads.length;
  const attendedCount = leads.filter(l => l.attendance_status === 'attended').length;
  const cancelledCount = leads.filter(l => l.attendance_status === 'no_show' || l.attendance_status === 'cancelled').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No historical data available</p>
        <p className="text-sm text-gray-400 mt-2">Historical leads will appear here once imported</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, company, title, or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Collapse All
          </button>
          <button
            onClick={exportAllLeads}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Events</p>
          <p className="text-2xl font-bold text-gray-900">{eventGroups.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Attended</p>
          <p className="text-2xl font-bold text-gray-900">{attendedCount}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-gray-900">{cancelledCount}</p>
        </div>
      </div>

      <div className="space-y-3">
        {eventGroups.map((eventGroup) => {
          const isExpanded = expandedEvents.has(eventGroup.eventName);
          const sortedLeads = sortLeads(eventGroup.leads);
          const eventAttendedCount = eventGroup.leads.filter(l => l.attendance_status === 'attended').length;
          const eventCancelledCount = eventGroup.leads.filter(l => l.attendance_status === 'no_show' || l.attendance_status === 'cancelled').length;

          return (
            <div key={eventGroup.eventName} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => toggleEvent(eventGroup.eventName)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{eventGroup.eventName}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      {eventGroup.eventDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(eventGroup.eventDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {eventAttendedCount} attended
                      </span>
                      <span className="flex items-center gap-1 text-red-600">
                        {eventCancelledCount} cancelled
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportEventLeads(eventGroup);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => toggleSort('name')}
                            className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                          >
                            Name
                            {sortBy === 'name' && <ArrowUpDown className="w-3 h-3" />}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      {sortedLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{lead.name || '-'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-gray-600 text-sm">{lead.email || '-'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-gray-600 text-sm">{lead.phone || '-'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-gray-600 text-sm">{lead.company || '-'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-gray-600 text-sm">{lead.title || '-'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(lead.attendance_status)}`}>
                              {getStatusLabel(lead.attendance_status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
