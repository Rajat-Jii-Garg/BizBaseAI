import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConnectionsList = ({
  receivedRequests,
  onAcceptRequest,
  onRejectRequest
}) => {
  const navigate = useNavigate();

  // Show max 2 requests, newest first (already sorted by created_at desc from hook)
  const displayedRequests = receivedRequests?.slice(0, 2) || [];
  const hasMoreRequests = (receivedRequests?.length || 0) > 2;

  return (
    <Card className="bg-white shadow-lg border-0 overflow-hidden">
      <CardHeader className="pb-2 px-4 pt-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
          <UserPlus className="w-4 h-4 mr-2 shrink-0 text-blue-600" />
          <span className="truncate">Connection Requests</span>
          {receivedRequests && receivedRequests.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
              {receivedRequests.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {displayedRequests.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">No pending requests</p>
            <p className="text-xs text-gray-500">New requests will appear here</p>
          </div>
        ) : (
          <>
            {displayedRequests.map((request) => (
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
            
            {hasMoreRequests && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => navigate('/connections?tab=received')}
              >
                View More ({receivedRequests.length - 2} more)
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionsList;
