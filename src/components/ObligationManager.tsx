import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Target, Loader2, Save, Plus, Trash2 } from 'lucide-react';

interface Obligation {
  id: string;
  sponsor_id: string;
  contract_name: string;
  total_amount: number;
  discount_amount: number;
  dinner_count: number;
  learn_go_count: number;
  vrt_count: number;
  veb_count: number;
  forum_count: number;
  activation_count: number;
  created_at: string;
  updated_at: string;
}

interface ObligationManagerProps {
  sponsorId: string;
  sponsorName: string;
  obligationId?: string | null;
  onClose: () => void;
}

const EVENT_MINIMUMS = {
  dinner: 8,
  learn_go: 8,
  vrt: 8,
  veb: 8,
  forum: 60,
  activation: 30
};

export function ObligationManager({ sponsorId, sponsorName, obligationId, onClose }: ObligationManagerProps) {
  const [obligation, setObligation] = useState<Obligation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [contractName, setContractName] = useState('');
  const [totalAmount, setTotalAmount] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [dinnerCount, setDinnerCount] = useState('0');
  const [learnGoCount, setLearnGoCount] = useState('0');
  const [vrtCount, setVrtCount] = useState('0');
  const [vebCount, setVebCount] = useState('0');
  const [forumCount, setForumCount] = useState('0');
  const [activationCount, setActivationCount] = useState('0');

  useEffect(() => {
    if (obligationId) {
      loadObligation();
    } else {
      setLoading(false);
    }
  }, [sponsorId, obligationId]);

  async function loadObligation() {
    if (!obligationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('sponsor_obligations')
      .select('*')
      .eq('id', obligationId)
      .maybeSingle();

    if (data) {
      setObligation(data);
      setContractName(data.contract_name);
      setTotalAmount(data.total_amount.toString());
      setDiscountAmount(data.discount_amount.toString());
      setDinnerCount(data.dinner_count.toString());
      setLearnGoCount(data.learn_go_count.toString());
      setVrtCount(data.vrt_count.toString());
      setVebCount(data.veb_count.toString());
      setForumCount(data.forum_count.toString());
      setActivationCount(data.activation_count.toString());
    }
    setLoading(false);
  }

  function calculateMinimumEngagements(): number {
    const dinner = parseInt(dinnerCount) || 0;
    const learnGo = parseInt(learnGoCount) || 0;
    const vrt = parseInt(vrtCount) || 0;
    const veb = parseInt(vebCount) || 0;
    const forum = parseInt(forumCount) || 0;
    const activation = parseInt(activationCount) || 0;

    return (
      dinner * EVENT_MINIMUMS.dinner +
      learnGo * EVENT_MINIMUMS.learn_go +
      vrt * EVENT_MINIMUMS.vrt +
      veb * EVENT_MINIMUMS.veb +
      forum * EVENT_MINIMUMS.forum +
      activation * EVENT_MINIMUMS.activation
    );
  }

  function calculateNetAmount(): number {
    const total = parseFloat(totalAmount) || 0;
    const discount = parseFloat(discountAmount) || 0;
    return total - discount;
  }

  async function handleSave() {
    setSaving(true);

    const data = {
      sponsor_id: sponsorId,
      contract_name: contractName || 'CONTRACT NAME',
      total_amount: parseFloat(totalAmount) || 0,
      discount_amount: parseFloat(discountAmount) || 0,
      dinner_count: parseInt(dinnerCount) || 0,
      learn_go_count: parseInt(learnGoCount) || 0,
      vrt_count: parseInt(vrtCount) || 0,
      veb_count: parseInt(vebCount) || 0,
      forum_count: parseInt(forumCount) || 0,
      activation_count: parseInt(activationCount) || 0
    };

    let result;
    if (obligation) {
      result = await supabase
        .from('sponsor_obligations')
        .update(data)
        .eq('id', obligation.id);
    } else {
      result = await supabase
        .from('sponsor_obligations')
        .insert(data);
    }

    if (result.error) {
      console.error('Error saving obligation:', result.error);
      alert(`Failed to save obligation: ${result.error.message}`);
      setSaving(false);
      return;
    }

    setSaving(false);
    onClose();
  }

  async function handleDelete() {
    if (!obligation) return;
    if (!confirm('Are you sure you want to delete this obligation?')) return;

    setDeleting(true);
    await supabase
      .from('sponsor_obligations')
      .delete()
      .eq('id', obligation.id);

    setDeleting(false);
    onClose();
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = parseFloat(discountAmount) > 0;
  const minimumEngagements = calculateMinimumEngagements();
  const netAmount = calculateNetAmount();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 my-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {obligation ? 'Edit' : 'Create'} Obligation for {sponsorName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Set contract details and event commitments
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Target className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Minimum Engagements</h4>
                <p className="text-2xl font-bold text-blue-900">{minimumEngagements}</p>
                <p className="text-sm text-blue-700 mt-1">
                  Total minimum attendees required across all events
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contract Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              placeholder="CONTRACT NAME"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Contract Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {hasDiscount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Net Amount</p>
                  <p className="text-xs text-green-700">After discount</p>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  ${netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Event Commitments</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dinners
                  <span className="text-xs text-gray-500 ml-1">(8 min each)</span>
                </label>
                <input
                  type="number"
                  value={dinnerCount}
                  onChange={(e) => setDinnerCount(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learn & Go
                  <span className="text-xs text-gray-500 ml-1">(8 min each)</span>
                </label>
                <input
                  type="number"
                  value={learnGoCount}
                  onChange={(e) => setLearnGoCount(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VRT
                  <span className="text-xs text-gray-500 ml-1">(8 min each)</span>
                </label>
                <input
                  type="number"
                  value={vrtCount}
                  onChange={(e) => setVrtCount(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VEB
                  <span className="text-xs text-gray-500 ml-1">(8 min each)</span>
                </label>
                <input
                  type="number"
                  value={vebCount}
                  onChange={(e) => setVebCount(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forums
                  <span className="text-xs text-gray-500 ml-1">(60 min each)</span>
                </label>
                <input
                  type="number"
                  value={forumCount}
                  onChange={(e) => setForumCount(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activations
                  <span className="text-xs text-gray-500 ml-1">(30 min each)</span>
                </label>
                <input
                  type="number"
                  value={activationCount}
                  onChange={(e) => setActivationCount(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div>
            {obligation && (
              <button
                onClick={handleDelete}
                disabled={deleting || saving}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Delete</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={saving || deleting}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || deleting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{obligation ? 'Update' : 'Create'} Obligation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
