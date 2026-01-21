import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SponsorInfo {
  id: string;
  name: string;
  logo_url: string | null;
  about: string | null;
  sinc_rep: string | null;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_primary: boolean;
}

export function SponsorProfile() {
  return (
    <ProtectedRoute requireSponsor requireApproved>
      <SponsorProfileContent />
    </ProtectedRoute>
  );
}

function SponsorProfileContent() {
  const { sponsorUser } = useAuth();
  const [sponsor, setSponsor] = useState<SponsorInfo | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [logoUrl, setLogoUrl] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfileData();
  }, [sponsorUser]);

  const loadProfileData = async () => {
    if (!sponsorUser?.sponsor_id) return;

    try {
      const [sponsorData, contactsData] = await Promise.all([
        supabase
          .from('sponsors')
          .select('*')
          .eq('id', sponsorUser.sponsor_id)
          .maybeSingle(),
        supabase
          .from('sponsor_contacts')
          .select('*')
          .eq('sponsor_id', sponsorUser.sponsor_id)
          .order('is_primary', { ascending: false })
      ]);

      if (sponsorData.data) {
        setSponsor(sponsorData.data);
        setLogoUrl(sponsorData.data.logo_url || '');
        setAbout(sponsorData.data.about || '');
      }
      if (contactsData.data) setContacts(contactsData.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!sponsorUser?.sponsor_id) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('sponsors')
        .update({
          logo_url: logoUrl.trim() || null,
          about: about.trim() || null
        })
        .eq('id', sponsorUser.sponsor_id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadProfileData();
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddContact = async () => {
    if (!sponsorUser?.sponsor_id) return;

    try {
      const { error: insertError } = await supabase
        .from('sponsor_contacts')
        .insert([{
          sponsor_id: sponsorUser.sponsor_id,
          name: 'New Contact',
          email: 'email@example.com',
          phone: null,
          is_primary: false
        }]);

      if (insertError) throw insertError;
      await loadProfileData();
    } catch (err) {
      console.error('Error adding contact:', err);
      setError('Failed to add contact. Please try again.');
    }
  };

  const handleUpdateContact = async (contactId: string, field: string, value: any) => {
    try {
      const { error: updateError } = await supabase
        .from('sponsor_contacts')
        .update({ [field]: value })
        .eq('id', contactId);

      if (updateError) throw updateError;

      setContacts(contacts.map(c =>
        c.id === contactId ? { ...c, [field]: value } : c
      ));
    } catch (err) {
      console.error('Error updating contact:', err);
      setError('Failed to update contact. Please try again.');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('sponsor_contacts')
        .delete()
        .eq('id', contactId);

      if (deleteError) throw deleteError;
      await loadProfileData();
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href="/sponsor"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600 mt-1">Update your company information and contacts</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">Profile saved successfully!</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={sponsor?.name || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Contact admin to change company name</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Company
              </label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={4}
                placeholder="Tell us about your company..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SINC Representative
              </label>
              <input
                type="text"
                value={sponsor?.sinc_rep || 'Not assigned'}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
            <button
              onClick={handleAddContact}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No contacts yet. Add your first contact above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleUpdateContact(contact.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleUpdateContact(contact.id, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={contact.phone || ''}
                        onChange={(e) => handleUpdateContact(contact.id, 'phone', e.target.value)}
                        placeholder="Optional"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={contact.is_primary}
                          onChange={(e) => handleUpdateContact(contact.id, 'is_primary', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Primary Contact</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
