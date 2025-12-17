import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Check, X, MessageSquare, MapPin, Briefcase, Send, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ConnectionsList = ({
  connections,
  receivedRequests,
  sentRequests,
  onAcceptRequest,
  onRejectRequest
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Helper to get the other person's profile from a connection
  const getOtherProfile = (connection) => {
    if (!user) return connection.requester_profile || connection.addressee_profile;
    
    // If current user is the requester, show addressee profile
    if (connection.requester_id === user.id) {
      return connection.addressee_profile;
    }
    // If current user is the addressee, show requester profile
    return connection.requester_profile;
  };

  return (
    <div className="space-y-4">
      {/* Received Requests */}
      {receivedRequests && receivedRequests.length > 0 && (
        <Card className="bg-white shadow-lg border-0 overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
              <UserPlus className="w-4 h-4 mr-2 shrink-0 text-blue-600" />
              <span className="truncate">Received Requests</span>
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                {receivedRequests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
            {receivedRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-2 hover:bg-blue-50 transition-colors">
                <div 
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => navigate(`/profile/${request.requester_profile?.id}`)}
                >
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-blue-100">
                    <AvatarImage src={request.requester_profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-medium">
                      {request.requester_profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                      {request.requester_profile?.full_name || 'Professional User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {request.requester_profile?.current_position || 'Wants to connect'} 
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => onAcceptRequest(request.id)}
                    className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRejectRequest(request.id)}
                    className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sent Requests */}
      {sentRequests && sentRequests.length > 0 && (
        <Card className="bg-white shadow-lg border-0 overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
              <Send className="w-4 h-4 mr-2 shrink-0 text-orange-600" />
              <span className="truncate">Sent Requests</span>
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                {sentRequests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
            {sentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-2 hover:bg-orange-50 transition-colors">
                <div 
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => navigate(`/profile/${request.addressee_profile?.id}`)}
                >
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-orange-100">
                    <AvatarImage src={request.addressee_profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white text-sm font-medium">
                      {request.addressee_profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate hover:text-orange-600 transition-colors">
                      {request.addressee_profile?.full_name || 'Professional User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {request.addressee_profile?.current_position || 'Pending acceptance'} 
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs bg-orange-50 text-orange-600 border-orange-200">
                  Pending
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* My Connections */}
      <Card className="bg-white shadow-lg border-0 overflow-hidden">
        <CardHeader className="pb-2 px-4 pt-4 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
              <Users className="w-4 h-4 mr-2 shrink-0 text-green-600" />
              <span className="truncate">My Connections</span>
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                {connections?.length || 0}
              </Badge>
            </CardTitle>
            {connections && connections.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-blue-600 hover:text-blue-700"
                onClick={() => navigate('/connections')}
              >
                View All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
          {!connections || connections.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">No connections yet</p>
              <p className="text-xs text-gray-500 mb-3">Start building your professional network!</p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/connections')}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Find People
              </Button>
            </div>
          ) : (
            connections.map((connection) => {
              const profile = getOtherProfile(connection);
              
              return (
                <div 
                  key={connection.id} 
                  className="p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all hover:shadow-sm group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar 
                      className="h-12 w-12 shrink-0 cursor-pointer ring-2 ring-white shadow-sm group-hover:ring-blue-200 transition-all"
                      onClick={() => navigate(`/profile/${profile?.id}`)}
                    >
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p 
                        className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => navigate(`/profile/${profile?.id}`)}
                      >
                        {profile?.full_name || 'Professional User'}
                      </p>
                      {profile?.current_position && (
                        <p className="text-xs text-gray-600 truncate flex items-center gap-1">
                          <Briefcase className="w-3 h-3 shrink-0" />
                          {profile.current_position}
                        </p>
                      )}
                      {profile?.location && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {profile.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={() => navigate(`/messages?user=${profile?.id}`)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => navigate(`/profile/${profile?.id}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionsList;
