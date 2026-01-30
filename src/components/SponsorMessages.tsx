import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Loader2, Send, CheckCheck, AlertCircle, BellOff, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  sponsor_id: string;
  message: string;
  sent_by_role: 'admin' | 'sponsor';
  sent_by_user_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
}

interface SponsorMessagesProps {
  sponsorId: string;
}

export function SponsorMessages({ sponsorId }: SponsorMessagesProps) {
  const { sponsorUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMessages();
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
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

  async function loadMessages() {
    setLoading(true);
    const { data } = await supabase
      .from('sponsor_messages')
      .select('*')
      .eq('sponsor_id', sponsorId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      markUnreadAsRead(data);
    }
    setLoading(false);
  }

  async function markUnreadAsRead(msgs: Message[]) {
    const unreadAdminMessages = msgs.filter(
      m => !m.is_read && m.sent_by_role === 'admin'
    );

    if (unreadAdminMessages.length > 0) {
      await supabase
        .from('sponsor_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadAdminMessages.map(m => m.id));
    }
  }

  async function uploadFile(file: File): Promise<string | null> {
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
  }

  async function sendMessage() {
    if ((!newMessage.trim() && !selectedFile) || !sponsorUser) return;

    setSending(true);
    setUploading(true);

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
      .insert({
        sponsor_id: sponsorId,
        message: newMessage.trim() || (selectedFile ? 'Sent a file' : ''),
        sent_by_role: 'sponsor',
        sent_by_user_id: sponsorUser.id,
        is_read: false,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType
      });

    if (!error) {
      setNewMessage('');
      setSelectedFile(null);
      await loadMessages();
    }

    setSending(false);
    setUploading(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert('Please select a PNG, JPG, or PDF file');
      }
    }
  }

  function removeFile() {
    setSelectedFile(null);
  }

  async function clearNotifications() {
    await supabase
      .from('sponsor_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('sponsor_id', sponsorId)
      .eq('sent_by_role', 'admin')
      .eq('is_read', false);

    await loadMessages();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 flex-1">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Message Your Account Manager</p>
            <p className="text-blue-700">Use this space to communicate with your SINC account manager.</p>
          </div>
        </div>
        <button
          onClick={clearNotifications}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-slate-600 text-white hover:bg-slate-700 whitespace-nowrap"
        >
          <BellOff className="w-4 h-4" />
          <span>Clear Notifications</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400">Start a conversation with your account manager</p>
            </div>
          ) : (
            messages.map((message) => {
              const isFromSponsor = message.sent_by_role === 'sponsor';
              return (
                <div
                  key={message.id}
                  className={`flex ${isFromSponsor ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                      isFromSponsor
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium opacity-75">
                        {isFromSponsor ? 'You' : 'Account Manager'}
                      </span>
                      <span className="text-xs opacity-50">
                        {new Date(message.created_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
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
                              isFromSponsor ? 'bg-blue-700' : 'bg-gray-200'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{message.file_name || 'Attachment'}</span>
                          </a>
                        )}
                      </div>
                    )}
                    {isFromSponsor && (
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <CheckCheck className={`w-4 h-4 ${message.is_read ? 'text-green-300' : 'text-blue-300'}`} />
                        <span className="text-xs opacity-75">
                          {message.is_read ? 'Read' : 'Sent'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {selectedFile && (
            <div className="mb-3 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon className="w-4 h-4 text-blue-600" />
              ) : (
                <FileText className="w-4 h-4 text-blue-600" />
              )}
              <span className="text-sm text-blue-900 flex-1">{selectedFile.name}</span>
              <button
                onClick={removeFile}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              disabled={sending}
            />
            <div className="flex flex-col gap-2">
              <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer flex items-center gap-2 h-fit">
                <Paperclip className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={sending}
                />
              </label>
              <button
                onClick={sendMessage}
                disabled={sending || (!newMessage.trim() && !selectedFile)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 h-fit"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line. Attach PNG, JPG, or PDF files.</p>
        </div>
      </div>
    </div>
  );
}
