
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Plus,
  MessageSquare,
  Users,
  Clock,
  CheckCheck,
  Paperclip,
  Smile,
  Online
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_name?: string;
  sender_avatar?: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  userId: string;
}

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
      setupRealTimeMessages();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  const setupRealTimeMessages = () => {
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.receiver_id === user?.id || newMessage.sender_id === user?.id) {
            setMessages(prev => [...prev, newMessage]);
            fetchConversations(); // Refresh conversations to update last message
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchConversations = async () => {
    try {
      // Get all connections of the current user
      const { data: connections, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          requester_id,
          addressee_id,
          profiles!connections_requester_id_fkey(id, full_name, avatar_url),
          addressee_profile:profiles!connections_addressee_id_fkey(id, full_name, avatar_url)
        `)
        .or(`requester_id.eq.${user?.id},addressee_id.eq.${user?.id}`)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;

      // Create conversations from connections
      const conversationsList: Conversation[] = [];
      
      for (const connection of connections || []) {
        const otherUser = connection.requester_id === user?.id 
          ? connection.addressee_profile 
          : connection.profiles;
        
        if (otherUser) {
          // Get last message with this user
          const { data: lastMessages } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${user?.id})`)
            .order('created_at', { ascending: false })
            .limit(1);

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', otherUser.id)
            .eq('receiver_id', user?.id)
            .eq('read', false);

          const lastMessage = lastMessages?.[0];
          
          conversationsList.push({
            id: otherUser.id,
            name: otherUser.full_name || 'Unknown User',
            avatar: otherUser.avatar_url || '',
            lastMessage: lastMessage?.content || 'Start a conversation',
            timestamp: lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            unread: unreadCount || 0,
            online: Math.random() > 0.5, // Simulate online status
            userId: otherUser.id
          });
        }
      }

      setConversations(conversationsList);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data?.map(msg => ({
        ...msg,
        sender_name: msg.sender?.full_name,
        sender_avatar: msg.sender?.avatar_url
      })) || [];

      setMessages(formattedMessages);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', userId)
        .eq('receiver_id', user?.id)
        .eq('read', false);

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedChat,
          content: messageText.trim(),
          read: false
        });

      if (error) throw error;

      setMessageText('');
      
      toast({
        title: "Message Sent",
        description: "Your message has been delivered successfully"
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
          {/* Conversations List */}
          <div className="lg:col-span-4">
            <Card className="h-full bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Messages
                  </CardTitle>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading conversations...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No conversations yet</p>
                    <p className="text-gray-400 text-sm">Connect with professionals to start messaging</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedChat(conversation.id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                          selectedChat === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={conversation.avatar} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                                {conversation.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {conversation.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {conversation.timestamp}
                                </span>
                                {conversation.unread > 0 && (
                                  <Badge className="bg-blue-600 text-white rounded-full px-2 py-1 text-xs">
                                    {conversation.unread}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-8">
            <Card className="h-full bg-white shadow-lg border-0 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedConversation.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                              {selectedConversation.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {selectedConversation.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {selectedConversation.name}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            {selectedConversation.online ? (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Online
                              </>
                            ) : (
                              'Last seen 2 hours ago'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className={`text-xs ${
                                message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {new Date(message.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {message.sender_id === user?.id && (
                                <CheckCheck className="w-3 h-3 text-blue-100 ml-2" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Type a message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSendMessage();
                            }
                          }}
                          className="pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >
                          <Smile className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-600">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
