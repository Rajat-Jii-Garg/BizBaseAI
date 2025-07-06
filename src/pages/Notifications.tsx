import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Search, 
  Filter,
  MessageSquare,
  UserPlus,
  Star,
  Calendar,
  Eye,
  Heart,
  Share2,
  Settings,
  CheckCircle,
  X,
  Trash2,
  Mail,
  AlertCircle,
  Info,
  TrendingUp,
  Award,
  Briefcase,
  Users,
  Building2,
  Globe,
  Zap,
  Clock,
  ChevronRight
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const Notifications = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'connection',
      title: 'New Connection Request',
      message: 'Sarah Johnson wants to connect with you',
      avatar: '/api/placeholder/40/40',
      time: '2 minutes ago',
      read: false,
      priority: 'high',
      action: 'connection_request',
      actionData: { userId: 123, name: 'Sarah Johnson' }
    },
    {
      id: 2,
      type: 'like',
      title: 'Post Engagement',
      message: 'Michael Chen and 15 others liked your post about "Digital Marketing Trends"',
      avatar: '/api/placeholder/40/40',
      time: '1 hour ago',
      read: false,
      priority: 'medium',
      action: 'view_post',
      actionData: { postId: 456 }
    },
    {
      id: 3,
      type: 'event',
      title: 'Event Reminder',
      message: 'Global Business Leaders Summit starts in 2 days',
      avatar: '/api/placeholder/40/40',
      time: '3 hours ago',
      read: true,
      priority: 'high',
      action: 'view_event',
      actionData: { eventId: 789 }
    },
    {
      id: 4,
      type: 'message',
      title: 'New Message',
      message: 'Emily Rodriguez sent you a message about collaboration opportunities',
      avatar: '/api/placeholder/40/40',
      time: '5 hours ago',
      read: false,
      priority: 'medium',
      action: 'view_message',
      actionData: { messageId: 321 }
    },
    {
      id: 5,
      type: 'achievement',
      title: 'Achievement Unlocked',
      message: 'Congratulations! You\'ve reached 1,000 profile views this month',
      avatar: '/api/placeholder/40/40',
      time: '1 day ago',
      read: true,
      priority: 'low',
      action: 'view_profile',
      actionData: {}
    },
    {
      id: 6,
      type: 'business',
      title: 'Business Opportunity',
      message: 'New lead generated from your business profile',
      avatar: '/api/placeholder/40/40',
      time: '2 days ago',
      read: false,
      priority: 'high',
      action: 'view_lead',
      actionData: { leadId: 654 }
    },
    {
      id: 7,
      type: 'system',
      title: 'Security Alert',
      message: 'New login detected from Chrome on Windows',
      avatar: '/api/placeholder/40/40',
      time: '3 days ago',
      read: true,
      priority: 'medium',
      action: 'security_settings',
      actionData: {}
    },
    {
      id: 8,
      type: 'collaboration',
      title: 'Project Invitation',
      message: 'David Park invited you to collaborate on "AI Marketing Strategy" project',
      avatar: '/api/placeholder/40/40',
      time: '1 week ago',
      read: true,
      priority: 'medium',
      action: 'view_project',
      actionData: { projectId: 987 }
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection': return UserPlus;
      case 'like': return Heart;
      case 'event': return Calendar;
      case 'message': return MessageSquare;
      case 'achievement': return Award;
      case 'business': return Briefcase;
      case 'system': return AlertCircle;
      case 'collaboration': return Users;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'connection': return 'text-blue-600 bg-blue-100';
      case 'like': return 'text-red-600 bg-red-100';
      case 'event': return 'text-purple-600 bg-purple-100';
      case 'message': return 'text-green-600 bg-green-100';
      case 'achievement': return 'text-yellow-600 bg-yellow-100';
      case 'business': return 'text-orange-600 bg-orange-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      case 'collaboration': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-100 text-red-600 border-red-200">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-600 border-yellow-200">Medium</Badge>;
      case 'low': return <Badge className="bg-green-100 text-green-600 border-green-200">Low</Badge>;
      default: return null;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case 'unread': return !notification.read && matchesSearch;
      case 'important': return notification.priority === 'high' && matchesSearch;
      case 'business': return notification.type === 'business' && matchesSearch;
      default: return matchesSearch;
    }
  });

  const handleMarkAsRead = (id: number) => {
    console.log('Marking as read:', id);
    // TODO: Implement mark as read functionality
  };

  const handleMarkAsUnread = (id: number) => {
    console.log('Marking as unread:', id);
    // TODO: Implement mark as unread functionality
  };

  const handleDelete = (id: number) => {
    console.log('Deleting notification:', id);
    // TODO: Implement delete notification functionality
  };

  const handleNotificationAction = (notification: any) => {
    console.log('Notification action:', notification.action, notification.actionData);
    // TODO: Implement specific actions based on notification type
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const importantCount = notifications.filter(n => n.priority === 'high').length;
  const businessCount = notifications.filter(n => n.type === 'business').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Bell className="w-8 h-8 mr-3" />
                Notifications Center
              </h1>
              <p className="text-purple-100">Stay updated with your professional activities and opportunities</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 border-white/30 text-white placeholder-white/70 rounded-full focus:bg-white/30"
            />
          </div>
        </div>

        {/* Notification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Important</p>
                  <p className="text-2xl font-bold text-orange-600">{importantCount}</p>
                </div>
                <Star className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Business</p>
                  <p className="text-2xl font-bold text-green-600">{businessCount}</p>
                </div>
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="important">Important ({importantCount})</TabsTrigger>
            <TabsTrigger value="business">Business ({businessCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications Found</h3>
                <p className="text-gray-600">Try adjusting your search or filters.</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const colorClasses = getNotificationColor(notification.type);
                
                return (
                  <Card 
                    key={notification.id} 
                    className={`bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer ${
                      !notification.read ? 'border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleNotificationAction(notification)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-2 rounded-full ${colorClasses}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                {getPriorityBadge(notification.priority)}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            
                            <p className={`text-sm mb-3 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {notification.time}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {!notification.read ? (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Mark Read
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsUnread(notification.id);
                                    }}
                                  >
                                    <Mail className="w-4 h-4 mr-1" />
                                    Mark Unread
                                  </Button>
                                )}
                                
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notification.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">You have no unread notifications.</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const colorClasses = getNotificationColor(notification.type);
                
                return (
                  <Card 
                    key={notification.id} 
                    className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-l-4 border-l-blue-500"
                    onClick={() => handleNotificationAction(notification)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-2 rounded-full ${colorClasses}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                {getPriorityBadge(notification.priority)}
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-3">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {notification.time}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Mark Read
                                </Button>
                                
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="important" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Important Notifications</h3>
                <p className="text-gray-600">You have no high-priority notifications at the moment.</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const colorClasses = getNotificationColor(notification.type);
                
                return (
                  <Card 
                    key={notification.id} 
                    className={`bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-l-4 border-l-red-500 ${
                      !notification.read ? 'ring-2 ring-red-200' : ''
                    }`}
                    onClick={() => handleNotificationAction(notification)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-2 rounded-full ${colorClasses}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-red-100 text-red-600 border-red-200">High Priority</Badge>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            
                            <p className={`text-sm mb-3 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {notification.time}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {!notification.read && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Mark Read
                                  </Button>
                                )}
                                
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Business Notifications</h3>
                <p className="text-gray-600">You have no business-related notifications.</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const colorClasses = getNotificationColor(notification.type);
                
                return (
                  <Card 
                    key={notification.id} 
                    className={`bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer ${
                      !notification.read ? 'border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleNotificationAction(notification)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-2 rounded-full ${colorClasses}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-green-100 text-green-600 border-green-200">Business</Badge>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            
                            <p className={`text-sm mb-3 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {notification.time}
                              </div>
                              
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 text-white/90" />
              <h2 className="text-2xl font-bold mb-3">Stay Connected & Informed</h2>
              <p className="text-white/90 mb-6">
                Manage your notification preferences and stay updated with what matters most
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Notification Settings
                </Button>
                
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark All as Read
                </Button>

                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Options
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
