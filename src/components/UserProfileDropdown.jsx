
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const UserProfileDropdown = () => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="text-right mr-2 hidden md:block">
          <p className="text-sm font-medium text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500">{displayEmail}</p>
        </div>
        <Avatar>
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black/5 z-50 animate-fade-in">
          <button className="flex w-full px-4 py-2 gap-2 hover:bg-gray-50 items-center text-sm" onClick={() => { navigate('/user-profile'); setOpen(false); }}>
            <User className="w-4 h-4" /> Profile
          </button>
          <button className="flex w-full px-4 py-2 gap-2 hover:bg-gray-50 items-center text-sm" onClick={() => { navigate('/settings'); setOpen(false); }}>
            <Settings className="w-4 h-4" /> Settings
          </button>
          <div className="border-t mx-2 my-1"/>
          <button className="flex w-full px-4 py-2 gap-2 text-red-600 hover:bg-red-50 items-center text-sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
