import React, { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export default function ConnectivityStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (online) return null;
  return <div className="fixed bottom-3 left-1/2 z-[100] -translate-x-1/2 rounded-full border bg-background/95 px-4 py-2 text-xs shadow-lg backdrop-blur flex items-center gap-2">
    <WifiOff className="h-3.5 w-3.5 text-destructive"/> You are offline. Changes will resume when connection returns.
  </div>;
}
