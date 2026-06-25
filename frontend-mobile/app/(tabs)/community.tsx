import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform, Image, Keyboard, ScrollView, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Send, MessageCircle, ArrowLeft, Image as ImageIcon, X, Users, Paperclip } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch, getSessionToken, API_BASE } from '../../services/api';
import { useAuth, decodeJWT } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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

export default function CommunityTab() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme tokens
  const bg = isDark ? '#020617' : '#f8fafc';
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardBorder = isDark ? '#1e293b' : '#e2e8f0';
  const valueClr = isDark ? '#f1f5f9' : '#0f172a';
  const subClr = isDark ? '#64748b' : '#64748b';
  const inputBg = isDark ? '#0f172a' : '#ffffff';
  const sectionBg = isDark ? '#1e293b' : '#f1f5f9';
  const divider = isDark ? '#1e293b' : '#f1f5f9';
  const avatarBg = isDark ? '#1e293b' : '#f1f5f9';
  const chatBg = isDark ? '#020617' : '#f8fafc';

  const { user, isLoading: authLoading, token } = useAuth();
  // Safe synchronous fallback
  const myId = user?.id || '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [colleagues, setColleagues] = useState<Participant[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchConversations = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const convos = await apiFetch('/community/conversations');
      setConversations(convos || []);
      setError(null);
    } catch (err: any) {
      if (err.message && (err.message.includes('400') || err.message.includes('not assigned to a company'))) {
        setError('You are not assigned to a company yet.');
      } else {
        console.error('Failed to fetch conversations:', err);
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  const fetchColleagues = useCallback(async () => {
    try {
      const data = await apiFetch('/community/users');
      setColleagues((data || []).filter((u: Participant) => u.id !== myId));
    } catch (err: any) {
      if (err.message && (err.message.includes('400') || err.message.includes('not assigned to a company'))) {
        setError('You are not assigned to a company yet.');
      } else {
        console.error('Failed to fetch colleagues:', err);
      }
    }
  }, [myId]);

  const fetchMessages = useCallback(async (convoId: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const msgs = await apiFetch(`/community/conversations/${convoId}/messages`);
      setMessages(msgs || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wait until auth session is fully loaded and a token exists
    // before making authenticated API calls, to avoid 401 race conditions.
    if (authLoading || !token) return;
    fetchConversations();
    fetchColleagues();
  }, [authLoading, token, fetchConversations, fetchColleagues]);

  // WebSocket Connection
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (!selectedConvo) return;

    let isActive = true;

    const connectWebSocket = async () => {
      const token = await getSessionToken();
      if (!token || !isActive) return;

      const wsHost = API_BASE.replace(/^https?:\/\//, '');
      const protocol = API_BASE.startsWith('https') ? 'wss' : 'ws';
      const wsUrl = `${protocol}://${wsHost}/community/ws/${selectedConvo.id}?token=${token}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          const msg: ChatMessage = JSON.parse(e.data);
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        } catch (e) {
          console.error("WS parse error", e);
        }
      };

      ws.onerror = () => {
        // Silent fallback to REST
      };
    };

    connectWebSocket();

    return () => {
      isActive = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [selectedConvo]);

  useEffect(() => {
    if (selectedConvo) {
      fetchMessages(selectedConvo.id);
      // Mark as read locally
      setConversations(prev => prev.map(c => c.id === selectedConvo.id ? { ...c, unread_count: 0 } : c));
    }
  }, [selectedConvo, fetchMessages]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedConvo) {
      await fetchMessages(selectedConvo.id, true);
    } else {
      await fetchConversations(true);
      await fetchColleagues();
    }
    setRefreshing(false);
  }, [selectedConvo, fetchConversations, fetchMessages, fetchColleagues]);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const startConversation = async (colleague: Participant) => {
    try {
      const convo = await apiFetch(`/community/conversations/${colleague.id}`, { method: 'POST' });
      setConversations(prev => prev.find(c => c.id === convo.id) ? prev : [convo, ...prev]);
      setSelectedConvo(convo);
      setSearchQuery('');
    } catch (err) {
      Alert.alert('Error', 'Could not start conversation');
    }
  };

  const sendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !selectedConvo) return;
    setSending(true);

    try {
      const content = messageInput.trim();
      let uploadedImageUrl = undefined;

      // 1. Upload image if selected
      if (selectedImage) {
        const formData = new FormData();
        const fileExt = selectedImage.split('.').pop() || 'jpg';
        formData.append('file', {
          uri: selectedImage,
          name: `upload.${fileExt}`,
          type: `image/${fileExt}`
        } as any);

        const token = await getSessionToken();
        const uploadRes = await fetch(`${API_BASE}/community/upload-image`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await uploadRes.json();
        uploadedImageUrl = data.url;
      }

      // 2. Send message via WS or REST
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ content, image_url: uploadedImageUrl }));
      } else {
        const payload: any = { content };
        if (uploadedImageUrl) {
          payload.image_url = uploadedImageUrl;
        }
        const msg = await apiFetch(`/community/conversations/${selectedConvo.id}/messages`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessages(prev => [...prev, msg]);
      }

      // Update local conversation preview
      setConversations(prev => prev.map(c =>
        c.id === selectedConvo.id
          ? { ...c, last_message: { content: content || 'Sent an image', created_at: new Date().toISOString(), sender_id: myId } as any }
          : c
      ));

      setMessageInput('');
      setSelectedImage(null);
      Keyboard.dismiss();
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (convo: Conversation) =>
    convo.participant_a.id === myId ? convo.participant_b : convo.participant_a;

  // ─── Render Chat View ────────────────────────────────────────────────────────

  if (selectedConvo) {
    const otherUser = getOtherParticipant(selectedConvo);
    const initials = `${otherUser.first_name[0]}${otherUser.last_name[0]}`.toUpperCase();

    return (
      <View style={{ flex: 1, backgroundColor: chatBg }}>
        {/* Chat header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: cardBg, borderBottomWidth: 1, borderBottomColor: cardBorder }}>
          <TouchableOpacity onPress={() => setSelectedConvo(null)} style={{ padding: 8, marginLeft: -8, borderRadius: 999 }}>
            <ArrowLeft size={24} color={valueClr} />
          </TouchableOpacity>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: avatarBg, borderWidth: 1, borderColor: cardBorder, alignItems: 'center', justifyContent: 'center', marginLeft: 8, marginRight: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: subClr }}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: valueClr }}>{otherUser.first_name} {otherUser.last_name}</Text>
            {otherUser.title && <Text style={{ fontSize: 11, color: subClr }}>{otherUser.title}</Text>}
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {loading && !refreshing ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#0d9488" /></View>
          ) : (
            <FlatList
              extraData={isDark}
              ref={flatListRef}
              data={messages}
              keyExtractor={m => m.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
              renderItem={({ item, index }) => {
                const isMe = item.sender_id === myId;
                const showTime = index === 0 || new Date(item.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000;
                const isImg = item.image_url || isImageUrl(item.content);
                const displayImage = item.image_url || (isImageUrl(item.content) ? item.content : null);
                return (
                  <View style={{ marginBottom: 16 }}>
                    {showTime && (
                      <Text style={{ textAlign: 'center', fontSize: 10, color: subClr, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    )}
                    <View style={{ maxWidth: '80%', alignSelf: isMe ? 'flex-end' : 'flex-start', flexDirection: isMe ? 'row' : 'row', alignItems: 'flex-end' }}>
                      {!isMe && (
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: isDark ? '#334155' : '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 4 }}>
                          <Text style={{ fontSize: 9, fontWeight: '700', color: subClr }}>{item.sender_first_name[0]}</Text>
                        </View>
                      )}
                      <View style={[
                        { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10 },
                        isMe
                          ? { backgroundColor: '#0f172a', borderBottomRightRadius: 4 }
                          : { backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorder, borderBottomLeftRadius: 4 },
                        isImg ? { backgroundColor: 'transparent', borderWidth: 0, padding: 4 } : {},
                      ]}>
                        {displayImage && (
                          <Image source={{ uri: displayImage }} style={{ width: 192, height: 192, borderRadius: 12, marginBottom: 4 }} resizeMode="cover" />
                        )}
                        {item.content && !isImageUrl(item.content) ? (
                          <Text style={{ fontSize: 15, lineHeight: 20, color: isMe ? '#ffffff' : valueClr }}>{item.content}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={() => (
                <View style={{ alignItems: 'center', paddingVertical: 40, opacity: 0.5 }}>
                  <MessageCircle size={40} color="#94a3b8" />
                  <Text style={{ color: subClr, fontWeight: '600', marginTop: 12 }}>Say hello to {otherUser.first_name}!</Text>
                </View>
              )}
            />
          )}

          {/* Message input */}
          <View style={{ backgroundColor: cardBg, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 28, borderTopWidth: 1, borderTopColor: cardBorder }}>
            {selectedImage && (
              <View style={{ position: 'relative', width: 80, height: 80, marginBottom: 12 }}>
                <Image source={{ uri: selectedImage }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                <TouchableOpacity onPress={() => setSelectedImage(null)} style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#0f172a', borderRadius: 999, padding: 4, borderWidth: 2, borderColor: cardBg }}>
                  <X size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
              <TouchableOpacity onPress={handlePickImage} style={{ padding: 12, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 999 }}>
                <Paperclip size={20} color={subClr} />
              </TouchableOpacity>
              <View style={{ flex: 1, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderRadius: 22, borderWidth: 1, borderColor: cardBorder, paddingHorizontal: 16, minHeight: 44, justifyContent: 'center', paddingVertical: 8, maxHeight: 128 }}>
                <TextInput
                  value={messageInput}
                  onChangeText={setMessageInput}
                  placeholder={`Message ${otherUser.first_name}...`}
                  placeholderTextColor={subClr}
                  style={{ fontSize: 15, color: valueClr }}
                  multiline
                />
              </View>
              <TouchableOpacity
                onPress={sendMessage}
                disabled={(!messageInput.trim() && !selectedImage) || sending}
                style={{ padding: 12, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: messageInput.trim() || selectedImage ? '#0d9488' : (isDark ? '#1e293b' : '#e2e8f0') }}
              >
                {sending ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color={messageInput.trim() || selectedImage ? '#fff' : subClr} />}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ─── Render Conversations List ───────────────────────────────────────────────

  const filteredConversations = conversations.filter(c => {
    const q = searchQuery.toLowerCase();
    const otherUser = getOtherParticipant(c);
    return `${otherUser.first_name} ${otherUser.last_name} ${otherUser.email}`.toLowerCase().includes(q);
  });

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 14, paddingTop: 4, borderBottomWidth: 1, borderBottomColor: cardBorder, backgroundColor: cardBg, flexDirection: 'row', alignItems: 'center' }}>
        <Users size={26} color="#0d9488" />
        <View style={{ marginLeft: 14 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: valueClr }}>Community</Text>
          <Text style={{ fontSize: 12, color: subClr, marginTop: 2 }}>Connect with your team</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, backgroundColor: bg }}>
        <View className="flex-row items-center">
          <View className="flex-1 relative justify-center">
            <View className="absolute left-3 z-10">
              <Search size={16} color="#94a3b8" />
            </View>
            <TextInput
              placeholder="Search colleagues..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0d9488" />}
      >
        {error ? (
          <View style={{ paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Users size={32} color="#f87171" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: valueClr, marginBottom: 8 }}>Notice</Text>
            <Text style={{ fontSize: 13, color: subClr, textAlign: 'center' }}>{error}</Text>
          </View>
        ) : (
          <>
            {filteredConversations.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ paddingHorizontal: 20, paddingVertical: 8, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: subClr, backgroundColor: sectionBg }}>Messages</Text>
                {filteredConversations.map((convo, index) => {
                  const otherUser = getOtherParticipant(convo);
                  const initials = `${otherUser.first_name[0]}${otherUser.last_name[0]}`.toUpperCase();
                  return (
                    <TouchableOpacity
                      key={convo.id}
                      onPress={() => setSelectedConvo(convo)}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: cardBg, borderBottomWidth: index !== filteredConversations.length - 1 ? 1 : 0, borderBottomColor: divider }}
                      activeOpacity={0.7}
                    >
                      <View style={{ position: 'relative' }}>
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: avatarBg, borderWidth: 1, borderColor: cardBorder, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: subClr }}>{initials}</Text>
                        </View>
                        {convo.unread_count > 0 && (
                          <View style={{ position: 'absolute', top: 0, right: 12, width: 16, height: 16, backgroundColor: '#0d9488', borderRadius: 8, borderWidth: 2, borderColor: cardBg, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 8, fontWeight: '700', color: '#ffffff' }}>{convo.unread_count}</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: valueClr }} numberOfLines={1}>{otherUser.first_name} {otherUser.last_name}</Text>
                          {convo.last_message && (
                            <Text style={{ fontSize: 10, color: subClr, fontWeight: '500' }}>
                              {new Date(convo.last_message.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </Text>
                          )}
                        </View>
                        <Text style={{ fontSize: 13, color: convo.unread_count > 0 ? valueClr : subClr, fontWeight: convo.unread_count > 0 ? '600' : '400' }} numberOfLines={1}>
                          {convo.last_message ? (convo.last_message.content || 'Sent an image') : 'Start chatting...'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
