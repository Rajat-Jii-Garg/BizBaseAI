import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  X, 
  FileText, 
  Users, 
  Calendar, 
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileCreatorFAB = ({ 
  onCreatePost, 
  onCreateCommunity, 
  onCreateEvent, 
  onCreateJob 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      icon: FileText, 
      label: 'Post', 
      description: 'Share your thoughts',
      onClick: onCreatePost,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      icon: Users, 
      label: 'Community', 
      description: 'Build your tribe',
      onClick: onCreateCommunity,
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50'
    },
    { 
      icon: Calendar, 
      label: 'Event', 
      description: 'Host an event',
      onClick: onCreateEvent,
      gradient: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50'
    },
    { 
      icon: Briefcase, 
      label: 'Job', 
      description: 'Post opportunity',
      onClick: onCreateJob,
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
  ];

  const handleItemClick = (onClick) => {
    setIsOpen(false);
    onClick?.();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        {/* Menu Items - Dropup */}
        


      {/* Action Sheet */}
      <div
        className={cn(
          "fixed bottom-24 right-4 left-4 z-50 transition-all duration-300 lg:hidden",
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="px-4 py-3 text-sm font-semibold text-gray-900 bg-gray-50">
            Create
          </div>

          {/* Items */}
          {menuItems.map((item, index) => (
            <div
              key={item.label}
              onClick={() => handleItemClick(item.onClick)}
              className={cn(
                "flex items-center justify-between px-4 py-4 cursor-pointer",
                "active:bg-gray-100 transition-colors",
                index !== menuItems.length - 1 && "border-b border-gray-200"
              )}
            >
              {/* Left */}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {item.label}
                </p>
                <p className="text-xs text-gray-500">
                  {item.description}
                </p>
              </div>

              {/* Right Icon */}
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>






         {/* Main FAB Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full shadow-2xl transition-all duration-300",
            "bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600",
            "hover:shadow-blue-500/40 hover:shadow-xl",
            "active:scale-95",
            "border-2 border-white/20",
            isOpen && "rotate-45"
          )}
          size="icon"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
          
          {/* Pulse animation when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 animate-ping opacity-30" />
          )}
        </Button>
      </div>
    </>
  );
};

export default MobileCreatorFAB;