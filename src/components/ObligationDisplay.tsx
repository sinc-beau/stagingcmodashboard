import { useEffect, useState } from 'react';
import { supabase, forumAttendeeClient, nonForumAttendeeClient } from '../lib/supabase';
import { Target, TrendingUp, Calendar, Loader2, DollarSign } from 'lucide-react';

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
}

interface ObligationDisplayProps {
  sponsorId: string;
}

const EVENT_MINIMUMS = {
  dinner: 8,
  learn_go: 8,
  vrt: 8,
  veb: 8,
  forum: 60,
  activation: 30
};

const EVENT_LABELS = {
  dinner: 'Dinners',
  learn_go: 'Learn & Go',
  vrt: 'VRT',
  veb: 'VEB',
  forum: 'Forums',
  activation: 'Activations'
};

export function ObligationDisplay({ sponsorId }: ObligationDisplayProps) {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [obligationStats, setObligationStats] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadData();
  }, [sponsorId]);

  async function loadData() {
    setLoading(true);
    await loadObligations();
    setLoading(false);
  }

  async function loadObligations() {
    const { data } = await supabase
      .from('sponsor_obligations')
      .select('*')
      .eq('sponsor_id', sponsorId)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setObligations(data);
      await loadAllCompletedCounts(data);
    }
  }

  async function loadAllCompletedCounts(obligationsList: Obligation[]) {
    const stats = new Map<string, number>();

    for (const obligation of obligationsList) {
      const count = await loadCompletedCountForObligation(obligation.id);
      stats.set(obligation.id, count);
    }

    setObligationStats(stats);
  }

  async function loadCompletedCountForObligation(obligationId: string): Promise<number> {
    const { data: sponsorEvents } = await supabase
      .from('sponsor_events')
      .select('id, event_id, events(source_event_id, source_database)')
      .eq('sponsor_id', sponsorId)
      .eq('obligation_id', obligationId);

    if (!sponsorEvents || sponsorEvents.length === 0) {
      return 0;
    }

    let total = 0;

    for (const sponsorEvent of sponsorEvents) {
      const event = (sponsorEvent as any).events;
      if (!event) continue;

      if (event.source_database === 'forum_event') {
        const { count } = await forumAttendeeClient
          .from('attendees', { count: 'exact', head: true })
          .eq('forum_id', event.source_event_id);
        total += count || 0;
      } else {
        const { count } = await nonForumAttendeeClient
          .from('attendees', { count: 'exact', head: true })
          .eq('event_id', event.source_event_id)
          .eq('approval_status', 'approved');
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

  function calculateProgress(obligationId: string, minimum: number): number {
    if (minimum === 0) return 0;
    const completedCount = obligationStats.get(obligationId) || 0;
    return Math.min(100, Math.round((completedCount / minimum) * 100));
  }

  function getEventBreakdown(obligation: Obligation): { label: string; count: number; minimum: number }[] {
    return [
      { label: EVENT_LABELS.dinner, count: obligation.dinner_count, minimum: EVENT_MINIMUMS.dinner },
      { label: EVENT_LABELS.learn_go, count: obligation.learn_go_count, minimum: EVENT_MINIMUMS.learn_go },
      { label: EVENT_LABELS.vrt, count: obligation.vrt_count, minimum: EVENT_MINIMUMS.vrt },
      { label: EVENT_LABELS.veb, count: obligation.veb_count, minimum: EVENT_MINIMUMS.veb },
      { label: EVENT_LABELS.forum, count: obligation.forum_count, minimum: EVENT_MINIMUMS.forum },
      { label: EVENT_LABELS.activation, count: obligation.activation_count, minimum: EVENT_MINIMUMS.activation }
    ].filter(item => item.count > 0);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (obligations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {obligations.map((obligation) => {
        const minimumEngagements = calculateMinimumEngagements(obligation);
        const completedCount = obligationStats.get(obligation.id) || 0;
        const progress = calculateProgress(obligation.id, minimumEngagements);
        const netAmount = obligation.total_amount - obligation.discount_amount;
        const eventBreakdown = getEventBreakdown(obligation);
        const remaining = Math.max(0, minimumEngagements - completedCount);

        return (
          <div key={obligation.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Contract Obligation</h3>
                  <p className="text-xs text-gray-600">Created {new Date(obligation.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Value</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    ${netAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  {obligation.discount_amount > 0 && (
                    <p className="text-xs text-green-600 mt-0.5">-${obligation.discount_amount.toLocaleString()}</p>
                  )}
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Target</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{minimumEngagements}</p>
                  <p className="text-xs text-gray-500 mt-0.5">minimum</p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Progress</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{completedCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {remaining > 0 ? `${remaining} left` : 'Complete!'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-700">Overall Progress</span>
                  <span className="text-xs font-semibold text-gray-900">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      progress === 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {eventBreakdown.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Event Commitments</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {eventBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                        <span className="text-xs font-medium text-gray-600">{item.label}</span>
                        <span className="text-xs font-bold text-gray-900">
                          {item.count} × {item.minimum}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
