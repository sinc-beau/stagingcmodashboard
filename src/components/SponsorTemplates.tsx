import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Copy, FileStack, Target, Loader2, AlertCircle, Clock, Link } from 'lucide-react';
import { FileUpload } from './FileUpload';

interface IntakeFormTemplate {
  id: string;
  template_name: string;
  event_type: string;
  form_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by_email: string;
  company_name?: string;
  company_url?: string;
  company_about?: string;
}

interface TargetProfileTemplate {
  id: string;
  template_name: string;
  event_type: string;
  technologies: any[];
  other_technologies: string;
  seniority_levels: any[];
  job_titles: any[];
  excluded_titles: string;
  created_at: string;
  updated_at: string;
  created_by_email: string;
  company_name?: string;
  company_url?: string;
  company_about?: string;
}

interface SponsorTemplatesProps {
  sponsorId: string;
  userEmail: string;
}

type TemplateSection = 'intake' | 'targeting';

export function SponsorTemplates({ sponsorId, userEmail }: SponsorTemplatesProps) {
  const [activeSection, setActiveSection] = useState<TemplateSection>('intake');
  const [intakeTemplates, setIntakeTemplates] = useState<IntakeFormTemplate[]>([]);
  const [targetTemplates, setTargetTemplates] = useState<TargetProfileTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string; type: TemplateSection } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<IntakeFormTemplate | TargetProfileTemplate | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFormData, setEditingFormData] = useState<Record<string, any>>({});
  const [logoInputType, setLogoInputType] = useState<'file' | 'url'>('file');
  const [intakeFieldTemplates, setIntakeFieldTemplates] = useState<any[]>([]);

  const eventTypes = [
    { value: 'forum', label: 'Forum' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'vrt', label: 'VRT' },
    { value: 'learn_go', label: 'Learn & Go' },
    { value: 'activation', label: 'Activation' },
    { value: 'veb', label: 'VEB' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadTemplates();
    loadIntakeFieldTemplates();
  }, [sponsorId]);

  const loadIntakeFieldTemplates = async () => {
    try {
      const { data } = await supabase
        .from('intake_item_templates')
        .select('item_label, item_description, display_order')
        .eq('event_type', 'all')
        .order('display_order');

      if (data) {
        setIntakeFieldTemplates(data);
      }
    } catch (error) {
      console.error('Error loading intake field templates:', error);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const [intakeResult, targetResult] = await Promise.all([
        supabase
          .from('intake_form_templates')
          .select('*')
          .eq('sponsor_id', sponsorId)
          .order('updated_at', { ascending: false }),
        supabase
          .from('target_profile_templates')
          .select('*')
          .eq('sponsor_id', sponsorId)
          .order('updated_at', { ascending: false })
      ]);

      if (intakeResult.data) {
        setIntakeTemplates(intakeResult.data);
      }

      if (targetResult.data) {
        setTargetTemplates(targetResult.data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string, name: string, type: TemplateSection) => {
    setTemplateToDelete({ id, name, type });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    setDeleting(true);
    try {
      const table = templateToDelete.type === 'intake'
        ? 'intake_form_templates'
        : 'target_profile_templates';

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', templateToDelete.id);

      if (error) throw error;

      await loadTemplates();
      setShowDeleteConfirm(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (template: IntakeFormTemplate | TargetProfileTemplate, type: TemplateSection) => {
    try {
      const newName = `${template.template_name} (Copy)`;

      if (type === 'intake') {
        const intakeTemplate = template as IntakeFormTemplate;
        const { error } = await supabase
          .from('intake_form_templates')
          .insert({
            sponsor_id: sponsorId,
            template_name: newName,
            event_type: template.event_type,
            form_data: intakeTemplate.form_data,
            created_by_email: userEmail
          });

        if (error) throw error;
      } else {
        const targetTemplate = template as TargetProfileTemplate;
        const { error } = await supabase
          .from('target_profile_templates')
          .insert({
            sponsor_id: sponsorId,
            template_name: newName,
            event_type: template.event_type,
            technologies: targetTemplate.technologies,
            other_technologies: targetTemplate.other_technologies,
            seniority_levels: targetTemplate.seniority_levels,
            job_titles: targetTemplate.job_titles,
            excluded_titles: targetTemplate.excluded_titles,
            created_by_email: userEmail
          });

        if (error) throw error;
      }

      await loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    setCreating(true);
    try {
      const { data: sponsorData } = await supabase
        .from('sponsors')
        .select('name, url, about')
        .eq('id', sponsorId)
        .maybeSingle();

      const companyInfo = {
        company_name: sponsorData?.name || '',
        company_url: sponsorData?.url || '',
        company_about: sponsorData?.about || ''
      };

      if (activeSection === 'intake') {
        const { error } = await supabase
          .from('intake_form_templates')
          .insert({
            sponsor_id: sponsorId,
            template_name: newTemplateName.trim(),
            event_type: 'all',
            form_data: {},
            created_by_email: userEmail,
            ...companyInfo
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('target_profile_templates')
          .insert({
            sponsor_id: sponsorId,
            template_name: newTemplateName.trim(),
            event_type: 'all',
            technologies: [],
            other_technologies: '',
            seniority_levels: [],
            job_titles: [],
            excluded_titles: '',
            created_by_email: userEmail,
            ...companyInfo
          });

        if (error) throw error;
      }

      await loadTemplates();
      setShowCreateModal(false);
      setNewTemplateName('');
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template');
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (template: IntakeFormTemplate | TargetProfileTemplate, type: TemplateSection) => {
    setEditingTemplate(template);
    setActiveSection(type);
    setNewTemplateName(template.template_name);

    if (type === 'intake') {
      const intakeTemplate = template as IntakeFormTemplate;
      setEditingFormData(intakeTemplate.form_data || {});
    }

    setShowEditModal(true);
  };

  const updateEditingField = (label: string, value: any) => {
    setEditingFormData(prev => ({
      ...prev,
      [label]: value
    }));
  };

  const renderEditField = (label: string, description: string) => {
    const value = editingFormData[label] || '';

    if (label === 'Company Logo') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setLogoInputType('file')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                logoInputType === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setLogoInputType('url')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                logoInputType === 'url'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Enter URL
            </button>
          </div>
          {logoInputType === 'file' ? (
            <FileUpload
              label=""
              description="PNG or JPG, max 5MB"
              accept="image/png,image/jpeg"
              maxSizeMB={5}
              maxFiles={1}
              value={value}
              onChange={(newValue) => updateEditingField(label, newValue)}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={value}
                onChange={(e) => updateEditingField(label, e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      );
    }

    if (label === 'Wishlist CSV') {
      return (
        <FileUpload
          label=""
          description="CSV file containing your wishlist of attendees"
          accept=".csv,text/csv"
          maxSizeMB={10}
          maxFiles={1}
          value={value}
          onChange={(newValue) => updateEditingField(label, newValue)}
        />
      );
    }

    if (label === 'Digital Assets for Landing Page') {
      let parsedValue: string | string[] = '';
      try {
        if (value) {
          const parsed = JSON.parse(value);
          parsedValue = Array.isArray(parsed) ? parsed : value;
        }
      } catch {
        parsedValue = value;
      }

      return (
        <FileUpload
          label=""
          description="Upload up to 2 PDF files (max 10MB each)"
          accept=".pdf,application/pdf"
          maxSizeMB={10}
          maxFiles={2}
          value={parsedValue}
          onChange={(newValue) => updateEditingField(label, Array.isArray(newValue) ? JSON.stringify(newValue) : newValue)}
        />
      );
    }

    if (label === 'Speaker Headshot') {
      return (
        <FileUpload
          label=""
          description="JPG or PNG, max 5MB"
          accept="image/png,image/jpeg"
          maxSizeMB={5}
          maxFiles={1}
          value={value}
          onChange={(newValue) => updateEditingField(label, newValue)}
        />
      );
    }

    return (
      <textarea
        value={value}
        onChange={(e) => updateEditingField(label, e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Enter information..."
      />
    );
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !newTemplateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    setCreating(true);
    try {
      if (activeSection === 'intake') {
        const { error } = await supabase
          .from('intake_form_templates')
          .update({
            template_name: newTemplateName.trim(),
            form_data: editingFormData
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('target_profile_templates')
          .update({ template_name: newTemplateName.trim() })
          .eq('id', editingTemplate.id);

        if (error) throw error;
      }

      await loadTemplates();
      setShowEditModal(false);
      setEditingTemplate(null);
      setNewTemplateName('');
      setEditingFormData({});
      alert('Template updated successfully!');
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template');
    } finally {
      setCreating(false);
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    const type = eventTypes.find(et => et.value === eventType);
    return type ? type.label : eventType.toUpperCase();
  };

  const getEventTypeBadgeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      forum: 'bg-blue-100 text-blue-700',
      dinner: 'bg-green-100 text-green-700',
      vrt: 'bg-purple-100 text-purple-700',
      learn_go: 'bg-yellow-100 text-yellow-700',
      activation: 'bg-pink-100 text-pink-700',
      veb: 'bg-indigo-100 text-indigo-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[eventType] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage reusable templates for intake forms and target profiles
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 flex items-center justify-between">
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveSection('intake')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeSection === 'intake'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileStack className="w-4 h-4" />
            Intake Form Templates ({intakeTemplates.length})
          </button>
          <button
            onClick={() => setActiveSection('targeting')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeSection === 'targeting'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Target className="w-4 h-4" />
            Target Profile Templates ({targetTemplates.length})
          </button>
        </nav>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium mr-2"
        >
          <Plus className="w-4 h-4" />
          Create New Template
        </button>
      </div>

      {activeSection === 'intake' && (
        <div>
          {intakeTemplates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileStack className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-900 font-medium mb-1">No intake form templates found</p>
              <p className="text-sm text-gray-500">
                Create your first template to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {intakeTemplates.map(template => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{template.template_name}</h3>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Updated: {new Date(template.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div>Created by: {template.created_by_email}</div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setNewTemplateName(template.template_name);
                        handleEditClick(template, 'intake');
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(template, 'intake')}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDeleteClick(template.id, template.template_name, 'intake')}
                      className="flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'targeting' && (
        <div>
          {targetTemplates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-900 font-medium mb-1">No target profile templates found</p>
              <p className="text-sm text-gray-500">
                Create your first template to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {targetTemplates.map(template => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{template.template_name}</h3>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Updated: {new Date(template.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div>Created by: {template.created_by_email}</div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setNewTemplateName(template.template_name);
                        handleEditClick(template, 'targeting');
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(template, 'targeting')}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDeleteClick(template.id, template.template_name, 'targeting')}
                      className="flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showDeleteConfirm && templateToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Delete Template</h3>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to delete "{templateToDelete.name}"?
              </p>
            </div>

            <div className="p-6 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">This action cannot be undone</p>
                  <p className="text-xs text-red-700 mt-1">
                    The template will be permanently deleted. Events that previously loaded this template will not be affected.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTemplateToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Create New Template</h3>
              <p className="text-sm text-gray-600 mt-1">
                Create a blank {activeSection === 'intake' ? 'intake form' : 'target profile'} template to reuse across events
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder={`e.g., ${activeSection === 'intake' ? 'Standard Forum Intake' : 'Executive Target Profile'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  Templates work across all event types. After creating, you can load it when filling out event forms.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTemplateName('');
                }}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={creating || !newTemplateName.trim()}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Edit {activeSection === 'intake' ? 'Intake Form' : 'Target Profile'} Template
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Update the template name and fields below. Changes will be saved and applied to future events.
              </p>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {activeSection === 'intake' && (
                  <div className="space-y-4">
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Template Fields</h4>
                      <div className="space-y-4">
                        {intakeFieldTemplates.map(field => (
                          <div key={field.item_label} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-gray-900 mb-1">
                                {field.item_label}
                              </label>
                              {field.item_description && (
                                <p className="text-xs text-gray-500 mb-2">
                                  {field.item_description}
                                </p>
                              )}
                            </div>
                            {renderEditField(field.item_label, field.item_description)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTemplate(null);
                  setNewTemplateName('');
                  setEditingFormData({});
                }}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTemplate}
                disabled={creating || !newTemplateName.trim()}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
