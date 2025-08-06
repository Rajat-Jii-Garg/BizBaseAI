
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Check, X } from 'lucide-react';

const ConnectionsList = ({
  connections,
  pendingRequests,
  onAcceptRequest,
  onRejectRequest
}) => {
  return (
    <div className="space-y-4">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Connection Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={request.requester_profile?.avatar_url} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                      {request.requester_profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {request.requester_profile?.full_name || 'Professional User'}
                    </p>
                    <p className="text-xs text-gray-500">wants to connect</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAcceptRequest(request.id)}
                    className="h-6 px-2 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRejectRequest(request.id)}
                    className="h-6 px-2 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* My Connections */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            My Network ({connections.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {connections.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">
              No connections yet. Start building your network!
            </p>
          ) : (
            connections.slice(0, 5).map((connection) => {
              // Show the other person's profile (not current user)
              const profile = connection.requester_profile?.full_name !== undefined 
                ? connection.requester_profile 
                : connection.addressee_profile;
              
              return (
                <div key={connection.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.full_name || 'Professional User'}
                      </p>
                      <p className="text-xs text-gray-500">Professional Member</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Connected
                  </Badge>
                </div>
              );
            })
          )}
          {connections.length > 5 && (
            <Button variant="outline" size="sm" className="w-full text-xs h-7">
              View All Connections
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionsList;
