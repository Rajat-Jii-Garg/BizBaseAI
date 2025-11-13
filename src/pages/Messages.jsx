
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
  
  // Call states
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [callState, setCallState] = useState('idle'); // 'idle', 'calling', 'incoming', 'active'
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const webrtcManagerRef = useRef(null);
  const incomingCallChannel = useRef(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      setupIncomingCallListener();
    }
    
    return () => {
      if (incomingCallChannel.current) {
        supabase.removeChannel(incomingCallChannel.current);
      }
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.cleanup();
      }
    };
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      
      // Set up real-time subscription for new messages
      const channel = supabase
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
            setMessages(prev => [...prev, payload.new]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupIncomingCallListener = () => {
    if (!user) return;
    
    incomingCallChannel.current = supabase
      .channel(`user-calls-${user.id}`)
      .on('broadcast', { event: 'incoming-call' }, async ({ payload }) => {
        if (payload.from !== user.id && selectedConversation) {
          const otherParticipant = getOtherParticipant(selectedConversation);
          if (payload.from === otherParticipant.id) {
            setCallType(payload.callType);
            setCallState('incoming');
            setIsCallModalOpen(true);
            
            // Initialize WebRTC and accept call
            await handleAcceptCall(payload.callType);
          }
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

      // Notify other user
      const otherParticipant = getOtherParticipant(selectedConversation);
      await supabase.channel(`user-calls-${otherParticipant.id}`).send({
        type: 'broadcast',
        event: 'incoming-call',
        payload: {
          from: user.id,
          callType: type,
          conversationId: selectedConversation.id
        }
      });

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

  const handleAcceptCall = async (type) => {
    try {
      setCallState('connecting');
      
      // Initialize WebRTC manager if not already done
      if (!webrtcManagerRef.current) {
        webrtcManagerRef.current = new WebRTCManager(user.id, selectedConversation.id);
        await webrtcManagerRef.current.initializeSignaling();
      }

      // Set up callbacks
      webrtcManagerRef.current.onRemoteStream = (stream) => {
        setRemoteStream(stream);
        setCallState('active');
      };

      webrtcManagerRef.current.onCallEnded = () => {
        handleEndCall();
      };
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

  const handleEndCall = async () => {
    if (webrtcManagerRef.current) {
      await webrtcManagerRef.current.endCall();
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
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
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
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const otherParticipant = getOtherParticipant(selectedConversation);
    const receiverId = otherParticipant.id;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          receiver_id: receiverId,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
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
        .single();

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
      <div className="h-full flex bg-background">
        {/* Conversations Sidebar */}
        <Card className="w-80 h-full rounded-none border-r border-l-0 border-t-0 border-b-0 card-professional">
          <CardHeader className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-xl font-semibold gradient-text-primary">Messages</CardTitle>
              <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="btn-professional">
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 input-focus"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                return (
                  <div
                    key={conversation.id}
                    className={`p-4 rounded-xl cursor-pointer hover-lift transition-all duration-300 m-2 ${
                      selectedConversation?.id === conversation.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherParticipant?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {otherParticipant?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-foreground">
                          {otherParticipant?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          Last message preview...
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2:30 PM
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No conversations found</p>
                  <p className="text-sm">Start a new conversation</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Card className="rounded-none border-l-0 border-r-0 border-t-0 card-professional">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getOtherParticipant(selectedConversation)?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">
                        {getOtherParticipant(selectedConversation)?.full_name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                        Online
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover-lift"
                      onClick={() => initiateCall('audio')}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover-lift"
                      onClick={() => initiateCall('video')}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hover-lift">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Messages */}
              <ScrollArea className="flex-1 p-6 bg-muted/20">
                <div className="space-y-6 max-w-4xl mx-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No messages yet</p>
                      <p className="text-sm">Start the conversation by sending a message</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl shadow-sm hover-lift ${
                            message.sender_id === user.id
                              ? 'bg-primary text-primary-foreground ml-12'
                              : 'bg-card border mr-12'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-2 ${
                            message.sender_id === user.id 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <Card className="rounded-none border-l-0 border-r-0 border-b-0 card-professional">
                <div className="p-6">
                  <div className="flex items-center space-x-3 bg-muted/50 rounded-2xl p-3">
                    <Button variant="ghost" size="sm" className="hover-lift">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage();
                        }
                      }}
                    />
                    <Button variant="ghost" size="sm" className="hover-lift">
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim()}
                      className="btn-professional px-6"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="mb-6 relative">
                  <MessageCircle className="h-24 w-24 mx-auto text-muted-foreground/30 animate-float" />
                </div>
                <h3 className="text-2xl font-bold mb-3 gradient-text-primary">Select a conversation</h3>
                <p className="text-muted-foreground text-lg">
                  Choose a conversation from the sidebar to start messaging
                </p>
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
