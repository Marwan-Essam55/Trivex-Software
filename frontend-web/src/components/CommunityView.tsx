import { useState, useEffect, useRef } from 'react';
import { Search, Send, MessageSquare, Users, X, Paperclip } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const API = 'http://127.0.0.1:8000';

interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture_url?: string;
  title?: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_first_name: string;
  sender_last_name: string;
  sender_profile_picture_url?: string;
  content: string;
  image_url?: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  company_name: string;
  participant_a: Participant;
  participant_b: Participant;
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
}

function getToken() {
  return localStorage.getItem('access_token') || '';
}

function getCurrentUserId(): string {
  try {
    const d: any = jwtDecode(getToken());
    return d.user_id || '';
  } catch { return ''; }
}

function getHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

function getOtherParticipant(convo: Conversation, myId: string): Participant {
  return convo.participant_a.id === myId ? convo.participant_b : convo.participant_a;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function isImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return clean.startsWith('http') && (
    clean.endsWith('.jpg') ||
    clean.endsWith('.jpeg') ||
    clean.endsWith('.png') ||
    clean.endsWith('.gif') ||
    clean.endsWith('.webp') ||
    clean.includes('cloudinary.com')
  );
}

function Avatar({ user, size = 'md' }: { user: Participant | { first_name: string; last_name: string; profile_picture_url?: string }; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  if (user.profile_picture_url) {
    return <img src={user.profile_picture_url} alt={initials} className={`${sizes[size]} rounded-full object-cover flex-shrink-0`} />;
  }
  const colors = ['bg-teal-500', 'bg-indigo-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500'];
  const colorIdx = (user.first_name.charCodeAt(0) + user.last_name.charCodeAt(0)) % colors.length;
  return (
    <div className={`${sizes[size]} ${colors[colorIdx]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

export function CommunityView() {
  const myId = getCurrentUserId();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [colleagues, setColleagues] = useState<Participant[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations and colleagues on mount
  useEffect(() => {
    fetchConversations();
    fetchColleagues();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect WebSocket when conversation changes
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (!selectedConvo) return;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://127.0.0.1:8000/community/ws/${selectedConvo.id}?token=${getToken()}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const msg: ChatMessage = JSON.parse(e.data);
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    ws.onerror = () => { /* silent — REST fallback in place */ };

    return () => { ws.close(); };
  }, [selectedConvo?.id]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API}/community/conversations`, { headers: getHeaders() });
      if (res.ok) setConversations(await res.json());
      else if (res.status === 400) setError('You are not assigned to a company yet.');
    } catch { setError('Could not reach the server.'); }
  };

  const fetchMessages = async (convoId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/community/conversations/${convoId}/messages`, { headers: getHeaders() });
      if (res.ok) setMessages(await res.json());
    } finally { setLoading(false); }
  };

  const selectConversation = async (convo: Conversation) => {
    setSelectedConvo(convo);
    setShowSearch(false);
    setSearchQuery('');
    await fetchMessages(convo.id);
    // Mark unread locally
    setConversations(prev => prev.map(c => c.id === convo.id ? { ...c, unread_count: 0 } : c));
    window.dispatchEvent(new Event('messagesRead'));
  };

  const startConversation = async (user: Participant) => {
    try {
      const res = await fetch(`${API}/community/conversations/${user.id}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (res.ok) {
        const convo: Conversation = await res.json();
        setConversations(prev => {
          const exists = prev.find(c => c.id === convo.id);
          return exists ? prev : [convo, ...prev];
        });
        await selectConversation(convo);
      }
    } catch { setError('Could not start conversation.'); }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedConvo) return;
    const content = input.trim();
    setInput('');

    // Try WebSocket first
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }));
    } else {
      // REST fallback
      const res = await fetch(`${API}/community/conversations/${selectedConvo.id}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const msg: ChatMessage = await res.json();
        setMessages(prev => [...prev, msg]);
      }
    }

    // Update last message in convo list
    setConversations(prev => prev.map(c =>
      c.id === selectedConvo.id
        ? { ...c, last_message: { content, created_at: new Date().toISOString(), sender_id: myId } as any }
        : c
    ));
  };

  const fetchColleagues = async () => {
    try {
      const res = await fetch(`${API}/community/users`, { headers: getHeaders() });
      if (res.ok) {
        const data: Participant[] = await res.json();
        setColleagues(data.filter(u => u.id !== myId));
      }
    } catch {
      setError('Could not fetch colleagues.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConvo) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await fetch(`${API}/community/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const imageUrl = data.url;

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ content: '', image_url: imageUrl }));
        } else {
          const restRes = await fetch(`${API}/community/conversations/${selectedConvo.id}/messages`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ content: '', image_url: imageUrl }),
          });
          if (restRes.ok) {
            const msg: ChatMessage = await restRes.json();
            setMessages(prev => [...prev, msg]);
          }
        }

        setConversations(prev => prev.map(c =>
          c.id === selectedConvo.id
            ? { ...c, last_message: { content: 'Sent an image', created_at: new Date().toISOString(), sender_id: myId } as any }
            : c
        ));
      } else {
        setError('Failed to upload file.');
      }
    } catch {
      setError('Error uploading file.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
  };

  const otherUser = selectedConvo ? getOtherParticipant(selectedConvo, myId) : null;

  const filteredColleagues = colleagues.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = `${c.first_name} ${c.last_name}`.toLowerCase();
    const email = c.email.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*, .pdf, .doc, .docx"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className="w-80 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col flex-shrink-0 transition-colors">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Community</h2>
          </div>
          <button
            id="community-new-chat-btn"
            onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors"
            title="Search colleagues"
          >
            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {/* Search panel */}
        {showSearch && (
          <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="community-search-input"
                autoFocus
                type="text"
                placeholder="Search colleagues…"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Colleague list */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="m-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">{error}</div>
          )}
          {!error && filteredColleagues.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-3">
                <Users className="w-7 h-7 text-teal-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">No colleagues found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Ask your admin to add users to your workspace.</p>
            </div>
          )}
          {filteredColleagues.map(colleague => {
            const convo = conversations.find(c => getOtherParticipant(c, myId).id === colleague.id);
            const isActive = selectedConvo 
              ? (convo ? selectedConvo.id === convo.id : otherUser?.id === colleague.id)
              : false;

            if (convo) {
              return (
                <button
                  key={colleague.id}
                  id={`convo-${convo.id}`}
                  onClick={() => selectConversation(convo)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-b border-slate-50 dark:border-slate-700/50 ${isActive ? 'bg-teal-50 dark:bg-teal-950/20 border-l-2 border-l-teal-500' : ''}`}
                >
                  <div className="relative">
                    <Avatar user={colleague} size="md" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-slate-800" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{colleague.first_name} {colleague.last_name}</span>
                      {convo.last_message && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-1">{formatTime(convo.last_message.created_at)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {convo.last_message ? convo.last_message.content : 'Start a conversation'}
                      </span>
                      {convo.unread_count > 0 && (
                        <span className="ml-1 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-medium">
                          {convo.unread_count > 9 ? '9+' : convo.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            } else {
              return (
                <button
                  key={colleague.id}
                  onClick={() => startConversation(colleague)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-b border-slate-50 dark:border-slate-700/50 ${isActive ? 'bg-teal-50 dark:bg-teal-950/20 border-l-2 border-l-teal-500' : ''}`}
                >
                  <div className="relative">
                    <Avatar user={colleague} size="md" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-slate-800" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{colleague.first_name} {colleague.last_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {colleague.title || 'Start a conversation'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            }
          })}
        </div>
      </aside>

      {/* ── Main chat panel ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 transition-colors">
        {!selectedConvo ? (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-5 shadow-lg">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Company Community</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
              Chat privately with your colleagues. All conversations stay within your company workspace.
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center gap-4 flex-shrink-0 transition-colors">
              <div className="relative">
                <Avatar user={otherUser!} size="lg" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-slate-800" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{otherUser!.first_name} {otherUser!.last_name}</h3>
                {otherUser!.title && <p className="text-sm text-slate-500 dark:text-slate-400">{otherUser!.title}</p>}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {loading && messages.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">Loading messages…</div>
              )}
              {!loading && messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-400 dark:text-slate-500">No messages yet. Say hi! 👋</p>
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === myId;
                const prevMsg = messages[idx - 1];
                const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                const isImg = msg.image_url || isImageUrl(msg.content);
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                    {!isMine && (
                      <div className="w-8 h-8 flex-shrink-0">
                        {showAvatar && (
                          <Avatar
                            user={{ first_name: msg.sender_first_name, last_name: msg.sender_last_name, profile_picture_url: msg.sender_profile_picture_url }}
                            size="sm"
                          />
                        )}
                      </div>
                    )}
                    <div className={`flex flex-col max-w-xs lg:max-w-md xl:max-w-lg ${isMine ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? 'bg-teal-600 text-white rounded-tr-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm'
                        } ${isImg ? '!p-1 bg-transparent dark:bg-transparent !border-none !shadow-none' : ''}`}
                      >
                        {isImg ? (
                          <img
                            src={msg.image_url || msg.content}
                            alt="Shared media"
                            className="max-w-xs rounded-xl object-contain cursor-pointer shadow-md border border-slate-200 dark:border-slate-700"
                            onClick={() => window.open(msg.image_url || msg.content, '_blank')}
                          />
                        ) : (
                          msg.content
                        )}
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 px-1">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex-shrink-0 transition-colors">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
                <input
                  id="community-message-input"
                  type="text"
                  placeholder={`Message ${otherUser!.first_name}…`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none"
                />

                <button
                  type="button"
                  id="community-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg text-slate-400 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex-shrink-0"
                  title="Upload image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  id="community-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim() && !loading}
                  className="p-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 px-1">Press Enter to send · 📎 to share images</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
