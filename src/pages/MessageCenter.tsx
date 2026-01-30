import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProtectedRoute } from '../components/ProtectedRoute';
import {
  Building2,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Send,
  BellOff
} from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  unread_message_count: number;
}

interface Message {
  id: string;
  sponsor_id: string;
  message: string;
  sent_by_role: 'admin' | 'sponsor';
  sent_by_user_id: string;
  is_read: boolean;
  created_at: string;
}

export function MessageCenter() {
  return (
    <ProtectedRoute requireAccountManager requireApproved>
      <MessageCenterContent />
    </ProtectedRoute>
  );
}

function MessageCenterContent() {
  const { sponsorUser, isAdmin } = useAuth();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dashboardPath = isAdmin ? '/admin' : '/account-manager';

  useEffect(() => {
    loadSponsors();
  }, []);

  useEffect(() => {
    if (selectedSponsorId) {
      loadMessages(selectedSponsorId);
      markMessagesAsRead(selectedSponsorId);

      const subscription = supabase
        .channel(`sponsor_messages_${selectedSponsorId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'sponsor_messages',
          filter: `sponsor_id=eq.${selectedSponsorId}`
        }, () => {
          loadMessages(selectedSponsorId);
          loadSponsors();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedSponsorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSponsors = async () => {
    try {
      const { data: sponsorsData } = await supabase
        .from('sponsors')
        .select('id, name, logo_url')
        .order('name', { ascending: true });

      const { data: messageCounts } = await supabase
        .from('sponsor_messages')
        .select('sponsor_id, sent_by_role, is_read');

      const unreadCountsBySponsor = new Map<string, number>();
      (messageCounts || []).forEach((msg: any) => {
        if (msg.sent_by_role === 'sponsor' && !msg.is_read) {
          unreadCountsBySponsor.set(msg.sponsor_id, (unreadCountsBySponsor.get(msg.sponsor_id) || 0) + 1);
        }
      });

      const sponsorsWithCounts: Sponsor[] = (sponsorsData || []).map((sponsor: any) => ({
        ...sponsor,
        unread_message_count: unreadCountsBySponsor.get(sponsor.id) || 0
      }));

      sponsorsWithCounts.sort((a, b) => {
        return b.unread_message_count - a.unread_message_count;
      });

      setSponsors(sponsorsWithCounts);

      if (sponsorsWithCounts.length > 0 && !selectedSponsorId) {
        setSelectedSponsorId(sponsorsWithCounts[0].id);
      }
    } catch (error) {
      console.error('Error loading sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sponsorId: string) => {
    try {
      const { data } = await supabase
        .from('sponsor_messages')
        .select('*')
        .eq('sponsor_id', sponsorId)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async (sponsorId: string) => {
    try {
      await supabase
        .from('sponsor_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('sponsor_id', sponsorId)
        .eq('sent_by_role', 'sponsor')
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSponsorId || !sponsorUser?.id) return;

    setSending(true);

    try {
      const { error } = await supabase
        .from('sponsor_messages')
        .insert([{
          sponsor_id: selectedSponsorId,
          message: newMessage.trim(),
          sent_by_role: 'admin',
          sent_by_user_id: sponsorUser.id,
          is_read: false
        }]);

      if (error) throw error;

      setNewMessage('');
      await loadMessages(selectedSponsorId);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const toggleConversationDone = async () => {
    if (!selectedSponsorId) return;

    try {
      await supabase
        .from('sponsor_messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('sponsor_id', selectedSponsorId)
        .eq('sent_by_role', 'sponsor')
        .eq('is_read', false);

      await loadSponsors();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const selectedSponsor = sponsors.find(s => s.id === selectedSponsorId);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <a
              href={dashboardPath}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </a>
            <div className="ml-8">
              <h1 className="text-xl font-bold text-gray-900">Message Center</h1>
              <p className="text-xs text-gray-500">{sponsorUser?.email}</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 h-[calc(100vh-180px)]">
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedSponsor ? selectedSponsor.name : 'Select a Sponsor'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedSponsor ? 'Chat with sponsor' : 'Choose a sponsor from the list'}
                </p>
              </div>
              {selectedSponsor && (
                <button
                  onClick={toggleConversationDone}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-slate-600 text-white hover:bg-slate-700"
                >
                  <BellOff className="w-4 h-4" />
                  <span>Clear Notifications</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {!selectedSponsorId ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No sponsor selected</p>
                  <p className="text-sm text-gray-400">Select a sponsor from the list to start chatting</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No messages yet</p>
                  <p className="text-sm text-gray-400">Start a conversation with {selectedSponsor?.name}</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sent_by_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.sent_by_role === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sent_by_role === 'admin' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {selectedSponsorId && (
              <form
                onSubmit={handleSendMessage}
                className="border-t border-gray-200 p-4 bg-white"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Sponsors</h2>
              <p className="text-xs text-gray-500 mt-1">{sponsors.length} total</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sponsors.map((sponsor) => (
                <button
                  key={sponsor.id}
                  onClick={() => setSelectedSponsorId(sponsor.id)}
                  className={`w-full flex items-center gap-3 p-3 transition-colors border-b border-gray-100 ${
                    selectedSponsorId === sponsor.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {sponsor.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Building2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {sponsor.name}
                      </h4>
                    </div>
                  </div>
                  {sponsor.unread_message_count > 0 && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
