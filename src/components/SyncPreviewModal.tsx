import { X, CheckCircle, RefreshCw } from 'lucide-react';

interface SyncPreviewData {
  sponsors: {
    newSponsors: Array<{ name: string; url: string | null; logo_url: string | null; sinc_rep: string | null }>;
    updatedSponsors: Array<{ name: string; updates: string[] }>;
  };
  events: {
    newEvents: Array<{ event_name: string; event_type: string; event_date: string | null; event_location: string | null; sponsors_count: number }>;
    updatedEvents: Array<{ event_name: string; event_type: string; event_date: string | null; event_location: string | null; sponsors_count: number }>;
    newSponsorEvents: Array<{ event_name: string; sponsors: string[] }>;
  };
}

interface SyncPreviewModalProps {
  data: SyncPreviewData | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SyncPreviewModal({ data, loading, onClose, onConfirm }: SyncPreviewModalProps) {
  if (!data && !loading) return null;

  const hasChanges = data && (
    data.sponsors.newSponsors.length > 0 ||
    data.sponsors.updatedSponsors.length > 0 ||
    data.events.newEvents.length > 0 ||
    data.events.updatedEvents.length > 0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-heading font-bold text-sinc-gray-dark">Sync Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-12 h-12 text-sinc-blue animate-spin mb-4" />
              <p className="text-gray-600">Checking for updates...</p>
            </div>
          ) : !hasChanges ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-sinc-gray-dark mb-2">Up to Date</h3>
              <p className="text-gray-600 text-center">No new data to sync from external sources.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.sponsors.newSponsors.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-sinc-gray-dark mb-3">New Sponsors ({data.sponsors.newSponsors.length})</h3>
                  <div className="space-y-2">
                    {data.sponsors.newSponsors.map((sponsor, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sinc-gray-dark">{sponsor.name}</p>
                          {sponsor.sinc_rep && (
                            <p className="text-sm text-gray-600">Rep: {sponsor.sinc_rep}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.sponsors.updatedSponsors.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-sinc-gray-dark mb-3">Updated Sponsors ({data.sponsors.updatedSponsors.length})</h3>
                  <div className="space-y-2">
                    {data.sponsors.updatedSponsors.map((sponsor, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sinc-gray-dark">{sponsor.name}</p>
                          <p className="text-sm text-gray-600">
                            Updates: {sponsor.updates.join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.events.newEvents.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-sinc-gray-dark mb-3">New Events ({data.events.newEvents.length})</h3>
                  <div className="space-y-2">
                    {data.events.newEvents.map((event, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sinc-gray-dark">{event.event_name}</p>
                          <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                            <span className="px-2 py-0.5 bg-white rounded border border-gray-200">{event.event_type}</span>
                            {event.event_location && <span>{event.event_location}</span>}
                            {event.event_date && <span>{new Date(event.event_date).toLocaleDateString()}</span>}
                            <span className="text-sinc-blue font-medium">{event.sponsors_count} sponsor{event.sponsors_count !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.events.updatedEvents.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-sinc-gray-dark mb-3">Updated Events ({data.events.updatedEvents.length})</h3>
                  <div className="space-y-2">
                    {data.events.updatedEvents.map((event, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sinc-gray-dark">{event.event_name}</p>
                          <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                            <span className="px-2 py-0.5 bg-white rounded border border-gray-200">{event.event_type}</span>
                            {event.event_location && <span>{event.event_location}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-body font-semibold"
          >
            Cancel
          </button>
          {hasChanges && !loading && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-sinc-blue text-white rounded-lg hover:bg-sinc-blue/90 transition-colors font-body font-semibold"
            >
              Confirm Sync
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
