import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Loader2, StickyNote, Download } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  title: string | null;
  stage: string | null;
  approval_status: string | null;
  event_id: string;
  notes: string | null;
  created_at: string;
  register_number: string | null;
}

interface SponsorAllLeadsProps {
  sponsorId: string;
}

export function SponsorAllLeads({ sponsorId }: SponsorAllLeadsProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    loadLeads();
  }, [sponsorId]);

  async function loadLeads() {
    setLoading(true);
    const { data } = await supabase
      .from('sponsor_leads')
      .select('*')
      .eq('sponsor_id', sponsorId)
      .order('created_at', { ascending: false });

    if (data) {
      setLeads(data);
    }
    setLoading(false);
  }

  async function updateLeadNotes(leadId: string, notes: string) {
    await supabase
      .from('sponsor_leads')
      .update({ notes })
      .eq('id', leadId);

    setLeads(leads.map(lead =>
      lead.id === leadId ? { ...lead, notes } : lead
    ));
    setEditingNotes(null);
  }

  function getStatusColor(status: string | null): string {
    if (!status) return 'bg-gray-100 text-gray-700';

    const colorMap: Record<string, string> = {
      'confirmed': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'registered': 'bg-blue-100 text-blue-700',
      'waitlisted': 'bg-orange-100 text-orange-700',
      '1': 'bg-blue-100 text-blue-700',
      '2': 'bg-green-100 text-green-700',
      '3': 'bg-purple-100 text-purple-700',
      '4': 'bg-pink-100 text-pink-700'
    };

    return colorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  }

  function exportAllLeads() {
    if (leads.length === 0) return;

    const csvContent = [
      ['Name', 'Email', 'Phone', 'Company', 'Title', 'Status', 'Notes'].join(','),
      ...leads.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.register_number || '',
        lead.company || '',
        lead.title || '',
        lead.stage || lead.approval_status || '',
        lead.notes || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
        <p className="text-gray-500">Leads from your events will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">All Leads ({leads.length})</h2>
        {leads.length > 0 && (
          <button
            onClick={exportAllLeads}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{lead.register_number || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{lead.company || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{lead.title || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(lead.stage || lead.approval_status) && (
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.stage || lead.approval_status)}`}>
                        {lead.stage || lead.approval_status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingNotes === lead.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateLeadNotes(lead.id, notesValue);
                            }
                          }}
                        />
                        <button
                          onClick={() => updateLeadNotes(lead.id, notesValue)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNotes(null)}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingNotes(lead.id);
                          setNotesValue(lead.notes || '');
                        }}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                      >
                        <StickyNote className="w-4 h-4" />
                        <span>{lead.notes || 'Add note'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
