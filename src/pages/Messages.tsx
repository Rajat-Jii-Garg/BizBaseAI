
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
  Smile
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

const Messages = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const mockConversations = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '/placeholder.svg',
      lastMessage: 'Thanks for the connection! Looking forward to collaborating.',
      timestamp: '2 mins ago',
      unread: 2,
      online: true,
      messages: [
        { id: '1', sender: 'Sarah Johnson', text: 'Hi! Thanks for connecting with me.', timestamp: '10:30 AM', isOwn: false },
        { id: '2', sender: 'You', text: 'Great to connect! I saw your work on AI projects.', timestamp: '10:32 AM', isOwn: true },
        { id: '3', sender: 'Sarah Johnson', text: 'Thanks for the connection! Looking forward to collaborating.', timestamp: '10:35 AM', isOwn: false }
      ]
    },
    {
      id: '2',
      name: 'Marketing Team',
      avatar: '/placeholder.svg',
      lastMessage: 'Meeting scheduled for tomorrow at 3 PM',
      timestamp: '1 hour ago',
      unread: 0,
      online: false,
      isGroup: true,
      messages: [
        { id: '1', sender: 'Alex', text: 'Can we schedule the marketing review?', timestamp: '9:15 AM', isOwn: false },
        { id: '2', sender: 'You', text: 'Sure! What time works for everyone?', timestamp: '9:16 AM', isOwn: true },
        { id: '3', sender: 'Marketing Team', text: 'Meeting scheduled for tomorrow at 3 PM', timestamp: '9:20 AM', isOwn: false }
      ]
    },
    {
      id: '3',
      name: 'David Chen',
      avatar: '/placeholder.svg',
      lastMessage: 'The proposal looks good to me',
      timestamp: '3 hours ago',
      unread: 0,
      online: true,
      messages: [
        { id: '1', sender: 'David Chen', text: 'Hi, I reviewed your proposal.', timestamp: '7:30 AM', isOwn: false },
        { id: '2', sender: 'You', text: 'Thanks! What are your thoughts?', timestamp: '7:32 AM', isOwn: true },
        { id: '3', sender: 'David Chen', text: 'The proposal looks good to me', timestamp: '7:35 AM', isOwn: false }
      ]
    }
  ];

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat) {
      // Add message sending logic here
      setMessageText('');
    }
  };

  const selectedConversation = mockConversations.find(conv => conv.id === selectedChat);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
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
              <CardContent className="p-0">
                <div className="space-y-1">
                  {mockConversations.map((conversation) => (
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
                            <AvatarFallback>
                              {conversation.isGroup ? (
                                <Users className="w-6 h-6" />
                              ) : (
                                conversation.name.charAt(0)
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.online && !conversation.isGroup && (
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
                            <AvatarFallback>
                              {selectedConversation.isGroup ? (
                                <Users className="w-5 h-5" />
                              ) : (
                                selectedConversation.name.charAt(0)
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {selectedConversation.online && !selectedConversation.isGroup && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {selectedConversation.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {selectedConversation.online ? 'Online' : 'Last seen 2 hours ago'}
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
                      {selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.isOwn
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {!message.isOwn && (
                              <p className="text-xs font-medium mb-1">{message.sender}</p>
                            )}
                            <p className="text-sm">{message.text}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className={`text-xs ${
                                message.isOwn ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {message.timestamp}
                              </span>
                              {message.isOwn && (
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
