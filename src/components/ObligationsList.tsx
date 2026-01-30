import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Target, Calendar, Plus, Edit2, Trash2, Loader2, TrendingUp } from 'lucide-react';
import { ObligationManager } from './ObligationManager';

interface Obligation {
  id: string;
  total_amount: number;
  discount_amount: number;
  dinner_count: number;
  learn_go_count: number;
  vrt_count: number;
  veb_count: number;
  forum_count: number;
  activation_count: number;
  created_at: string;
}

interface ObligationsListProps {
  sponsorId: string;
  sponsorName: string;
}

const EVENT_MINIMUMS = {
  dinner: 8,
  learn_go: 8,
  vrt: 8,
  veb: 8,
  forum: 60,
  activation: 30
};

interface ObligationStats {
  completedCount: number;
  minimumRequired: number;
  percentage: number;
}

export function ObligationsList({ sponsorId, sponsorName }: ObligationsListProps) {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManager, setShowManager] = useState(false);
  const [selectedObligation, setSelectedObligation] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [obligationStats, setObligationStats] = useState<Record<string, ObligationStats>>({});
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadObligations();
  }, [sponsorId]);

  useEffect(() => {
    if (obligations.length > 0) {
      loadAllObligationStats();
    }
  }, [obligations, sponsorId]);

  async function loadObligations() {
    setLoading(true);
    const { data } = await supabase
      .from('sponsor_obligations')
      .select('*')
      .eq('sponsor_id', sponsorId)
      .order('created_at', { ascending: false });

    if (data) {
      setObligations(data);
    }
    setLoading(false);
  }

  async function loadAllObligationStats() {
    setLoadingStats(true);
    const stats: Record<string, ObligationStats> = {};

    for (const obligation of obligations) {
      const completedCount = await loadCompletedCountForObligation(obligation.id);
      const minimumRequired = calculateMinimumEngagements(obligation);
      const percentage = minimumRequired > 0 ? Math.min(100, Math.round((completedCount / minimumRequired) * 100)) : 0;

      stats[obligation.id] = {
        completedCount,
        minimumRequired,
        percentage
      };
    }

    setObligationStats(stats);
    setLoadingStats(false);
  }

  async function loadCompletedCountForObligation(obligationId: string): Promise<number> {
    const { data: sponsorEvents } = await supabase
      .from('sponsor_events')
      .select('id, event_id, events(event_date)')
      .eq('sponsor_id', sponsorId)
      .eq('obligation_id', obligationId);

    if (!sponsorEvents || sponsorEvents.length === 0) {
      return 0;
    }

    let total = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (const sponsorEvent of sponsorEvents) {
      const event = (sponsorEvent as any).events;
      if (!event || !event.event_date) continue;

      const eventDate = new Date(event.event_date);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate < now) {
        const { count } = await supabase
          .from('sponsor_leads')
          .select('*', { count: 'exact', head: true })
          .eq('sponsor_id', sponsorId)
          .eq('event_id', (sponsorEvent as any).event_id)
          .eq('attendance_status', 'attended');

        total += count || 0;
      }
    }

    return total;
  }

  function calculateMinimumEngagements(obligation: Obligation): number {
    return (
      obligation.dinner_count * EVENT_MINIMUMS.dinner +
      obligation.learn_go_count * EVENT_MINIMUMS.learn_go +
      obligation.vrt_count * EVENT_MINIMUMS.vrt +
      obligation.veb_count * EVENT_MINIMUMS.veb +
      obligation.forum_count * EVENT_MINIMUMS.forum +
      obligation.activation_count * EVENT_MINIMUMS.activation
    );
  }

  function calculateNetAmount(obligation: Obligation): number {
    return obligation.total_amount - obligation.discount_amount;
  }

  async function handleDelete(obligationId: string) {
    if (!confirm('Are you sure you want to delete this obligation? Events assigned to it will be unlinked.')) return;

    setDeleting(obligationId);
    await supabase
      .from('sponsor_obligations')
      .delete()
      .eq('id', obligationId);

    setDeleting(null);
    await loadObligations();
  }

  function handleEdit(obligationId: string) {
    setSelectedObligation(obligationId);
    setShowManager(true);
  }

  function handleCreate() {
    setSelectedObligation(null);
    setShowManager(true);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      {showManager && (
        <ObligationManager
          sponsorId={sponsorId}
          sponsorName={sponsorName}
          obligationId={selectedObligation}
          onClose={() => {
            setShowManager(false);
            setSelectedObligation(null);
            loadObligations();
          }}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900">
          Obligations {obligations.length > 0 && <span className="text-slate-400 font-normal">({obligations.length})</span>}
        </h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Obligation
        </button>
      </div>

      {obligations.length === 0 ? (
        <div className="py-8 text-center">
          <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No obligations yet</p>
          <p className="text-xs text-slate-400 mt-1">Create an obligation to track contract commitments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {obligations.map((obligation) => {
            const netAmount = calculateNetAmount(obligation);
            const minimumEngagements = calculateMinimumEngagements(obligation);
            const isDeleting = deleting === obligation.id;
            const stats = obligationStats[obligation.id];

            return (
              <div
                key={obligation.id}
                className="border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-900">
                        ${netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {obligation.discount_amount > 0 && (
                        <span className="text-xs text-green-600">
                          (${obligation.discount_amount.toLocaleString()} discount)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-600">
                        <span className="font-medium">{minimumEngagements}</span> minimum engagements
                      </span>
                    </div>
                    {stats && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-600">
                          <span className="font-medium">{stats.completedCount}</span> completed ({stats.percentage}%)
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(obligation.id)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit obligation"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(obligation.id)}
                      disabled={isDeleting}
                      className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Delete obligation"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {stats && (
                  <div className="mb-2">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          stats.percentage >= 100
                            ? 'bg-green-500'
                            : stats.percentage >= 75
                            ? 'bg-blue-500'
                            : stats.percentage >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, stats.percentage)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>Created {new Date(obligation.created_at).toLocaleDateString()}</span>
                </div>

                {(obligation.dinner_count > 0 || obligation.learn_go_count > 0 || obligation.vrt_count > 0 ||
                  obligation.veb_count > 0 || obligation.forum_count > 0 || obligation.activation_count > 0) && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1.5">
                      {obligation.dinner_count > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {obligation.dinner_count} Dinners
                        </span>
                      )}
                      {obligation.learn_go_count > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {obligation.learn_go_count} Learn & Go
                        </span>
                      )}
                      {obligation.vrt_count > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {obligation.vrt_count} VRT
                        </span>
                      )}
                      {obligation.veb_count > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {obligation.veb_count} VEB
                        </span>
                      )}
                      {obligation.forum_count > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {obligation.forum_count} Forums
                        </span>
                      )}
                      {obligation.activation_count > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {obligation.activation_count} Activations
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
