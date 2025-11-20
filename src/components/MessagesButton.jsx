import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const MessagesButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadUsersCount, setUnreadUsersCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadUsers();
      
      // Real-time listener for incoming/outgoing messages
      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          () => {
            fetchUnreadUsers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUnreadUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, read')
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Unread users fetch error:', error);
        return;
      }

      // Collect unique user IDs who sent unread messages
      const uniqueUnreadSenders = new Set(
        data
          .map(message => message.sender_id)
          .filter(senderId => senderId !== user.id)
      );

      setUnreadUsersCount(uniqueUnreadSenders.size);
    } catch (err) {
      console.error('Error fetching unread users:', err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-gray-100 rounded-xl"
      onClick={() => navigate('/messages')}
    >
      <MessageSquare className="w-5 h-5 text-gray-600" />

      {unreadUsersCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-blue-500 rounded-full text-xs text-white flex items-center justify-center px-1 font-medium">
          {unreadUsersCount > 99 ? '99+' : unreadUsersCount}
        </span>
      )}
    </Button>
  );
};

export default MessagesButton;
