import { useState, useEffect, useRef } from 'react';
import { Search, Send, MessageSquare, Users, X } from 'lucide-react';
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
  const [allMembers, setAllMembers] = useState<Participant[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Load all company members and conversations on mount
  useEffect(() => {
    fetchAllMembers();
    fetchConversations();
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
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    ws.onerror = () => { /* silent — REST fallback in place */ };

    return () => { ws.close(); };
  }, [selectedConvo?.id]);

  const fetchAllMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch(`${API}/community/users`, { headers: getHeaders() });
      if (res.ok) {
        const data: Participant[] = await res.json();
        // Exclude current user
        setAllMembers(data.filter(u => u.id !== myId));
      } else if (res.status === 400) {
        setError('You are not assigned to a company yet.');
      }
    } catch { setError('Could not reach the server.'); }
    finally { setLoadingMembers(false); }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API}/community/conversations`, { headers: getHeaders() });
      if (res.ok) setConversations(await res.json());
    } catch { /* silent */ }
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
    await fetchMessages(convo.id);
    setConversations(prev => prev.map(c => c.id === convo.id ? { ...c, unread_count: 0 } : c));
  };

  const openChatWithMember = async (user: Participant) => {
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
    } catch { setError('Could not open conversation.'); }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedConvo) return;
    const content = input.trim();
    setInput('');

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }));
    } else {
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

    setConversations(prev => prev.map(c =>
      c.id === selectedConvo.id
        ? { ...c, last_message: { content, created_at: new Date().toISOString(), sender_id: myId } as any }
        : c
    ));
  };

  // Find existing conversation for a member (if any)
  const getConvoForMember = (userId: string): Conversation | undefined => {
    return conversations.find(c =>
      c.participant_a.id === userId || c.participant_b.id === userId
    );
  };

  // Determine if a member is the currently selected chat partner
  const isMemberSelected = (userId: string): boolean => {
    if (!selectedConvo) return false;
    const other = getOtherParticipant(selectedConvo, myId);
    return other.id === userId;
  };

  // Filter members by search query
  const filteredMembers = allMembers.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.title || '').toLowerCase().includes(q)
    );
  });

  const otherUser = selectedConvo ? getOtherParticipant(selectedConvo, myId) : null;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50">

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className="w-80 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          <h2 className="font-semibold text-slate-800">Team Members</h2>
          {allMembers.length > 0 && (
            <span className="ml-auto text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-medium">
              {allMembers.length}
            </span>
          )}
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="community-search-input"
              type="text"
              placeholder="Search members…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Members list */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          {loadingMembers && (
            <div className="flex flex-col gap-3 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingMembers && !error && filteredMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Users className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">
                {searchQuery ? 'No members match your search' : 'No team members found'}
              </p>
            </div>
          )}

          {!loadingMembers && filteredMembers.map(user => {
            const convo = getConvoForMember(user.id);
            const unread = convo?.unread_count ?? 0;
            const lastMsg = convo?.last_message;
            const isActive = isMemberSelected(user.id);

            return (
              <button
                key={user.id}
                id={`member-${user.id}`}
                onClick={() => openChatWithMember(user)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 ${
                  isActive ? 'bg-teal-50 border-l-2 border-l-teal-500' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar user={user} size="md" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm truncate ${isActive ? 'font-semibold text-teal-700' : 'font-medium text-slate-800'}`}>
                      {user.first_name} {user.last_name}
                    </span>
                    {lastMsg && (
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-1">{formatTime(lastMsg.created_at)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 truncate">
                      {lastMsg ? lastMsg.content : user.title || user.email}
                    </span>
                    {unread > 0 && (
                      <span className="ml-1 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-medium">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main chat panel ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {!selectedConvo ? (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-5 shadow-lg">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Company Community</h3>
            <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
              Select a team member from the list to start a private conversation within your company workspace.
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 flex-shrink-0">
              <div className="relative">
                <Avatar user={otherUser!} size="lg" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{otherUser!.first_name} {otherUser!.last_name}</h3>
                {otherUser!.title && <p className="text-sm text-slate-500">{otherUser!.title}</p>}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {loading && (
                <div className="text-center py-8 text-sm text-slate-400">Loading messages…</div>
              )}
              {!loading && messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-400">No messages yet. Say hi! 👋</p>
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === myId;
                const prevMsg = messages[idx - 1];
                const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
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
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine
                            ? 'bg-teal-600 text-white rounded-tr-sm'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                          }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-xs text-slate-400 mt-1 px-1">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="bg-white border-t border-slate-200 px-6 py-4 flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
                <input
                  id="community-message-input"
                  type="text"
                  placeholder={`Message ${otherUser!.first_name}…`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                />
                <button
                  id="community-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="p-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 px-1">Press Enter to send</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
