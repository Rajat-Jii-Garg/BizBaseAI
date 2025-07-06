
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Users, 
  MessageSquare, 
  Calendar, 
  Star,
  CheckCircle,
  X,
  Settings,
  Filter,
  MoreHorizontal,
  Eye,
  Archive,
  Trash2,
  UserPlus,
  Briefcase,
  TrendingUp,
  Award,
  Heart,
  Share2,
  Building2,
  Clock,
  Globe
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'connection',
      title: 'New Connection Request',
      message: 'Sarah Johnson wants to connect with you',
      avatar: '/api/placeholder/40/40',
      time: '2 minutes ago',
      isRead: false,
      actionable: true,
      category: 'networking'
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      message: 'Michael Chen sent you a message about the upcoming project',
      avatar: '/api/placeholder/40/40',
      time: '15 minutes ago',
      isRead: false,
      actionable: true,
      category: 'communication'
    },
    {
      id: 3,
      type: 'event',
      title: 'Event Reminder',
      message: 'Global Business Summit starts in 2 days',
      avatar: '/api/placeholder/40/40',
      time: '1 hour ago',
      isRead: true,
      actionable: false,
      category: 'events'
    },
    {
      id: 4,
      type: 'endorsement',
      title: 'Skill Endorsement',
      message: 'Emily Rodriguez endorsed you for Project Management',
      avatar: '/api/placeholder/40/40',
      time: '3 hours ago',
      isRead: false,
      actionable: false,
      category: 'professional'
    },
    {
      id: 5,
      type: 'achievement',
      title: 'Achievement Unlocked',
      message: 'Congratulations! You\'ve reached 1000 profile views',
      avatar: '/api/placeholder/40/40',
      time: '5 hours ago',
      isRead: true,
      actionable: false,
      category: 'achievements'
    },
    {
      id: 6,
      type: 'business',
      title: 'Business Opportunity',
      message: 'New business lead matches your criteria',
      avatar: '/api/placeholder/40/40',
      time: '1 day ago',
      isRead: false,
      actionable: true,
      category: 'business'
    },
    {
      id: 7,
      type: 'system',
      title: 'Profile Update',
      message: 'Your profile has been viewed 50 times this week',
      avatar: '/api/placeholder/40/40',
      time: '2 days ago',
      isRead: true,
      actionable: false,
      category: 'system'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'endorsement':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-orange-500" />;
      case 'business':
        return <Briefcase className="w-5 h-5 text-indigo-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'connections':
        return notifications.filter(n => n.category === 'networking');
      case 'business':
        return notifications.filter(n => n.category === 'business');
      default:
        return notifications;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Bell className="w-8 h-8 mr-3" />
                Notifications
              </h1>
              <p className="text-indigo-100">Stay updated with your professional activities</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Badge className="bg-white/20 text-white border-white/30">
                {unreadCount} Unread
              </Badge>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="justify-start h-auto p-4">
            <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
            <div className="text-left">
              <div className="font-semibold">Mark All Read</div>
              <div className="text-xs text-gray-500">{unreadCount} unread</div>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto p-4">
            <Archive className="w-5 h-5 mr-3 text-blue-500" />
            <div className="text-left">
              <div className="font-semibold">Archive Old</div>
              <div className="text-xs text-gray-500">Clean up</div>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto p-4">
            <Filter className="w-5 h-5 mr-3 text-purple-500" />
            <div className="text-left">
              <div className="font-semibold">Filter</div>
              <div className="text-xs text-gray-500">Customize view</div>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto p-4">
            <Settings className="w-5 h-5 mr-3 text-gray-500" />
            <div className="text-left">
              <div className="font-semibold">Preferences</div>
              <div className="text-xs text-gray-500">Manage alerts</div>
            </div>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {getFilteredNotifications().map((notification) => (
              <Card key={notification.id} className={`bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all ${!notification.isRead ? 'ring-2 ring-blue-200' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                            {notification.title.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {notification.time}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                            {!notification.isRead && (
                              <Badge className="bg-blue-500 text-white text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {notification.actionable && (
                            <div className="flex space-x-2">
                              {notification.type === 'connection' && (
                                <>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    Accept
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    Decline
                                  </Button>
                                </>
                              )}
                              {notification.type === 'message' && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  Reply
                                </Button>
                              )}
                              {notification.type === 'business' && (
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                  View Details
                                </Button>
                              )}
                            </div>
                          )}
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {getFilteredNotifications().map((notification) => (
              <Card key={notification.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg ring-2 ring-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                            {notification.title.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {notification.time}
                            </div>
                            <Badge className="bg-blue-500 text-white text-xs">
                              New
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            Mark Read
                          </Button>
                          <Button variant="ghost" size="icon">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            {getFilteredNotifications().map((notification) => (
              <Card key={notification.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={notification.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                        {notification.title.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <p className="text-gray-600 text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Connect
                      </Button>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            {getFilteredNotifications().map((notification) => (
              <Card key={notification.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <p className="text-gray-600 text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        View Opportunity
                      </Button>
                      <Button size="sm" variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Notification Preferences */}
        <Card className="bg-gradient-to-r from-gray-600 via-slate-600 to-gray-700 text-white border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <Settings className="w-12 h-12 mx-auto mb-4 text-white/90" />
              <h2 className="text-2xl font-bold mb-3">Notification Preferences</h2>
              <p className="text-gray-200 mb-6">
                Customize how and when you receive notifications
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Push Notifications
                </Button>
                
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Email Alerts
                </Button>

                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Frequency Settings
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
