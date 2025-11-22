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
  
  // UI states
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);


  useEffect(() => {
    if (user) {
      fetchConversations();
      setupCallListener();
      setupConversationsRealtime();
    }
    
    return () => {
      if (callChannelRef.current) {
        supabase.removeChannel(callChannelRef.current);
      }
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.cleanup();
      }
    };
  }, [user]);

  // Real-time subscription for all conversations and messages
  const setupConversationsRealtime = () => {
    if (!user) return;
    
    // Listen for new conversations
    const conversationsChannel = supabase
      .channel('user-conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `or(participant1_id.eq.${user.id},participant2_id.eq.${user.id})`
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `or(participant1_id.eq.${user.id},participant2_id.eq.${user.id})`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();
    
    // Listen for all messages to update conversation list
    const allMessagesChannel = supabase
      .channel('all-user-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
        },
        (payload) => {
          fetchConversations();
          
          // If message is for currently selected conversation, add it to messages
          if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
            setMessages(prev => {
              if (prev.some(m => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
            scrollToBottom();
          } else if (payload.new.receiver_id === user.id) {
            // Update unread count if message belongs to another conversation -
            setUnreadCounts(prev => ({
              ...prev,
              [payload.new.conversation_id]: (prev[payload.new.conversation_id] || 0) + 1
            }));

            // Show notification for new message
            toast({
              title: "New Message",
              description: payload.new.content.substring(0, 50) + (payload.new.content.length > 50 ? '...' : ''),
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(allMessagesChannel);
    };
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markMessagesAsRead(selectedConversation.id);
      
      // Set up real-time subscription for messages
      const messagesChannel = supabase
        .channel(`messages:${selectedConversation.id}`)
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
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupCallListener = () => {
    if (!user) return;
    
    callChannelRef.current = supabase
      .channel(`user-calls-${user.id}`)
      .on('broadcast', { event: 'incoming-call' }, async ({ payload }) => {
        if (payload.from === user.id) return;
        
        const { data: conversation } = await supabase
          .from('conversations')
          .select(`
            *,
            participant1:profiles!conversations_participant1_id_fkey(id, full_name, avatar_url),
            participant2:profiles!conversations_participant2_id_fkey(id, full_name, avatar_url)
          `)
          .eq('id', payload.conversationId)
          .single();
        
        if (conversation) {
          setSelectedConversation(conversation);
          setCallType(payload.callType);
          setCallState('incoming');
          setIsCallModalOpen(true);
        }
      })
      .on('broadcast', { event: 'call-accepted' }, async ({ payload }) => {
        if (payload.to === user.id && callState === 'calling') {
          setCallState('connecting');
        }
      })
      .on('broadcast', { event: 'call-rejected' }, ({ payload }) => {
        if (payload.to === user.id) {
          toast({
            title: "Call Declined",
            description: "The user declined your call",
            variant: "destructive"
          });
          handleEndCall();
        }
      })
      .on('broadcast', { event: 'call-ended' }, ({ payload }) => {
        if (payload.to === user.id || payload.from === user.id) {
          handleEndCall();
        }
      })
      .subscribe();
  };

  const initiateCall = async (type) => {
    if (!selectedConversation) return;
    
    try {
      setCallType(type);
      setCallState('calling');
      setIsCallModalOpen(true);

      // Initialize WebRTC manager
      webrtcManagerRef.current = new WebRTCManager(user.id, selectedConversation.id);
      await webrtcManagerRef.current.initializeSignaling();

      // Set up callbacks
      webrtcManagerRef.current.onRemoteStream = (stream) => {
        setRemoteStream(stream);
        setCallState('active');
      };

      webrtcManagerRef.current.onCallEnded = () => {
        handleEndCall();
      };

      // Start call
      const stream = await webrtcManagerRef.current.startCall(type === 'video');
      setLocalStream(stream);

      // Notify other user via broadcast
      const otherParticipant = getOtherParticipant(selectedConversation);
      
      if (callChannelRef.current) {
      await callChannelRef.current.send({
        type: "broadcast",
        event: "incoming-call",
        payload: {
          from: user.id,
          callType: type,
          conversationId: selectedConversation.id
        }
      });
    }

      toast({
        title: "Calling...",
        description: `${type === 'video' ? 'Video' : 'Voice'} call initiated`
      });
    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start call",
        variant: "destructive"
      });
      handleEndCall();
    }
  };

  const handleAcceptCall = async (type, conversation = null) => {
    try {
      setCallState('connecting');
      
      const convToUse = conversation || selectedConversation;
      if (!convToUse) {
        throw new Error('No conversation found');
      }
      
      // Send accept signal
      const otherParticipant = getOtherParticipant(convToUse);
      if (callChannelRef.current) {
        await callChannelRef.current.send({
          type: 'broadcast',
          event: 'call-accepted',
          payload: {
            from: user.id,
            to: otherParticipant.id
          }
        });
      }
      
      // Initialize WebRTC
      webrtcManagerRef.current = new WebRTCManager(user.id, convToUse.id);
      await webrtcManagerRef.current.initializeSignaling();

      webrtcManagerRef.current.onRemoteStream = (stream) => {
        setRemoteStream(stream);
        setCallState('active');
      };

      webrtcManagerRef.current.onCallEnded = () => {
        handleEndCall();
      };
      
      const stream = await webrtcManagerRef.current.startCall(type === 'video');
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accepting call:', error);
      toast({
        title: "Error",
        description: "Failed to accept call",
        variant: "destructive"
      });
      handleEndCall();
    }
  };

  const handleDeclineCall = async () => {
    const otherParticipant = getOtherParticipant(selectedConversation);
    
    if (callChannelRef.current) {
      await callChannelRef.current.send({
        type: 'broadcast',
        event: 'call-rejected',
        payload: {
          from: user.id,
          to: otherParticipant.id
        }
      });
    }
    
    handleEndCall();
  };

  const handleEndCall = async () => {
    const otherParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;
    
    if (callChannelRef.current && otherParticipant) {
      await callChannelRef.current.send({
        type: 'broadcast',
        event: 'call-ended',
        payload: {
          from: user.id,
          to: otherParticipant.id
        }
      });
    }
    
    if (webrtcManagerRef.current) {
      await webrtcManagerRef.current.cleanup();
      webrtcManagerRef.current = null;
    }
    
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
      <div className="h-[calc(100vh-4rem)] flex bg-background">
        {/* Conversations Sidebar */}
        <Card className="w-80 flex flex-col h-full rounded-none border-r border-l-0 border-t-0 border-b-0 shadow-sm">
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
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
      />
    </DashboardLayout>
  );
};

export default Messages;
