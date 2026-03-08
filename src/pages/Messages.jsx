import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Paperclip,
  Smile,
  Plus,
  Loader2,
  X,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
// import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import CallModal from '@/components/CallModal';
import SEOHead from '@/components/SEOHead';
import { WebRTCManager } from '@/utils/webrtc';

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Call states
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [callState, setCallState] = useState('idle'); // 'idle', 'calling', 'incoming', 'active'
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const webrtcManagerRef = useRef(null);
  const callChannelRef = useRef(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const pendingOfferRef = useRef(null); // Store offer from caller
  const callerIdRef = useRef(null); // Store caller ID
  const pendingRemoteIceRef = useRef([]); // queue ICE candidates that arrive before manager exists

  
  // UI states
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const conversationsRealtimeRef = useRef(null);
  const allMessagesRealtimeRef = useRef(null);
  const messageChannelRef = useRef(null);


  useEffect(() => {
    if (user) {
      fetchConversations();
      setupCallListener();
      setupConversationsRealtime();
    }
    
    return () => {
      try {
        if (callChannelRef.current) {
          callChannelRef.current.unsubscribe();
          supabase.removeChannel(callChannelRef.current);
          callChannelRef.current = null;
        }

        if (conversationsRealtimeRef.current) {
          conversationsRealtimeRef.current.unsubscribe();
          supabase.removeChannel(conversationsRealtimeRef.current);
          conversationsRealtimeRef.current = null;
        }

        if (allMessagesRealtimeRef.current) {
          allMessagesRealtimeRef.current.unsubscribe();
          supabase.removeChannel(allMessagesRealtimeRef.current);
          allMessagesRealtimeRef.current = null;
        }

        if (messageChannelRef.current) {
          messageChannelRef.current.unsubscribe();
          supabase.removeChannel(messageChannelRef.current);
          messageChannelRef.current = null;
        }
      } catch (err) {
        console.warn("Error cleaning up channels:", err);
      }

      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.cleanup();
        webrtcManagerRef.current = null;
      }

      pendingRemoteIceRef.current = [];
      pendingOfferRef.current = null;
      callerIdRef.current = null;
    };

  }, [user]);

  // Real-time subscription for all conversations and messages
  const setupConversationsRealtime = () => {
    if (!user) return;

    // 🛑 Already subscribed? Remove first!
    if (conversationsRealtimeRef.current) {
      supabase.removeChannel(conversationsRealtimeRef.current);
    }
    if (allMessagesRealtimeRef.current) {
      supabase.removeChannel(allMessagesRealtimeRef.current);
    }
    
    // Listen for conversation changes (INSERT and UPDATE)
    conversationsRealtimeRef.current = supabase
      .channel(`conversations-${user.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          const conv = payload.new;
          // Check if this conversation involves the current user
          if (conv && (conv.participant1_id === user.id || conv.participant2_id === user.id)) {
            console.log('Conversation update received:', payload.eventType);
            fetchConversations();
          }
        }
      )
      .subscribe((status) => {
        console.log('Conversations channel status:', status);
      });
    
    // Listen for all messages to update conversation list and show notifications
    allMessagesRealtimeRef.current = supabase
      .channel(`all-messages-${user.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const msg = payload.new;
          // Only process if this message is for the current user
          if (msg.sender_id === user.id || msg.receiver_id === user.id) {
            console.log('New message received:', msg.id);
            fetchConversations();
            
            // If message is NOT for currently selected conversation and user is receiver
            if (msg.receiver_id === user.id && 
                (!selectedConversation || msg.conversation_id !== selectedConversation.id)) {
              // Update unread count
              setUnreadCounts(prev => ({
                ...prev,
                [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1
              }));

              // Show notification for new message
              toast({
                title: "New Message",
                description: msg.content?.substring(0, 50) + (msg.content?.length > 50 ? '...' : ''),
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('All messages channel status:', status);
      });
  };

  // useEffect(() => {
  //   if (selectedConversation) {
  //     fetchMessages(selectedConversation.id);
  //     markMessagesAsRead(selectedConversation.id);
  //   }}
  useEffect(() => {
    if (!selectedConversation) return;

    // Fetch messages immediately when conversation is selected
    fetchMessages(selectedConversation.id);
    markMessagesAsRead(selectedConversation.id);
    
    // Clear unread count for this conversation
    setUnreadCounts(prev => ({
      ...prev,
      [selectedConversation.id]: 0
    }));

    // 🛑 Clean old channel
    if (messageChannelRef.current) {
      supabase.removeChannel(messageChannelRef.current);
    }
      
    // Set up real-time subscription for messages in this conversation
    messageChannelRef.current = supabase
      .channel(`messages-${selectedConversation.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        (payload) => {
          const msg = payload.new;
          console.log('Real-time message received:', msg);
            
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
            
          scrollToBottom();
            
          // Mark as read if it's from the other user
          if (msg.sender_id !== user.id) {
            markMessagesAsRead(selectedConversation.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('Message channel status:', status);
      });

    return () => {
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
      }
    };
  }, [selectedConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupCallListener = () => {
    if (!user) return;

    // Clean existing call channel if any
    try {
      if (callChannelRef.current) {
        // unsubscribe + remove
        callChannelRef.current.unsubscribe();
        supabase.removeChannel(callChannelRef.current);
      }
    } catch (e) {
        console.warn('Error cleaning previous call channel', e);
      }

    // Shared calls channel — everyone subscribes and payloads include `to`
    const ch = supabase.channel('calls');

    // Register handlers BEFORE subscribe
    ch.on('broadcast', { event: 'offer' }, async ({ payload }) => {
      if (payload.to !== user.id) return;

      console.log('📞 Offer received:', payload);
      pendingOfferRef.current = payload.offer;
      callerIdRef.current = payload.from;
      setCallType(payload.type);
      setCallState('incoming');
      setIsCallModalOpen(true);

      // optional: fetch conversation details
      try {
        const { data: conversation } = await supabase
          .from('conversations')
          .select(`
            *,
            participant1:profiles!conversations_participant1_id_fkey(id, full_name, avatar_url),
            participant2:profiles!conversations_participant2_id_fkey(id, full_name, avatar_url)
          `)
          .eq('id', payload.conversationId)
          .single();

        if (conversation) setSelectedConversation(conversation);
      } catch (err) {
          console.warn('Failed to load conversation on offer', err);
        }
    });

    ch.on('broadcast', { event: 'answer' }, async ({ payload }) => {
      if (payload.to !== user.id) return;
      console.log('✅ Answer received:', payload);
      if (webrtcManagerRef.current && payload.answer) {
        await webrtcManagerRef.current.handleAnswer({ answer: payload.answer, from: payload.from });
      }
      setCallState('connecting');
    });

    ch.on('broadcast', { event: 'ice' }, async ({ payload }) => {
      if (payload.to !== user.id) return;

      // If we already have a manager, deliver immediately
      if (webrtcManagerRef.current) {
        try {
          await webrtcManagerRef.current.handleIceCandidate(payload);
        } catch (err) {
          console.warn('Failed to add ice to manager', err);
        }
        return;
      }

      // Otherwise queue it so we can process after accept/create
      console.log('Queuing remote ICE (no manager yet)');
      pendingRemoteIceRef.current.push(payload.candidate);
    });

    ch.on('broadcast', { event: 'call-rejected' }, ({ payload }) => {
      if (payload.to !== user.id) return;
      console.log('❌ Call rejected', payload);
      toast({
        title: 'Call Declined',
        description: 'The user declined your call',
        variant: 'destructive'
      });
      handleEndCall();
    });

    ch.on('broadcast', { event: 'call-ended' }, ({ payload }) => {
      if (payload.to !== user.id && payload.from !== user.id) return;
      console.log('📴 Call ended', payload);
      handleEndCall();
    });

    // Subscribe AFTER registering handlers
    ch.subscribe((status) => {
      console.log('calls channel status:', status);
    });

    callChannelRef.current = ch;
  };

  const initiateCall = async (type) => {
    if (!selectedConversation) return;

    setCallType(type);
    setCallState('calling');
    setIsCallModalOpen(true);

    const other = getOtherParticipant(selectedConversation);

    // Ensure call channel exists
    if (!callChannelRef.current) setupCallListener();

    // Create WebRTC manager
    webrtcManagerRef.current = new WebRTCManager(user.id, selectedConversation.id);

    webrtcManagerRef.current.onIceCandidate = async (candidate) => {
      try {
        await callChannelRef.current.send({
          type: 'broadcast',
          event: 'ice',
          payload: {
            from: user.id,
            to: other.id,
            candidate
          }
        });
      } catch (err) {
        console.error('Failed to send ICE,', err);
      }
    };

    webrtcManagerRef.current.onRemoteStream = (stream) => {
      setRemoteStream(stream);
      setCallState('active');
    };

    try {
      const { stream, offer } = await webrtcManagerRef.current.startCall(type === 'video');
      setLocalStream(stream);

      // Broadcast offer to other user
      await callChannelRef.current.send({
        type: 'broadcast',
        event: 'offer',
        payload: {
          from: user.id,
          to: other.id,
          offer,
          conversationId: selectedConversation.id,
          type
        }
      });

      toast({
        title: 'Calling...',
        description: `${type === 'video' ? 'Video' : 'Voice'} call initiated`
      });
    } catch (error) {
      console.error('Error initiating call', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start call',
        variant: 'destructive'
      });
      handleEndCall();
    }
  };


  const handleAcceptCall = async () => {
    const callerId = callerIdRef.current;
    if (!pendingOfferRef.current || !callerId) {
      console.error('No pending offer or caller id when accepting');
      return;
    }

    if (!callChannelRef.current) setupCallListener();
    setCallState('connecting');

    webrtcManagerRef.current = new WebRTCManager(user.id, selectedConversation?.id || null);

    webrtcManagerRef.current.onIceCandidate = async (candidate) => {
      try {
        await callChannelRef.current.send({
          type: 'broadcast',
          event: 'ice',
          payload: {
            from: user.id,
            to: callerId,
            candidate
          }
        });
      } catch (err) {
        console.error('Failed to send ice', err);
      }
    };

    webrtcManagerRef.current.onRemoteStream = (stream) => {
      setRemoteStream(stream);
      setCallState('active');
    };

    // If we received ICE candidates before creating the manager (queued), push them to the manager's pendingCandidates
    if (pendingRemoteIceRef.current.length > 0) {
      console.log('Delivering', pendingRemoteIceRef.current.length, 'queued ICE candidates to manager');
      for (const candidate of pendingRemoteIceRef.current) {
        try {
          // manager.handleIceCandidate expects payload with .candidate
          await webrtcManagerRef.current.handleIceCandidate({ candidate });
        } catch (err) {
          console.warn('Failed to deliver queued ICE candidate', err);
        }
      }
      pendingRemoteIceRef.current = [];
    }

    try {
      const { stream, answer } = await webrtcManagerRef.current.answerCall(
        pendingOfferRef.current,
        callType === 'video'
      );

      setLocalStream(stream);

      await callChannelRef.current.send({
        type: 'broadcast',
        event: 'answer',
        payload: {
          from: user.id,
          to: callerId,
          answer
        }
      });

      // clear pending
      pendingOfferRef.current = null;
      callerIdRef.current = null;
    } catch (err) {
      console.error('Error answering call', err);
      toast({
        title: 'Error',
        description: 'Failed to accept call',
        variant: 'destructive'
      });
      handleEndCall();
    }
  };

  const handleDeclineCall = async () => {
    const otherParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;
    const targetId = callerIdRef.current || otherParticipant?.id;
    
    if (callChannelRef.current && targetId) {
      await callChannelRef.current.send({
        type: 'broadcast',
        event: 'call-rejected',
        payload: {
          from: user.id,
          to: targetId
        }
      });
    }
    
    // Clear refs
    pendingOfferRef.current = null;
    callerIdRef.current = null;
    handleEndCall();
  };

  const handleEndCall = async () => {
    const otherParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;
    const targetId = callerIdRef.current || otherParticipant?.id;
    
    if (callChannelRef.current && targetId) {
      await callChannelRef.current.send({
        type: 'broadcast',
        event: 'call-ended',
        payload: {
          from: user.id,
          to: targetId
        }
      });
    }
    
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.cleanup();
      webrtcManagerRef.current = null;
    }
    
    // Clear refs
    pendingOfferRef.current = null;
    callerIdRef.current = null;
    
    setIsCallModalOpen(false);
    setCallState('idle');
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallType(null);
  };

  const handleToggleMute = () => {
    if (webrtcManagerRef.current) {
      const muted = webrtcManagerRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const handleToggleVideo = () => {
    if (webrtcManagerRef.current) {
      const videoOff = webrtcManagerRef.current.toggleVideo();
      setIsVideoOff(videoOff);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(id, full_name, avatar_url),
          participant2:profiles!conversations_participant2_id_fkey(id, full_name, avatar_url)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user.id)
        .eq('read', false);
      
      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: 0
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('chat-files')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation || sendingMessage) return;

    const otherParticipant = getOtherParticipant(selectedConversation);
    const receiverId = otherParticipant.id;

    setSendingMessage(true);
    try {
      let fileUrl = null;
      
      if (selectedFile) {
        setUploadingFile(true);
        fileUrl = await uploadFile(selectedFile);
        setUploadingFile(false);
      }

      const messageContent = selectedFile 
        ? `${newMessage.trim()}\n[FILE: ${selectedFile.name}](${fileUrl})`
        : newMessage.trim();

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          receiver_id: receiverId,
          content: messageContent
        });

      if (error) throw error;

      setNewMessage('');
      setSelectedFile(null);
      setShowEmojiPicker(false);
      
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
      setUploadingFile(false);
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchedUsers([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position')
        .neq('id', user.id)
        .ilike('full_name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchedUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchingUsers(false);
    }
  };

  const startConversation = async (selectedUser) => {
    try {
      // Check if conversation already exists
      const { data: existingConv, error: searchError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${selectedUser.id}),and(participant1_id.eq.${selectedUser.id},participant2_id.eq.${user.id})`)
        .maybeSingle();

      if (existingConv) {
        // Conversation exists, fetch full details and select it
        const { data: fullConv } = await supabase
          .from('conversations')
          .select(`
            *,
            participant1:profiles!conversations_participant1_id_fkey(id, full_name, avatar_url),
            participant2:profiles!conversations_participant2_id_fkey(id, full_name, avatar_url)
          `)
          .eq('id', existingConv.id)
          .single();

        setSelectedConversation(fullConv);
        setNewChatOpen(false);
        return;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant1_id: user.id,
          participant2_id: selectedUser.id
        })
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(id, full_name, avatar_url),
          participant2:profiles!conversations_participant2_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (createError) throw createError;

      setConversations(prev => [newConv, ...prev]);
      setSelectedConversation(newConv);
      setNewChatOpen(false);
      setUserSearchQuery('');
      setSearchedUsers([]);
      
      toast({
        title: "Success",
        description: "Conversation started successfully"
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participant1_id === user.id 
      ? conversation.participant2 
      : conversation.participant1;
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv);
    return otherParticipant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-[calc(100vh-8rem)] flex bg-background rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Conversations Sidebar */}
            <Card className="w-80 flex flex-col h-full rounded-none border-0 border-r shadow-none">
          <CardHeader className="p-4 border-b bg-card/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-primary">Messages</CardTitle>
              <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="outline" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-10"
                        value={userSearchQuery}
                        onChange={(e) => {
                          setUserSearchQuery(e.target.value);
                          searchUsers(e.target.value);
                        }}
                      />
                    </div>
                    <ScrollArea className="h-64">
                      {searchingUsers ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : searchedUsers.length > 0 ? (
                        <div className="space-y-2">
                          {searchedUsers.map((searchUser) => (
                            <div
                              key={searchUser.id}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                              onClick={() => startConversation(searchUser)}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={searchUser.avatar_url} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {searchUser.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{searchUser.full_name}</p>
                                {searchUser.current_position && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {searchUser.current_position}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : userSearchQuery ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No users found</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Search for users to start a conversation</p>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <div className="px-4 py-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 h-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1 h-0">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <h3 className="font-medium text-muted-foreground mb-1">No conversations found</h3>
                <p className="text-xs text-muted-foreground">Start a new conversation</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  return (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-primary/5 border-l-4 border-primary shadow-sm'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        fetchMessages(conversation.id);
                        markMessagesAsRead(conversation.id);

                        // Reset unread for that conversation
                        setUnreadCounts(prev => ({
                          ...prev,
                          [conversation.id]: 0
                        }));
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 border-2 border-background">
                            <AvatarImage src={otherParticipant?.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {otherParticipant?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{otherParticipant?.full_name || 'Unknown User'}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground truncate">
                              {unreadCounts[conversation.id] > 0 
                                ? "New messages" 
                                : "Click to view messages"}
                            </p>

                            {unreadCounts[conversation.id] > 0 && (
                              <Badge className="ml-2 bg-primary text-white">
                                {unreadCounts[conversation.id]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-background">
                      <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getOtherParticipant(selectedConversation)?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{getOtherParticipant(selectedConversation)?.full_name || 'Unknown User'}</h3>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => initiateCall('audio')}
                    disabled={callState !== 'idle'}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => initiateCall('video')}
                    disabled={callState !== 'idle'}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 h-0 p-4 bg-accent/5">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="font-medium text-muted-foreground">No messages yet</p>
                      <p className="text-sm text-muted-foreground/70">Send a message to start the conversation</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    {messages.map((message, index) => {
                      const isOwn = message.sender_id === user.id;
                      const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {!isOwn && showAvatar && (
                              <Avatar className="h-7 w-7 mb-1">
                                <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar_url} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getOtherParticipant(selectedConversation)?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            {!isOwn && !showAvatar && <div className="w-7" />}
                            <div
                              className={`rounded-2xl px-4 py-2 shadow-sm ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-card text-card-foreground border rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <span className={`text-xs mt-1 block ${isOwn ? 'opacity-70' : 'text-muted-foreground'}`}>
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t bg-card/50 backdrop-blur-sm p-4">
                {selectedFile && (
                  <div className="mb-2 flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sendingMessage}
                    className="hover:bg-primary/10 transition-colors shrink-0"
                  >
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={sendingMessage}
                      className="min-h-[44px] max-h-32 resize-none border-0 bg-background/50 focus-visible:ring-1"
                      rows={1}
                    />
                  </div>
                  <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={sendingMessage}
                        className="hover:bg-primary/10 transition-colors shrink-0"
                      >
                        <Smile className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 border-0" align="end">
                      <EmojiPicker 
                        onEmojiClick={onEmojiClick}
                        width="100%"
                        height="400px"
                      />
                    </PopoverContent>
                  </Popover>
                  <Button 
                    onClick={sendMessage}
                    size="icon"
                    disabled={sendingMessage || uploadingFile || (!newMessage.trim() && !selectedFile)}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shrink-0"
                  >
                    {sendingMessage || uploadingFile ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-accent/10 to-accent/5">
              <div className="text-center max-w-md px-4">
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
                  <MessageCircle className="h-20 w-20 text-primary/60 mx-auto relative" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-primary">Select a conversation</h3>
                <p className="text-muted-foreground text-sm">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>

      {/* Call Modal */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={handleEndCall}
        callType={callType}
        callState={callState}
        localStream={localStream}
        remoteStream={remoteStream}
        otherUser={selectedConversation ? getOtherParticipant(selectedConversation) : null}
        onEndCall={handleEndCall}
        onAcceptCall={() => handleAcceptCall(callType)}
        onDeclineCall={handleDeclineCall}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
      />
    </DashboardLayout>
  );
};

export default Messages;