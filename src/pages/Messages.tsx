
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Search, 
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Star,
  Archive,
  Trash2,
  Edit,
  Image,
  FileText,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Circle,
  Pin,
  VolumeX,
  Plus,
  Filter
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Marketing Manager",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Thanks for sharing those insights! Let's schedule a call to discuss the collaboration opportunity.",
      time: "2 min ago",
      unread: 2,
      online: true,
      pinned: true,
      type: "direct"
    },
    {
      id: 2,
      name: "Project Alpha Team",
      title: "5 members",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Michael: The latest updates look great! When can we schedule the next review?",
      time: "15 min ago",
      unread: 0,
      online: false,
      pinned: false,
      type: "group"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "Business Development Executive",
      avatar: "/api/placeholder/40/40",
      lastMessage: "I have some exciting partnership opportunities to discuss with you.",
      time: "1 hour ago",
      unread: 1,
      online: true,
      pinned: false,
      type: "direct"
    },
    {
      id: 4,
      name: "David Park",
      title: "Product Manager",
      avatar: "/api/placeholder/40/40",
      lastMessage: "The product roadmap looks fantastic! Great work on the timeline.",
      time: "3 hours ago",
      unread: 0,
      online: false,
      pinned: false,
      type: "direct"
    },
    {
      id: 5,
      name: "Marketing Strategy Group",
      title: "12 members",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Jennifer: Let's align on the Q2 campaign strategy. I'll send the brief shortly.",
      time: "1 day ago",
      unread: 3,
      online: false,
      pinned: true,
      type: "group"
    },
    {
      id: 6,
      name: "Alex Thompson",
      title: "Data Scientist",
      avatar: "/api/placeholder/40/40",
      lastMessage: "The analytics dashboard is ready for review. Can you check it out?",
      time: "2 days ago",
      unread: 0,
      online: false,
      pinned: false,
      type: "direct"
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "Sarah Johnson",
      avatar: "/api/placeholder/32/32",
      content: "Hi! I saw your post about digital marketing trends. Really insightful content!",
      time: "10:30 AM",
      isOwn: false,
      read: true,
      type: "text"
    },
    {
      id: 2,
      sender: "You",
      avatar: "/api/placeholder/32/32",
      content: "Thank you! I'm glad you found it helpful. Are you working on any similar projects?",
      time: "10:32 AM",
      isOwn: true,
      read: true,
      type: "text"
    },
    {
      id: 3,
      sender: "Sarah Johnson",
      avatar: "/api/placeholder/32/32",
      content: "Actually, yes! We're planning a major campaign for Q2. I'd love to get your thoughts on our strategy.",
      time: "10:35 AM",
      isOwn: false,
      read: true,
      type: "text"
    },
    {
      id: 4,
      sender: "Sarah Johnson",
      avatar: "/api/placeholder/32/32",
      content: "I can share some preliminary ideas if you're interested in collaborating.",
      time: "10:36 AM",
      isOwn: false,
      read: true,
      type: "text"
    },
    {
      id: 5,
      sender: "You",
      avatar: "/api/placeholder/32/32",
      content: "That sounds exciting! I'd be happy to take a look and share my insights.",
      time: "10:40 AM",
      isOwn: true,
      read: true,
      type: "text"
    },
    {
      id: 6,
      sender: "Sarah Johnson",
      avatar: "/api/placeholder/32/32",
      content: "Perfect! Let me send you the brief and we can schedule a call to discuss it in detail.",
      time: "10:42 AM",
      isOwn: false,
      read: true,
      type: "text"
    },
    {
      id: 7,
      sender: "Sarah Johnson",
      avatar: "/api/placeholder/32/32",
      content: "Thanks for sharing those insights! Let's schedule a call to discuss the collaboration opportunity.",
      time: "2 min ago",
      isOwn: false,
      read: false,
      type: "text"
    }
  ];

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      // TODO: Implement send message functionality
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-200px)] max-h-[800px]">
        <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
                    Messages
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Search */}
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
              </div>

              {/* Stats */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Chats</p>
                    <p className="text-lg font-bold text-blue-600">{conversations.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unread</p>
                    <p className="text-lg font-bold text-red-600">{totalUnread}</p>
                  </div>
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat === conversation.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                    }`}
                    onClick={() => setSelectedChat(conversation.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                            {conversation.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.name}
                            </h3>
                            {conversation.pinned && (
                              <Pin className="w-3 h-3 text-gray-500" />
                            )}
                            {conversation.type === 'group' && (
                              <Users className="w-3 h-3 text-gray-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {conversation.unread > 0 && (
                              <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                                {conversation.unread}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">{conversation.time}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">{conversation.title}</p>
                        <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={selectedConversation.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                              {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {selectedConversation.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        
                        <div>
                          <h2 className="font-bold text-gray-900 flex items-center">
                            {selectedConversation.name}
                            {selectedConversation.type === 'group' && (
                              <Users className="w-4 h-4 ml-2 text-gray-500" />
                            )}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {selectedConversation.online ? 'Online now' : selectedConversation.title}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.isOwn ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        {!message.isOwn && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-gray-100 to-blue-100 text-gray-700 font-semibold text-xs">
                              {message.sender.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-[70%] ${message.isOwn ? 'text-right' : ''}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              message.isOwn
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          
                          <div className={`flex items-center mt-1 text-xs text-gray-500 ${
                            message.isOwn ? 'justify-end' : ''
                          }`}>
                            <span>{message.time}</span>
                            {message.isOwn && (
                              <div className="ml-2">
                                {message.read ? (
                                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                ) : (
                                  <Circle className="w-3 h-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-200 bg-white">
                    <div className="flex items-end space-x-4">
                      <div className="flex-1">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your message..."
                          className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Image className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Smile className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50/50">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
