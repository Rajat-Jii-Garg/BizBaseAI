import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MessagesButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadUsersCount, setUnreadUsersCount] = useState(0);
  const fetchUnreadUsers = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase.rpc("get_unread_message_counts");
      if (error) throw error;
      /*
       * Number of conversations
       * having unread messages.
       */
      setUnreadUsersCount(
        (data || []).filter((row) => Number(row.unread_count) > 0).length,
      );
    } catch (error) {
      console.error("Unread message count error:", error);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setUnreadUsersCount(0);
      return;
    }

    fetchUnreadUsers();

    const channel = supabase
      .channel(`message-button-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadUsers();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadUsers();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-gray-100 rounded-lg sm:rounded-xl h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
      onClick={() => navigate("/messages")}
    >
      <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" />

      {unreadUsersCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-blue-500 rounded-full text-xs text-white flex items-center justify-center px-1 font-medium">
          {unreadUsersCount > 99 ? "99+" : unreadUsersCount}
        </span>
      )}
    </Button>
  );
};

export default MessagesButton;
