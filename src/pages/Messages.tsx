
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Send, 
  Phone, 
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Star,
  Archive,
  Trash2,
  Settings,
  Filter,
  Users,
  Clock,
  CheckCircle,
  Circle,
  Edit
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Product Manager",
      company: "TechCorp Solutions",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Thanks for the great discussion about the new project requirements. Looking forward to our collaboration!",
      time: "2 min ago",
      unreadCount: 2,
      isOnline: true,
      isStarred: false
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Digital Marketing Director",
      company: "Growth Ventures",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Could you share the marketing strategy document we discussed yesterday?",
      time: "15 min ago",
      unreadCount: 0,
      isOnline: true,
      isStarred: true
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "Business Development Lead",
      company: "InnovateLab",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Perfect! Let's schedule a call for next week to discuss the partnership details.",
      time: "1 hour ago",
      unreadCount: 1,
      isOnline: false,
      isStarred: false
    },
    {
      id: 4,
      name: "David Kim",
      title: "Software Engineer",
      company: "DevTech Inc",
      avatar: "/api/placeholder/40/40",
      lastMessage: "The technical documentation looks great. I've added some suggestions in the comments.",
      time: "3 hours ago",
      unreadCount: 0,
      isOnline: false,
      isStarred: false
    },
    {
      id: 5,
      name: "Lisa Thompson",
      title: "Finance Manager",
      company: "Capital Group",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Can we discuss the budget allocation for Q2? I have some concerns about the projections.",
      time: "1 day ago",
      unreadCount: 3,
      isOnline: true,
      isStarred: true
    }
  ];

  const messages = [
    {
      id: 1,
      senderId: 1,
      senderName: "Sarah Johnson",
      content: "Hi! I hope you're doing well. I wanted to follow up on our discussion about the new project requirements.",
      time: "10:30 AM",
      isOwn: false,
      status: "delivered"
    },
    {
      id: 2,
      senderId: 'me',
      senderName: "You",
      content: "Hello Sarah! Yes, I've been reviewing the requirements document. I think we have a solid foundation to work with.",
      time: "10:32 AM",
      isOwn: true,
      status: "read"
    },
    {
      id: 3,
      senderId: 1,
      senderName: "Sarah Johnson",
      content: "That's great to hear! Do you think we could schedule a meeting this week to dive deeper into the technical specifications?",
      time: "10:35 AM",
      isOwn: false,
      status: "delivered"
    },
    {
      id: 4,
      senderId: 'me',
      senderName: "You",
      content: "Absolutely! I'm available Thursday or Friday afternoon. Which works better for your schedule?",
      time: "10:37 AM",
      isOwn: true,
      status: "read"
    },
    {
      id: 5,
      senderId: 1,
      senderName: "Sarah Johnson",
      content: "Friday afternoon would be perfect! Let's say 2:00 PM? I'll send you a calendar invite with the meeting details.",
      time: "10:40 AM",
      isOwn: false,
      status: "delivered"
    },
    {
      id: 6,
      senderId: 'me',
      senderName: "You",
      content: "Perfect! Looking forward to it. I'll prepare some initial mockups to share during our meeting.",
      time: "10:42 AM",
      isOwn: true,
      status: "delivered"
    },
    {
      id: 7,
      senderId: 1,
      senderName: "Sarah Johnson",
      content: "Thanks for the great discussion about the new project requirements. Looking forward to our collaboration!",
      time: "2 min ago",
      isOwn: false,
      status: "delivered"
    }
  ];

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);
  
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // TODO: Implement message sending
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-200px)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <MessageSquare className="w-8 h-8 mr-3" />
                Professional Messages
              </h1>
              <p className="text-green-100">Connect and collaborate with your professional network</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Badge className="bg-white/20 text-white border-white/30">
                {totalUnread} Unread
              </Badge>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto">
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedChat(conversation.id)}
                      className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedChat === conversation.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                              {conversation.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-sm text-gray-900 truncate">
                                {conversation.name}
                              </h3>
                              {conversation.isStarred && (
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">{conversation.time}</span>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-blue-500 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500 mb-1">{conversation.title} • {conversation.company}</p>
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedConversation.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                            {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedConversation.name}</h3>
                        <p className="text-sm text-gray-600">{selectedConversation.title}</p>
                        <p className="text-xs text-gray-500">
                          {selectedConversation.isOnline ? 'Online now' : 'Last seen 2 hours ago'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Star className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwn 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-between mt-1 ${
                          message.isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{message.time}</span>
                          {message.isOwn && (
                            <div className="ml-2">
                              {message.status === 'read' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Circle className="w-3 h-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        type="text"
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="pr-10"
                      />
                      <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
