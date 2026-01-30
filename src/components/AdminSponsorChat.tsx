import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Send, Loader2, Bell, BellOff, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';

interface Message {
  id: string;
  sponsor_id: string;
  message: string;
  sent_by_role: 'admin' | 'sponsor';
  sent_by_user_id: string;
  is_read: boolean;
  created_at: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
}

interface AdminSponsorChatProps {
  sponsorId: string;
  conversationDone: boolean;
  onConversationDoneChange: () => void;
}

export function AdminSponsorChat({ sponsorId, conversationDone, onConversationDoneChange }: AdminSponsorChatProps) {
  const { sponsorUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadMessages();

    const subscription = supabase
      .channel(`admin_sponsor_messages_${sponsorId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sponsor_messages',
        filter: `sponsor_id=eq.${sponsorId}`
      }, () => {
        loadMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sponsorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data } = await supabase
        .from('sponsor_messages')
        .select('*')
        .eq('sponsor_id', sponsorId)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
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

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `message-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !sponsorUser?.id) return;

    setSending(true);

    try {
      let fileUrl = null;
      let fileName = null;
      let fileType = null;

      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
        fileName = selectedFile.name;
        fileType = selectedFile.type;
      }

      const { error } = await supabase
        .from('sponsor_messages')
        .insert([{
          sponsor_id: sponsorId,
          message: newMessage.trim() || (selectedFile ? 'Sent a file' : ''),
          sent_by_role: 'admin',
          sent_by_user_id: sponsorUser.id,
          is_read: false,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType
        }]);

      if (error) throw error;

      setNewMessage('');
      setSelectedFile(null);
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert('Please select a PNG, JPG, or PDF file');
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">Conversation</h3>
        <button
          onClick={onConversationDoneChange}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-colors bg-slate-600 text-white hover:bg-slate-700"
        >
          <BellOff className="w-3.5 h-3.5" />
          <span>Clear Notifications</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 mb-2">No messages yet</p>
            <p className="text-sm text-slate-400">Start a conversation with this sponsor</p>
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
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                {message.file_url && (
                  <div className="mt-2">
                    {message.file_type?.startsWith('image/') ? (
                      <a href={message.file_url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={message.file_url}
                          alt={message.file_name || 'Attachment'}
                          className="max-w-full rounded-lg border border-white/20"
                          style={{ maxHeight: '200px' }}
                        />
                      </a>
                    ) : (
                      <a
                        href={message.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                          message.sent_by_role === 'admin' ? 'bg-blue-700' : 'bg-gray-100'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{message.file_name || 'Attachment'}</span>
                      </a>
                    )}
                  </div>
                )}
                <p
                  className={`text-xs mt-1 ${
                    message.sent_by_role === 'admin' ? 'text-blue-100' : 'text-slate-500'
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

      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-200 p-4 bg-white"
      >
        {selectedFile && (
          <div className="mb-3 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            {selectedFile.type.startsWith('image/') ? (
              <ImageIcon className="w-4 h-4 text-blue-600" />
            ) : (
              <FileText className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-sm text-blue-900 flex-1">{selectedFile.name}</span>
            <button
              type="button"
              onClick={removeFile}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={sending}
          />
          <label className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer">
            <Paperclip className="w-4 h-4" />
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={sending}
            />
          </label>
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && !selectedFile)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
