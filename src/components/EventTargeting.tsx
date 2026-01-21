import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Target, Plus, X, Loader2 } from 'lucide-react';

interface TargetingItem {
  name: string;
  relevance: 'high' | 'medium' | 'low' | 'not_relevant';
}

interface EventTargetingProps {
  sponsorId: string;
  eventId: string;
  eventName: string;
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

export function EventTargeting({ sponsorId, eventId, eventName }: EventTargetingProps) {
  const [technologies, setTechnologies] = useState<TargetingItem[]>([]);
  const [otherTechnologies, setOtherTechnologies] = useState('');
  const [seniorityLevels, setSeniorityLevels] = useState<TargetingItem[]>([]);
  const [jobTitles, setJobTitles] = useState<TargetingItem[]>([]);
  const [excludedTitles, setExcludedTitles] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTargetingData();
  }, [sponsorId, eventId]);

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
        setTechnologies(data.technologies || defaultTechnologies.map(name => ({ name, relevance: 'not_relevant' as const })));
        setOtherTechnologies(data.other_technologies || '');
        setSeniorityLevels(data.seniority_levels || defaultSeniorityLevels.map(name => ({ name, relevance: 'not_relevant' as const })));
        setJobTitles(data.job_titles || defaultJobTitles.map(name => ({ name, relevance: 'not_relevant' as const })));
        setExcludedTitles(data.excluded_titles || '');
      } else {
        setTechnologies(defaultTechnologies.map(name => ({ name, relevance: 'not_relevant' as const })));
        setSeniorityLevels(defaultSeniorityLevels.map(name => ({ name, relevance: 'not_relevant' as const })));
        setJobTitles(defaultJobTitles.map(name => ({ name, relevance: 'not_relevant' as const })));
      }
    } catch (error) {
      console.error('Error loading targeting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTargetingData = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
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

      if (error) throw error;
    } catch (error) {
      console.error('Error saving targeting data:', error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        saveTargetingData();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [technologies, otherTechnologies, seniorityLevels, jobTitles, excludedTitles]);

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
          <h3 className="text-lg font-semibold text-gray-900">Detailed Targeting Information</h3>
        </div>
        {saving && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </span>
        )}
      </div>

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
    </div>
  );
}
