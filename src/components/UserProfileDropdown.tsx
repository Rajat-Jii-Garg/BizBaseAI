
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UserProfileDropdown: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="text-right mr-2 hidden md:block">
          <p className="text-sm font-medium text-gray-900">John Doe</p>
          <p className="text-xs text-gray-500">john@example.com</p>
        </div>
        <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black/5 z-50 animate-fade-in">
          <button className="flex w-full px-4 py-2 gap-2 hover:bg-gray-50 items-center text-sm" onClick={() => { setOpen(false); }}>
            <User className="w-4 h-4" /> Profile (static)
          </button>
          <button className="flex w-full px-4 py-2 gap-2 hover:bg-gray-50 items-center text-sm" onClick={() => { navigate("/dashboard/settings"); setOpen(false); }}>
            <Settings className="w-4 h-4" /> Settings
          </button>
          <div className="border-t mx-2 my-1"/>
          <button className="flex w-full px-4 py-2 gap-2 text-red-600 hover:bg-red-50 items-center text-sm" onClick={() => { setOpen(false); navigate("/login"); }}>
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
