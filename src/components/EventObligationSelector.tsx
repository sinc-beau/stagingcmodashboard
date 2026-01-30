import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Loader2 } from 'lucide-react';

interface Obligation {
  id: string;
  total_amount: number;
  discount_amount: number;
  created_at: string;
}

interface EventObligationSelectorProps {
  eventId: string | null;
  sponsorId: string;
  currentObligationId: string | null;
  onUpdate: () => void;
}

export function EventObligationSelector({ eventId, sponsorId, currentObligationId, onUpdate }: EventObligationSelectorProps) {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [localObligationId, setLocalObligationId] = useState<string | null>(currentObligationId);

  useEffect(() => {
    loadObligations();
  }, [sponsorId]);

  useEffect(() => {
    setLocalObligationId(currentObligationId);
  }, [currentObligationId]);

  async function loadObligations() {
    setLoading(true);
    const { data } = await supabase
      .from('sponsor_obligations')
      .select('id, total_amount, discount_amount, created_at')
      .eq('sponsor_id', sponsorId)
      .order('created_at', { ascending: false });

    if (data) {
      setObligations(data);
    }
    setLoading(false);
  }

  async function handleChange(obligationId: string | null) {
    if (!eventId) {
      console.error('Cannot update obligation: eventId is null');
      return;
    }

    setLocalObligationId(obligationId);
    setUpdating(true);

    const { error } = await supabase
      .from('sponsor_events')
      .update({ obligation_id: obligationId || null })
      .eq('id', eventId);

    if (error) {
      console.error('Error updating obligation:', error);
      setLocalObligationId(currentObligationId);
      setUpdating(false);
      return;
    }

    setUpdating(false);
    await onUpdate();
  }

  if (loading || obligations.length === 0 || !eventId) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
      <DollarSign className="w-3 h-3 text-slate-400 flex-shrink-0" />
      <select
        value={localObligationId || ''}
        onChange={(e) => handleChange(e.target.value || null)}
        disabled={updating}
        className="flex-1 text-xs border border-slate-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:opacity-50"
      >
        <option value="">No obligation</option>
        {obligations.map((obligation) => {
          const netAmount = obligation.total_amount - obligation.discount_amount;
          return (
            <option key={obligation.id} value={obligation.id}>
              ${netAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} - {new Date(obligation.created_at).toLocaleDateString()}
            </option>
          );
        })}
      </select>
      {updating && <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />}
    </div>
  );
}
