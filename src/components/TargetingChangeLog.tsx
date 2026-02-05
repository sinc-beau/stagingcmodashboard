import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, User, Download, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

interface ChangeLogEntry {
  id: string;
  user_email: string;
  changes: any;
  created_at: string;
}

interface TargetingChangeLogProps {
  sponsorId: string;
  eventId: string;
  eventName: string;
}

export function TargetingChangeLog({ sponsorId, eventId, eventName }: TargetingChangeLogProps) {
  const [logs, setLogs] = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChangeLogs();
  }, [sponsorId, eventId]);

  const loadChangeLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('event_targeting_change_log')
        .select('*')
        .eq('sponsor_id', sponsorId)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setLogs(data || []);
    } catch (err: any) {
      console.error('Error loading change logs:', err);
      setError(err.message || 'Failed to load change logs');
    } finally {
      setLoading(false);
    }
  };

  const formatChanges = (changes: any) => {
    if (!changes || typeof changes !== 'object') return null;

    const sections: JSX.Element[] = [];

    if (changes.technologies) {
      const techChanges = Object.entries(changes.technologies).map(([name, change]: [string, any]) => (
        <div key={name} className="text-xs">
          <span className="font-medium text-gray-700">{name}:</span>{' '}
          <span className="text-gray-500">{change.from || 'not set'}</span>
          {' → '}
          <span className="text-gray-900">{change.to || 'not set'}</span>
        </div>
      ));
      sections.push(
        <div key="tech" className="mb-3">
          <h5 className="text-xs font-semibold text-gray-900 mb-2">Technologies</h5>
          <div className="space-y-1">{techChanges}</div>
        </div>
      );
    }

    if (changes.other_technologies) {
      sections.push(
        <div key="other_tech" className="mb-3">
          <h5 className="text-xs font-semibold text-gray-900 mb-2">Other Technologies</h5>
          <div className="text-xs">
            <div className="text-gray-500">{changes.other_technologies.from || '(empty)'}</div>
            <div className="text-gray-400">→</div>
            <div className="text-gray-900">{changes.other_technologies.to || '(empty)'}</div>
          </div>
        </div>
      );
    }

    if (changes.seniority_levels) {
      const seniorityChanges = Object.entries(changes.seniority_levels).map(([name, change]: [string, any]) => (
        <div key={name} className="text-xs">
          <span className="font-medium text-gray-700">{name}:</span>{' '}
          <span className="text-gray-500">{change.from || 'not set'}</span>
          {' → '}
          <span className="text-gray-900">{change.to || 'not set'}</span>
        </div>
      ));
      sections.push(
        <div key="seniority" className="mb-3">
          <h5 className="text-xs font-semibold text-gray-900 mb-2">Seniority Levels</h5>
          <div className="space-y-1">{seniorityChanges}</div>
        </div>
      );
    }

    if (changes.job_titles) {
      const jobChanges = Object.entries(changes.job_titles).map(([name, change]: [string, any]) => (
        <div key={name} className="text-xs">
          <span className="font-medium text-gray-700">{name}:</span>{' '}
          <span className="text-gray-500">{change.from || 'not set'}</span>
          {' → '}
          <span className="text-gray-900">{change.to || 'not set'}</span>
        </div>
      ));
      sections.push(
        <div key="jobs" className="mb-3">
          <h5 className="text-xs font-semibold text-gray-900 mb-2">Job Titles</h5>
          <div className="space-y-1">{jobChanges}</div>
        </div>
      );
    }

    if (changes.excluded_titles) {
      sections.push(
        <div key="excluded" className="mb-3">
          <h5 className="text-xs font-semibold text-gray-900 mb-2">Excluded Titles</h5>
          <div className="text-xs">
            <div className="text-gray-500">{changes.excluded_titles.from || '(empty)'}</div>
            <div className="text-gray-400">→</div>
            <div className="text-gray-900">{changes.excluded_titles.to || '(empty)'}</div>
          </div>
        </div>
      );
    }

    return sections.length > 0 ? <div>{sections}</div> : <p className="text-xs text-gray-500">No changes recorded</p>;
  };

  const exportToCSV = () => {
    const rows: string[] = [];

    rows.push(`"Targeting Profile Change Log for ${eventName}"`);
    rows.push('');
    rows.push('"Date","User","Changes Summary"');

    logs.forEach(log => {
      const date = new Date(log.created_at).toLocaleString();
      const changeCount = log.changes ? Object.keys(log.changes).length : 0;
      rows.push(`"${date}","${log.user_email}","${changeCount} field(s) changed"`);
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedEventName = eventName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    a.download = `${sanitizedEventName}-targeting-change-log.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">Loading change history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-900">Error Loading Change Log</p>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-900">No Changes Yet</p>
        <p className="text-xs text-gray-500 mt-1">
          Changes to the targeting profile will appear here once they are saved
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Change History</h4>
          <p className="text-xs text-gray-500 mt-1">
            {logs.length} change{logs.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          <Download className="w-3 h-3" />
          Export CSV
        </button>
      </div>

      <div className="space-y-2">
        {logs.map((log) => {
          const isExpanded = expandedLog === log.id;
          const changeCount = log.changes ? Object.keys(log.changes).length : 0;

          return (
            <div
              key={log.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-900">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{log.user_email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {changeCount} field{changeCount !== 1 ? 's' : ''} changed
                    </p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  {formatChanges(log.changes)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
