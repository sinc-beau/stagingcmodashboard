import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ArrowLeft, Send, MessageSquare, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  message: string;
  sent_by_role: 'admin' | 'sponsor';
  sent_by_user_id: string;
  is_read: boolean;
  created_at: string;
}

export function SponsorMessages() {
  return (
    <ProtectedRoute requireSponsor requireApproved>
      <SponsorMessagesContent />
    </ProtectedRoute>
  );
}

function SponsorMessagesContent() {
  const { sponsorUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    markMessagesAsRead();

    const subscription = supabase
      .channel('sponsor_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sponsor_messages',
        filter: `sponsor_id=eq.${sponsorUser?.sponsor_id}`
      }, () => {
        loadMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sponsorUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!sponsorUser?.sponsor_id) return;

    try {
      const { data, error } = await supabase
        .from('sponsor_messages')
        .select('*')
        .eq('sponsor_id', sponsorUser.sponsor_id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!sponsorUser?.sponsor_id) return;

    try {
      await supabase
        .from('sponsor_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('sponsor_id', sponsorUser.sponsor_id)
        .eq('sent_by_role', 'admin')
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !sponsorUser?.sponsor_id || !sponsorUser?.id) return;

    setSending(true);

    try {
      const { error } = await supabase
        .from('sponsor_messages')
        .insert([{
          sponsor_id: sponsorUser.sponsor_id,
          message: newMessage.trim(),
          sent_by_role: 'sponsor',
          sent_by_user_id: sponsorUser.id,
          is_read: false
        }]);

      if (error) throw error;

      await supabase
        .from('sponsors')
        .update({
          conversation_done: false,
          conversation_done_at: null,
          conversation_done_by: null
        })
        .eq('id', sponsorUser.sponsor_id);

      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href="/sponsor"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 text-sm">Chat with your SINC administrator</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex-1 bg-white rounded-t-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No messages yet</p>
                <p className="text-sm text-gray-400">Start a conversation with your admin</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sent_by_role === 'sponsor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.sent_by_role === 'sponsor'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sent_by_role === 'sponsor' ? 'text-blue-100' : 'text-gray-500'
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
        </div>

        <form
          onSubmit={handleSendMessage}
          className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-4"
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
      </div>
    </div>
  );
}
