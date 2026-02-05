import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Clock, Check, AlertCircle, Loader2, Download, FileStack } from 'lucide-react';

interface IntakeItem {
  item_label: string;
  item_description: string | null;
  notes: string | null;
}

interface IntakeFormProps {
  sponsorId: string;
  eventId: string;
  eventName: string;
  eventType: string;
  userEmail: string;
}

interface SavedIntakeData {
  items: Record<string, IntakeItem>;
  solution_provider_topic: string;
  updated_at: string | null;
}

interface PreviousEvent {
  event_id: string;
  event_name: string;
  updated_at: string;
}

export function IntakeForm({ sponsorId, eventId, eventName, eventType, userEmail }: IntakeFormProps) {
  const [items, setItems] = useState<Record<string, IntakeItem>>({});
  const [templates, setTemplates] = useState<string[]>([]);
  const [solutionProviderTopic, setSolutionProviderTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [saveEmail, setSaveEmail] = useState(userEmail);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedData, setLastSavedData] = useState<SavedIntakeData | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastSavedBy, setLastSavedBy] = useState<string | null>(null);
  const [previousEvents, setPreviousEvents] = useState<PreviousEvent[]>([]);
  const [showLoadOptions, setShowLoadOptions] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  useEffect(() => {
    loadIntakeData();
    loadPreviousEvents();
  }, [sponsorId, eventId]);

  useEffect(() => {
    setSaveEmail(userEmail);
  }, [userEmail]);

  useEffect(() => {
    if (!loading && lastSavedData) {
      const currentData = {
        items,
        solution_provider_topic: solutionProviderTopic
      };

      const hasChanges = JSON.stringify(currentData) !== JSON.stringify({
        items: lastSavedData.items,
        solution_provider_topic: lastSavedData.solution_provider_topic
      });

      setHasUnsavedChanges(hasChanges);
    }
  }, [items, solutionProviderTopic, lastSavedData, loading]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadIntakeData = async () => {
    setLoading(true);
    try {
      const { data: templateData } = await supabase
        .from('intake_item_templates')
        .select('item_label, item_description, display_order')
        .eq('event_type', eventType)
        .order('display_order');

      if (templateData) {
        setTemplates(templateData.map(t => t.item_label));
      }

      const { data: existingItems } = await supabase
        .from('event_intake_items')
        .select('*')
        .eq('event_id', eventId)
        .eq('sponsor_id', sponsorId);

      const { data: sponsorEventData } = await supabase
        .from('sponsor_events')
        .select('solution_provider_topic')
        .eq('sponsor_id', sponsorId)
        .eq('event_id', eventId)
        .maybeSingle();

      const itemsMap: Record<string, IntakeItem> = {};

      if (templateData) {
        templateData.forEach(template => {
          const existingItem = existingItems?.find(item => item.item_label === template.item_label);
          itemsMap[template.item_label] = {
            item_label: template.item_label,
            item_description: template.item_description,
            notes: existingItem?.notes || ''
          };
        });
      }

      const solution_topic = sponsorEventData?.solution_provider_topic || '';

      setItems(itemsMap);
      setSolutionProviderTopic(solution_topic);

      const savedData = {
        items: itemsMap,
        solution_provider_topic: solution_topic,
        updated_at: existingItems?.[0]?.updated_at || null
      };

      setLastSavedData(savedData);
      setLastSavedAt(existingItems?.[0]?.updated_at || null);

      if (existingItems && existingItems.length > 0) {
        const { data: logData } = await supabase
          .from('intake_form_change_log')
          .select('user_email')
          .eq('sponsor_id', sponsorId)
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (logData) {
          setLastSavedBy(logData.user_email);
        }
      }
    } catch (error) {
      console.error('Error loading intake data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousEvents = async () => {
    try {
      const { data: centralEvent } = await supabase
        .from('events')
        .select('id')
        .eq('id', eventId)
        .maybeSingle();

      if (!centralEvent) return;

      const { data: previousSponsorEvents } = await supabase
        .from('sponsor_events')
        .select('event_id')
        .eq('sponsor_id', sponsorId)
        .neq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (!previousSponsorEvents || previousSponsorEvents.length === 0) {
        setPreviousEvents([]);
        return;
      }

      const eventIds = previousSponsorEvents.map(se => se.event_id);

      const { data: intakeData } = await supabase
        .from('event_intake_items')
        .select('event_id, event_name, notes, updated_at')
        .eq('sponsor_id', sponsorId)
        .in('event_id', eventIds)
        .not('notes', 'is', null)
        .order('updated_at', { ascending: false });

      if (intakeData) {
        const eventsWithData = new Map<string, { event_id: string; event_name: string; updated_at: string; count: number }>();

        intakeData.forEach(item => {
          if (item.notes && item.notes.trim() !== '') {
            const existing = eventsWithData.get(item.event_id);
            if (existing) {
              existing.count++;
              if (new Date(item.updated_at) > new Date(existing.updated_at)) {
                existing.updated_at = item.updated_at;
              }
            } else {
              eventsWithData.set(item.event_id, {
                event_id: item.event_id,
                event_name: item.event_name,
                updated_at: item.updated_at,
                count: 1
              });
            }
          }
        });

        const meaningfulEvents = Array.from(eventsWithData.values())
          .filter(e => e.count >= 3)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 10);

        setPreviousEvents(meaningfulEvents);
      }
    } catch (error) {
      console.error('Error loading previous events:', error);
    }
  };

  const loadFromPreviousEvent = async (previousEventId: string) => {
    setLoadingPrevious(true);
    try {
      const { data: previousItems } = await supabase
        .from('event_intake_items')
        .select('*')
        .eq('sponsor_id', sponsorId)
        .eq('event_id', previousEventId);

      const { data: previousSponsorEvent } = await supabase
        .from('sponsor_events')
        .select('solution_provider_topic')
        .eq('sponsor_id', sponsorId)
        .eq('event_id', previousEventId)
        .maybeSingle();

      if (previousItems) {
        const newItems = { ...items };
        previousItems.forEach(prevItem => {
          if (newItems[prevItem.item_label]) {
            newItems[prevItem.item_label] = {
              ...newItems[prevItem.item_label],
              notes: prevItem.notes || ''
            };
          }
        });
        setItems(newItems);
      }

      if (previousSponsorEvent?.solution_provider_topic) {
        setSolutionProviderTopic(previousSponsorEvent.solution_provider_topic);
      }

      setShowLoadOptions(false);
    } catch (error) {
      console.error('Error loading previous event data:', error);
    } finally {
      setLoadingPrevious(false);
    }
  };

  const calculateChanges = () => {
    if (!lastSavedData) return {};

    const changes: any = {};

    Object.keys(items).forEach(label => {
      const current = items[label];
      const saved = lastSavedData.items[label];

      if (saved && current.notes !== saved.notes) {
        changes[label] = { from: saved.notes || '', to: current.notes || '' };
      }
    });

    if (solutionProviderTopic !== lastSavedData.solution_provider_topic) {
      changes.solution_provider_topic = {
        from: lastSavedData.solution_provider_topic || '',
        to: solutionProviderTopic || ''
      };
    }

    return changes;
  };

  const handleSaveClick = () => {
    if (!hasUnsavedChanges) return;
    setSaveEmail(userEmail);
    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    if (!saveEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(saveEmail)) {
      setSaveError('Please enter a valid email address');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setShowSaveConfirm(false);

    try {
      const changes = calculateChanges();

      const { data: centralEvent } = await supabase
        .from('events')
        .select('id')
        .eq('id', eventId)
        .maybeSingle();

      if (!centralEvent) {
        throw new Error('Event not found');
      }

      const itemsToUpsert = Object.values(items).map(item => ({
        sponsor_id: sponsorId,
        event_id: eventId,
        event_name: eventName,
        event_type: eventType,
        item_label: item.item_label,
        item_description: item.item_description,
        notes: item.notes || null,
        display_order: templates.indexOf(item.item_label)
      }));

      const { error: itemsError } = await supabase
        .from('event_intake_items')
        .upsert(itemsToUpsert, {
          onConflict: 'sponsor_id,event_id,item_label'
        });

      if (itemsError) throw itemsError;

      const { error: sponsorEventError } = await supabase
        .from('sponsor_events')
        .update({
          solution_provider_topic: solutionProviderTopic || null
        })
        .eq('sponsor_id', sponsorId)
        .eq('event_id', eventId);

      if (sponsorEventError) throw sponsorEventError;

      const { error: logError } = await supabase
        .from('intake_form_change_log')
        .insert({
          sponsor_id: sponsorId,
          event_id: eventId,
          user_email: saveEmail,
          changes: changes
        });

      if (logError) {
        console.error('Error saving change log:', logError);
      }

      const newSavedData = {
        items,
        solution_provider_topic: solutionProviderTopic,
        updated_at: new Date().toISOString()
      };

      setLastSavedData(newSavedData);
      setLastSavedAt(new Date().toISOString());
      setLastSavedBy(saveEmail);
      setHasUnsavedChanges(false);
      setSaveSuccess(true);

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving intake data:', error);
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (!lastSavedData) return;

    setItems(lastSavedData.items);
    setSolutionProviderTopic(lastSavedData.solution_provider_topic);
    setHasUnsavedChanges(false);
  };

  const updateItemNotes = (label: string, notes: string) => {
    setItems(prev => ({
      ...prev,
      [label]: {
        ...prev[label],
        notes
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileStack className="w-5 h-5 text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Event Intake Form</h3>
            {lastSavedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Last saved: {new Date(lastSavedAt).toLocaleString()}
                {lastSavedBy && ` by ${lastSavedBy}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Changes saved
            </span>
          )}
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-600 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {previousEvents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Load from Previous Event</h4>
              <p className="text-xs text-blue-700">
                Copy intake information from a previous event to save time
              </p>
            </div>
            <button
              onClick={() => setShowLoadOptions(!showLoadOptions)}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {showLoadOptions ? 'Hide' : 'Show Options'}
            </button>
          </div>

          {showLoadOptions && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {previousEvents.map(event => (
                <button
                  key={event.event_id}
                  onClick={() => loadFromPreviousEvent(event.event_id)}
                  disabled={loadingPrevious}
                  className="w-full flex items-center justify-between p-2 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.event_name}</p>
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(event.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  {loadingPrevious ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <Download className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Error Saving</p>
            <p className="text-xs text-red-700 mt-1">{saveError}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Solution Provider Topic / Presentation Title
          </label>
          <textarea
            value={solutionProviderTopic}
            onChange={(e) => setSolutionProviderTopic(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter the topic or title..."
          />
        </div>

        {templates.map(label => (
          <div key={label} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {label}
              </label>
              {items[label]?.item_description && (
                <p className="text-xs text-gray-500 mb-2">
                  {items[label].item_description}
                </p>
              )}
            </div>
            <textarea
              value={items[label]?.notes || ''}
              onChange={(e) => updateItemNotes(label, e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter notes..."
            />
          </div>
        ))}
      </div>

      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSaveClick}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Confirm Save</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your changes will be saved and logged for audit purposes
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Save changes as:
              </label>
              <input
                type="email"
                value={saveEmail}
                onChange={(e) => setSaveEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
              />
              <p className="text-xs text-gray-500 mt-2">
                This email will be recorded in the change log
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveConfirm(false);
                  setSaveError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Confirm Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
