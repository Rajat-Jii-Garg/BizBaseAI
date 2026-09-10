import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

let sharedChannel = null;
let subscriberCount = 0;

export const useOnlinePresence = () => {
  const { user } = useAuth();
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  useEffect(() => {
    if (!user?.id) return;

    if (!sharedChannel) {
      sharedChannel = supabase.channel("online-users", {
        config: { presence: { key: user.id } },
      });
    }
    subscriberCount += 1;

    const syncState = () => {
      setOnlineUserIds(new Set(Object.keys(sharedChannel.presenceState())));
    };

    sharedChannel.on("presence", { event: "sync" }, syncState);

    if (subscriberCount === 1) {
      sharedChannel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await sharedChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });
    } else {
      syncState();
    }

    return () => {
      subscriberCount -= 1;
      if (subscriberCount <= 0 && sharedChannel) {
        supabase.removeChannel(sharedChannel);
        sharedChannel = null;
        subscriberCount = 0;
      }
    };
  }, [user?.id]);

  return onlineUserIds;
};
