import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Target, Plus, X, Loader2, Save, AlertCircle, Check, Download, Clock } from 'lucide-react';

interface TargetingItem {
  name: string;
  relevance: 'high' | 'medium' | 'low' | 'not_relevant';
}

interface EventTargetingProps {
  sponsorId: string;
  eventId: string;
  eventName: string;
  userEmail: string;
}

interface SavedTargetingData {
  technologies: TargetingItem[];
  other_technologies: string;
  seniority_levels: TargetingItem[];
  job_titles: TargetingItem[];
  excluded_titles: string;
  updated_at: string | null;
}

interface PreviousEvent {
  event_id: string;
  event_name: string;
  updated_at: string;
}

const relevanceColors = {
  high: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-orange-100 text-orange-700 border-orange-300',
  not_relevant: 'bg-gray-100 text-gray-700 border-gray-300'
};

const relevanceLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  not_relevant: 'Not Relevant'
};

const defaultTechnologies = [
  'Cloud/Hybrid Cloud/Public Cloud',
  'Security',
  'DevOps',
  'Robotic Process Automation',
  'Enterprise Mobility',
  'Contact Center',
  'Collaboration Technologies',
  'Storage',
  'Artificial Intelligence',
  'Blockchain',
  'SaaS',
  'PaaS',
  'Data Visualization',
  'Data Analytics/Big Data',
  'IoT'
];

const defaultSeniorityLevels = [
  'Executive Management (CXO & Board)',
  'VP Level',
  'Director Level',
  'Manager Level',
  'Staff Level',
  'Consultants'
];

const defaultJobTitles = [
  'CIO',
  'CTO',
  'CISO',
  'Chief Data Officer',
  'Chief Digital Officer',
  'Chief Innovation Officer',
  'SVP/EVP Information Technology',
  'VP of IT Security',
  'VP of Information Technology',
  'VP of Information Services',
  'VP of MIS',
  'VP of Management Information System',
  'VP of Management Information Service',
  'VP of IT',
  'VP of IS',
  'Director of IT',
  'Director of Security/IT Security',
  'IT Manager',
  'VP of Infrastructure',
  'Director of Infrastructure'
];

