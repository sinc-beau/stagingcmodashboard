import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { syncSponsorsFromExternal, syncSponsorEventsFromExternal } from '../lib/syncSponsors';
import { ExternalLink, Building2, RefreshCw, Download } from 'lucide-react';
import { DatabaseDebug } from './DatabaseDebug';

type SponsorWithEvents = {
  id: string;
  name: string;
  url: string | null;
  domain: string | null;
  sinc_rep: string | null;
  about: string | null;
  logo_url: string | null;
  event_count: number;
  eventTypeCounts: Record<string, number>;
};

interface SponsorsListProps {
  onSponsorClick: (sponsorId: string, sponsorName: string) => void;
}

export function SponsorsList({ onSponsorClick }: SponsorsListProps) {
  const [sponsors, setSponsors] = useState<SponsorWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSponsors();
  }, []);

  async function syncAndReload() {
    setSyncing(true);
    await syncSponsorsFromExternal();
    await syncSponsorEventsFromExternal();
    await loadSponsors();
    setSyncing(false);
  }

  async function exportContacts() {
    const { data: allContacts } = await supabase
      .from('sponsor_contacts')
      .select('*, sponsors(name)')
      .order('sponsors(name)');

    if (!allContacts || allContacts.length === 0) {
      alert('No contacts to export');
      return;
    }

    const csvRows = [
      ['Sponsor', 'Contact Name', 'Email', 'Phone', 'Primary Contact'].join(',')
    ];

    allContacts.forEach((contact: any) => {
      const row = [
        contact.sponsors?.name || '',
        contact.name,
        contact.email,
        contact.phone || '',
        contact.is_primary ? 'Yes' : 'No'
      ].map(field => `"${field}"`).join(',');
      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sponsor-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function loadSponsors() {
    try {
      setLoading(true);

      const { data: sponsorsData } = await supabase
        .from('sponsors')
        .select('*')
        .order('name');

      const { data: sponsorEventsData } = await supabase
        .from('sponsor_events')
        .select(`
          sponsor_id,
          events (
            event_type
          )
        `);

      const eventsBySponsorId = new Map<string, string[]>();

      if (sponsorEventsData) {
        sponsorEventsData.forEach((se: any) => {
          if (!se.events) return;

          if (!eventsBySponsorId.has(se.sponsor_id)) {
            eventsBySponsorId.set(se.sponsor_id, []);
          }
          eventsBySponsorId.get(se.sponsor_id)!.push(se.events.event_type);
        });
      }

      const sponsorsWithEvents: SponsorWithEvents[] = (sponsorsData || []).map((sponsor: any) => {
        const events = eventsBySponsorId.get(sponsor.id) || [];
        const eventTypeCounts: Record<string, number> = {};

        events.forEach(type => {
          const displayType = formatEventType(type);
          eventTypeCounts[displayType] = (eventTypeCounts[displayType] || 0) + 1;
        });

        return {
          id: sponsor.id,
          name: sponsor.name,
          url: sponsor.url,
          domain: sponsor.domain,
          sinc_rep: sponsor.sinc_rep,
          about: sponsor.about,
          logo_url: sponsor.logo_url,
          event_count: events.length,
          eventTypeCounts
        };
      });

      setSponsors(sponsorsWithEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  function formatEventType(type: string) {
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
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading sponsors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          <strong className="font-semibold">Error loading sponsors:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DatabaseDebug />
      <div className="max-w-[1600px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Sponsor Management</h1>
              <p className="text-slate-600">Manage your event sponsors and their information</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportContacts}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Contacts
              </button>
              <button
                onClick={syncAndReload}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Sponsors'}
              </button>
            </div>
          </div>
          <div className="mt-4 flex gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
              {sponsors.length} Sponsors
            </span>
          </div>
        </div>

        {sponsors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No sponsors found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Sponsor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      SINC Rep
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Events
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sponsors.map((sponsor) => (
                    <tr
                      key={sponsor.id}
                      onClick={() => onSponsorClick(sponsor.id, sponsor.name)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {sponsor.logo_url ? (
                            <img
                              src={sponsor.logo_url}
                              alt={`${sponsor.name} logo`}
                              className="w-10 h-10 object-contain flex-shrink-0"
                            />
                          ) : (
                            <Building2 className="w-8 h-8 text-slate-400 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900">{sponsor.name}</div>
                            {sponsor.url && (
                              <a
                                href={sponsor.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                <span className="truncate">{sponsor.domain}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {sponsor.sinc_rep ? (
                          <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                            {sponsor.sinc_rep}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {Object.keys(sponsor.eventTypeCounts).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(sponsor.eventTypeCounts)
                              .sort(([, a], [, b]) => b - a)
                              .map(([type, count]) => (
                                <span
                                  key={type}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-800 text-sm font-medium rounded-lg border border-slate-200"
                                >
                                  <span className="font-semibold">{count}</span>
                                  <span className="text-slate-600">{type}</span>
                                </span>
                              ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">No events</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
