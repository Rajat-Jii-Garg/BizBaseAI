
import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const dummyNotifications = [
  { id: 1, text: "You have 2 new leads", time: "3 min ago" },
  { id: 2, text: "Profile updated successfully", time: "2 hr ago" },
  { id: 3, text: "Invoice generated", time: "Yesterday" },
];

const NotificationsCenter: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Notifications"
        className="relative"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {dummyNotifications.length}
        </span>
      </Button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg ring-1 ring-black/10 z-50 p-3 animate-fade-in">
          <h3 className="font-semibold mb-2 text-gray-900">Notifications</h3>
          <ul>
            {dummyNotifications.length === 0 ? (
              <li className="text-gray-500 text-sm py-4 text-center">No notifications</li>
            ) : (
              dummyNotifications.map((n) => (
                <li key={n.id} className="py-2 px-2 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-between">
                  <span className="">{n.text}</span>
                  <span className="text-xs text-gray-400">{n.time}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;