export function EventTargeting({ sponsorId, eventId, eventName, userEmail }: EventTargetingProps) {
  const [technologies, setTechnologies] = useState<TargetingItem[]>([]);
  const [otherTechnologies, setOtherTechnologies] = useState('');
  const [seniorityLevels, setSeniorityLevels] = useState<TargetingItem[]>([]);
  const [jobTitles, setJobTitles] = useState<TargetingItem[]>([]);
  const [excludedTitles, setExcludedTitles] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [saveEmail, setSaveEmail] = useState(userEmail);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedData, setLastSavedData] = useState<SavedTargetingData | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastSavedBy, setLastSavedBy] = useState<string | null>(null);
  const [previousEvents, setPreviousEvents] = useState<PreviousEvent[]>([]);
  const [showLoadOptions, setShowLoadOptions] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    loadTargetingData();
    loadPreviousEvents();
  }, [sponsorId, eventId]);

  useEffect(() => {
    setSaveEmail(userEmail);
  }, [userEmail]);

  useEffect(() => {
    if (!loading && lastSavedData) {
      const currentData = {
        technologies,
        other_technologies: otherTechnologies,
        seniority_levels: seniorityLevels,
        job_titles: jobTitles,
        excluded_titles: excludedTitles
      };

      const hasChanges = JSON.stringify(currentData) !== JSON.stringify({
        technologies: lastSavedData.technologies,
        other_technologies: lastSavedData.other_technologies,
        seniority_levels: lastSavedData.seniority_levels,
        job_titles: lastSavedData.job_titles,
        excluded_titles: lastSavedData.excluded_titles
      });

      setHasUnsavedChanges(hasChanges);
    }
  }, [technologies, otherTechnologies, seniorityLevels, jobTitles, excludedTitles, lastSavedData, loading]);

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

  const loadTargetingData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('event_targeting_data')
        .select('*')
        .eq('sponsor_id', sponsorId)
        .eq('event_id', eventId)
        .maybeSingle();

      if (data) {
        const savedData = {
          technologies: data.technologies || defaultTechnologies.map(name => ({ name, relevance: 'not_relevant' as const })),
          other_technologies: data.other_technologies || '',
          seniority_levels: data.seniority_levels || defaultSeniorityLevels.map(name => ({ name, relevance: 'not_relevant' as const })),
          job_titles: data.job_titles || defaultJobTitles.map(name => ({ name, relevance: 'not_relevant' as const })),
          excluded_titles: data.excluded_titles || '',
          updated_at: data.updated_at
        };

        setTechnologies(savedData.technologies);
        setOtherTechnologies(savedData.other_technologies);
        setSeniorityLevels(savedData.seniority_levels);
        setJobTitles(savedData.job_titles);
        setExcludedTitles(savedData.excluded_titles);
        setLastSavedData(savedData);
        setLastSavedAt(data.updated_at);

        const { data: logData } = await supabase
          .from('event_targeting_change_log')
          .select('user_email')
          .eq('sponsor_id', sponsorId)
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (logData) {
          setLastSavedBy(logData.user_email);
        }
      } else {
        const defaultData = {
          technologies: defaultTechnologies.map(name => ({ name, relevance: 'not_relevant' as const })),
          other_technologies: '',
          seniority_levels: defaultSeniorityLevels.map(name => ({ name, relevance: 'not_relevant' as const })),
          job_titles: defaultJobTitles.map(name => ({ name, relevance: 'not_relevant' as const })),
          excluded_titles: '',
          updated_at: null
        };

        setTechnologies(defaultData.technologies);
        setSeniorityLevels(defaultData.seniority_levels);
        setJobTitles(defaultData.job_titles);
        setLastSavedData(defaultData);
      }
    } catch (error) {
      console.error('Error loading targeting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousEvents = async () => {
    try {
      const { data } = await supabase
        .from('event_targeting_data')
        .select('*')
        .eq('sponsor_id', sponsorId)
        .neq('event_id', eventId)
        .not('technologies', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (data) {
        const fullyCompletedEvents = data.filter(event => {
          if (!event.event_id || !event.event_name || !event.updated_at) return false;

          const hasMeaningfulTechnologies = event.technologies?.some((tech: TargetingItem) =>
            tech.relevance !== 'not_relevant'
          );

          const hasMeaningfulSeniority = event.seniority_levels?.some((level: TargetingItem) =>
            level.relevance !== 'not_relevant'
          );

          const hasMeaningfulJobTitles = event.job_titles?.some((job: TargetingItem) =>
            job.relevance !== 'not_relevant'
          );

          return hasMeaningfulTechnologies && hasMeaningfulSeniority && hasMeaningfulJobTitles;
        });

        setPreviousEvents(fullyCompletedEvents.slice(0, 10).map(event => ({
          event_id: event.event_id,
          event_name: event.event_name,
          updated_at: event.updated_at
        })));
      }
    } catch (error) {
      console.error('Error loading previous events:', error);
    }
  };

  const loadFromPreviousEvent = async (previousEventId: string) => {
    setLoadingPrevious(true);
    try {
      const { data } = await supabase
        .from('event_targeting_data')
        .select('*')
        .eq('sponsor_id', sponsorId)
        .eq('event_id', previousEventId)
        .maybeSingle();

      if (data) {
        setTechnologies(data.technologies || []);
        setOtherTechnologies(data.other_technologies || '');
        setSeniorityLevels(data.seniority_levels || []);
        setJobTitles(data.job_titles || []);
        setExcludedTitles(data.excluded_titles || '');
        setShowLoadOptions(false);
      }
    } catch (error) {
      console.error('Error loading previous event data:', error);
    } finally {
      setLoadingPrevious(false);
    }
  };

  const calculateChanges = () => {
    if (!lastSavedData) return {};

    const changes: any = {};

    const compareTechnologies = () => {
      const changed: any = {};
      technologies.forEach(tech => {
        const saved = lastSavedData.technologies.find(t => t.name === tech.name);
        if (saved && saved.relevance !== tech.relevance) {
          changed[tech.name] = { from: saved.relevance, to: tech.relevance };
        }
      });
      return Object.keys(changed).length > 0 ? changed : null;
    };

    const compareSeniority = () => {
      const changed: any = {};
      seniorityLevels.forEach(level => {
        const saved = lastSavedData.seniority_levels.find(l => l.name === level.name);
        if (saved && saved.relevance !== level.relevance) {
          changed[level.name] = { from: saved.relevance, to: level.relevance };
        }
      });
      return Object.keys(changed).length > 0 ? changed : null;
    };

    const compareJobTitles = () => {
      const changed: any = {};
      jobTitles.forEach(job => {
        const saved = lastSavedData.job_titles.find(j => j.name === job.name);
        if (saved && saved.relevance !== job.relevance) {
          changed[job.name] = { from: saved.relevance, to: job.relevance };
        } else if (!saved) {
          changed[job.name] = { from: null, to: job.relevance };
        }
      });

      lastSavedData.job_titles.forEach(saved => {
        if (!jobTitles.find(j => j.name === saved.name)) {
          changed[saved.name] = { from: saved.relevance, to: null };
        }
      });

      return Object.keys(changed).length > 0 ? changed : null;
    };

    const techChanges = compareTechnologies();
    if (techChanges) changes.technologies = techChanges;

    if (otherTechnologies !== lastSavedData.other_technologies) {
      changes.other_technologies = { from: lastSavedData.other_technologies, to: otherTechnologies };
    }

    const seniorityChanges = compareSeniority();
    if (seniorityChanges) changes.seniority_levels = seniorityChanges;

    const jobTitleChanges = compareJobTitles();
    if (jobTitleChanges) changes.job_titles = jobTitleChanges;

    if (excludedTitles !== lastSavedData.excluded_titles) {
      changes.excluded_titles = { from: lastSavedData.excluded_titles, to: excludedTitles };
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

      const { error: dataError } = await supabase
        .from('event_targeting_data')
        .upsert({
          sponsor_id: sponsorId,
          event_id: eventId,
          event_name: eventName,
          technologies,
          other_technologies: otherTechnologies,
          seniority_levels: seniorityLevels,
          job_titles: jobTitles,
          excluded_titles: excludedTitles,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'sponsor_id,event_id'
        });

      if (dataError) throw dataError;

      const { error: logError } = await supabase
        .from('event_targeting_change_log')
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
        technologies,
        other_technologies: otherTechnologies,
        seniority_levels: seniorityLevels,
        job_titles: jobTitles,
        excluded_titles: excludedTitles,
        updated_at: new Date().toISOString()
      };

      setLastSavedData(newSavedData);
      setLastSavedAt(new Date().toISOString());
      setLastSavedBy(saveEmail);
      setHasUnsavedChanges(false);
      setSaveSuccess(true);

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving targeting data:', error);
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (!lastSavedData) return;

    setTechnologies(lastSavedData.technologies);
    setOtherTechnologies(lastSavedData.other_technologies);
    setSeniorityLevels(lastSavedData.seniority_levels);
    setJobTitles(lastSavedData.job_titles);
    setExcludedTitles(lastSavedData.excluded_titles);
    setHasUnsavedChanges(false);
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    setSavingTemplate(true);
    try {
      const { data: sponsorData } = await supabase
        .from('sponsors')
        .select('name, url, about')
        .eq('id', sponsorId)
        .maybeSingle();

      const { error } = await supabase
        .from('target_profile_templates')
        .insert({
          sponsor_id: sponsorId,
          template_name: templateName.trim(),
          event_type: 'all',
          technologies: technologies,
          other_technologies: otherTechnologies,
          seniority_levels: seniorityLevels,
          job_titles: jobTitles,
          excluded_titles: excludedTitles,
          created_by_email: userEmail,
          company_name: sponsorData?.name || '',
          company_url: sponsorData?.url || '',
          company_about: sponsorData?.about || ''
        });

      if (error) throw error;

      setShowSaveAsTemplate(false);
      setTemplateName('');
      alert('Target profile template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const updateRelevance = (
    items: TargetingItem[],
    setter: (items: TargetingItem[]) => void,
    name: string,
    relevance: TargetingItem['relevance']
  ) => {
    setter(items.map(item => item.name === name ? { ...item, relevance } : item));
  };

  const addJobTitle = () => {
    if (!newJobTitle.trim()) return;
    setJobTitles([...jobTitles, { name: newJobTitle.trim(), relevance: 'not_relevant' }]);
    setNewJobTitle('');
  };

  const removeJobTitle = (name: string) => {
    setJobTitles(jobTitles.filter(item => item.name !== name));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Detailed Targeting Information</h3>
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
                Copy targeting information from a previous event to save time
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

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-green-900 mb-1">Save as Template</h4>
            <p className="text-xs text-green-700">
              Save this target profile as a reusable template for future events
            </p>
          </div>
          <button
            onClick={() => setShowSaveAsTemplate(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Target className="w-4 h-4" />
            Save Template
          </button>
        </div>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Error Saving</p>
            <p className="text-xs text-red-700 mt-1">{saveError}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Technologies</h4>
          <p className="text-xs text-gray-500 mb-4">Choose the relevance for each technology</p>
          <div className="space-y-2">
            {technologies.map((tech) => (
              <div key={tech.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900">{tech.name}</span>
                <div className="flex gap-1">
                  {(Object.keys(relevanceLabels) as Array<keyof typeof relevanceLabels>).map((level) => (
                    <button
                      key={level}
                      onClick={() => updateRelevance(technologies, setTechnologies, tech.name, level)}
                      className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                        tech.relevance === level
                          ? relevanceColors[level]
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {relevanceLabels[level]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Other Areas of Focus
            </label>
            <textarea
              value={otherTechnologies}
              onChange={(e) => setOtherTechnologies(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any other technology areas..."
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Seniority Levels</h4>
          <p className="text-xs text-gray-500 mb-4">Choose the relevance for each seniority level</p>
          <div className="space-y-2">
            {seniorityLevels.map((level) => (
              <div key={level.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900">{level.name}</span>
                <div className="flex gap-1">
                  {(Object.keys(relevanceLabels) as Array<keyof typeof relevanceLabels>).map((rel) => (
                    <button
                      key={rel}
                      onClick={() => updateRelevance(seniorityLevels, setSeniorityLevels, level.name, rel)}
                      className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                        level.relevance === rel
                          ? relevanceColors[rel]
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {relevanceLabels[rel]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Roles, Job Functions & Titles</h4>
          <p className="text-xs text-gray-500 mb-4">Choose the relevance for each role or job title</p>
          <div className="space-y-2">
            {jobTitles.map((job) => (
              <div key={job.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900 flex-1">{job.name}</span>
                <div className="flex gap-1 items-center">
                  <div className="flex gap-1">
                    {(Object.keys(relevanceLabels) as Array<keyof typeof relevanceLabels>).map((rel) => (
                      <button
                        key={rel}
                        onClick={() => updateRelevance(jobTitles, setJobTitles, job.name, rel)}
                        className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                          job.relevance === rel
                            ? relevanceColors[rel]
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {relevanceLabels[rel]}
                      </button>
                    ))}
                  </div>
                  {!defaultJobTitles.includes(job.name) && (
                    <button
                      onClick={() => removeJobTitle(job.name)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addJobTitle()}
              placeholder="Add custom job title..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addJobTitle}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Excluded Job Titles</h4>
          <p className="text-xs text-gray-500 mb-2">
            Enter job titles you DO NOT want to see in your results (comma-separated)
          </p>
          <textarea
            value={excludedTitles}
            onChange={(e) => setExcludedTitles(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Consultant, Student, Intern"
          />
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-300 p-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-900">
                You have unsaved changes
              </span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
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

      {showSaveAsTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Save as Template</h3>
              <p className="text-sm text-gray-600 mt-1">
                Create a reusable template from this target profile
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Executive Target Profile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
              </div>

              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  This will save all your current targeting selections as a template. You can load this template when setting up future event targeting.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveAsTemplate(false);
                  setTemplateName('');
                }}
                disabled={savingTemplate}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsTemplate}
                disabled={savingTemplate || !templateName.trim()}
                className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingTemplate ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
