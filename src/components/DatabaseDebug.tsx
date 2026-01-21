import { useState } from 'react';
import {
  supabase,
  forumAttendeeClient,
  forumEventClient,
  nonForumAttendeeClient,
  nonForumEventClient
} from '../lib/supabase';
import { Database, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

type DBStatus = {
  name: string;
  connected: boolean;
  error?: string;
  tables?: {
    name: string;
    count: number;
  }[];
};

export function DatabaseDebug() {
  const [isOpen, setIsOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statuses, setStatuses] = useState<DBStatus[]>([]);

  async function testConnections() {
    setTesting(true);
    const results: DBStatus[] = [];

    const testDB = async (
      client: any,
      name: string,
      tables: string[]
    ): Promise<DBStatus> => {
      try {
        const tableCounts = await Promise.all(
          tables.map(async (table) => {
            const { count, error } = await client
              .from(table)
              .select('id', { count: 'exact', head: true });

            if (error) throw error;
            return { name: table, count: count || 0 };
          })
        );

        return {
          name,
          connected: true,
          tables: tableCounts
        };
      } catch (error: any) {
        return {
          name,
          connected: false,
          error: error.message
        };
      }
    };

    results.push(await testDB(supabase, 'Local DB', ['sponsors']));
    results.push(await testDB(forumAttendeeClient, 'Forum Attendee DB', ['attendees']));
    results.push(await testDB(forumEventClient, 'Forum Event DB', ['sponsors', 'forums']));
    results.push(await testDB(nonForumAttendeeClient, 'Non-Forum Attendee DB', ['veb_attendees', 'vrt_attendees', 'dinner_attendees', 'learn_go_attendees', 'activation_attendees']));
    results.push(await testDB(nonForumEventClient, 'Non-Forum Event DB', ['event_sponsors', 'events']));

    setStatuses(results);
    setTesting(false);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          testConnections();
        }}
        className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 shadow-lg transition-colors text-sm"
      >
        <Database className="w-4 h-4" />
        DB Debug
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 bg-white rounded-lg shadow-2xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-900">Database Connections</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={testConnections}
            disabled={testing}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${testing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <span className="text-slate-600 text-xl leading-none">×</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {testing && statuses.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-2" />
            <p className="text-slate-600 text-sm">Testing connections...</p>
          </div>
        ) : (
          statuses.map((status, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                status.connected
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {status.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium text-slate-900">{status.name}</span>
              </div>

              {status.connected && status.tables ? (
                <div className="ml-7 space-y-1">
                  {status.tables.map((table) => (
                    <div
                      key={table.name}
                      className="text-sm text-slate-700 flex justify-between"
                    >
                      <span>{table.name}:</span>
                      <span className="font-medium">{table.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ml-7 text-sm text-red-700">
                  {status.error || 'Connection failed'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
