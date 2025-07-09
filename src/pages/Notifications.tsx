
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Users, 
  Heart, 
  MessageSquare, 
  Share2, 
  UserPlus, 
  Briefcase,
  Calendar,
  Award,
  TrendingUp,
  Check,
  X,
  Settings,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

const Notifications = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'like',
      title: 'Sarah Johnson liked your post',
      description: 'Your post about AI trends received a like',
      timestamp: '2 minutes ago',
      read: false,
      avatar: '/placeholder.svg',
      icon: Heart,
      iconColor: 'text-red-500'
    },
    {
      id: '2',
      type: 'comment',
      title: 'David Chen commented on your post',
      description: 'Great insights on the future of remote work!',
      timestamp: '15 minutes ago',
      read: false,
      avatar: '/placeholder.svg',
      icon: MessageSquare,
      iconColor: 'text-blue-500'
    },
    {
      id: '3',
      type: 'connection',
      title: 'New connection request',
      description: 'Emily Rodriguez wants to connect with you',
      timestamp: '1 hour ago',
      read: false,
      avatar: '/placeholder.svg',
      icon: UserPlus,
      iconColor: 'text-green-500',
      actionable: true
    },
    {
      id: '4',
      type: 'share',
      title: 'Your post was shared',
      description: 'Alex Thompson shared your post about startup funding',
      timestamp: '2 hours ago',
      read: true,
      avatar: '/placeholder.svg',
      icon: Share2,
      iconColor: 'text-purple-500'
    },
    {
      id: '5',
      type: 'job',
      title: 'New job opportunity',
      description: 'Senior Developer position at Tech Corp matches your profile',
      timestamp: '3 hours ago',
      read: true,
      avatar: '/placeholder.svg',
      icon: Briefcase,
      iconColor: 'text-orange-500'
    },
    {
      id: '6',
      type: 'event',
      title: 'Event reminder',
      description: 'AI Conference 2024 starts in 2 days',
      timestamp: '5 hours ago',
      read: true,
      avatar: '/placeholder.svg',
      icon: Calendar,
      iconColor: 'text-indigo-500'
    },
    {
      id: '7',
      type: 'achievement',
      title: 'Profile milestone reached',
      description: 'Congratulations! You reached 500 connections',
      timestamp: '1 day ago',
      read: true,
      avatar: '/placeholder.svg',
      icon: Award,
      iconColor: 'text-yellow-500'
    },
    {
      id: '8',
      type: 'trending',
      title: 'Trending in your network',
      description: 'Machine Learning topic is trending among your connections',
      timestamp: '1 day ago',
      read: true,
      avatar: '/placeholder.svg',
      icon: TrendingUp,
      iconColor: 'text-green-600'
    }
  ]);

  const filterOptions = [
    { value: 'all', label: 'All Notifications', count: notifications.length },
    { value: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
    { value: 'connections', label: 'Connections', count: notifications.filter(n => n.type === 'connection').length },
    { value: 'engagement', label: 'Engagement', count: notifications.filter(n => ['like', 'comment', 'share'].includes(n.type)).length },
    { value: 'opportunities', label: 'Opportunities', count: notifications.filter(n => n.type === 'job').length }
  ];

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'connections':
        return notification.type === 'connection';
      case 'engagement':
        return ['like', 'comment', 'share'].includes(notification.type);
      case 'opportunities':
        return notification.type === 'job';
      default:
        return true;
    }
  });

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleAcceptConnection = (id: string) => {
    // Handle connection acceptance
    handleMarkAsRead(id);
  };

  const handleRejectConnection = (id: string) => {
    // Handle connection rejection
    handleMarkAsRead(id);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-600" />
                Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge className="bg-red-500 text-white ml-2">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={notifications.filter(n => !n.read).length === 0}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filter Tabs */}
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(option.value)}
                  className="flex items-center gap-2"
                >
                  {option.label}
                  {option.count > 0 && (
                    <Badge 
                      variant={filter === option.value ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {option.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600">
                    {filter === 'all' 
                      ? "You're all caught up! No new notifications."
                      : `No ${filter} notifications at the moment.`
                    }
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback>
                            <notification.icon className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                          <notification.icon className={`w-3 h-3 ${notification.iconColor}`} />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.timestamp}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                            
                            {notification.actionable && (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptConnection(notification.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectConnection(notification.id)}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            )}
                            
                            {!notification.read && !notification.actionable && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
