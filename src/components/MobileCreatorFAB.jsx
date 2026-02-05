import React, { useState, useEffect } from 'react';
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
      label: 'Create Post', 
      description: 'Most used by professionals',
      onClick: onCreatePost,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      icon: Users, 
      label: 'Post in Community', 
      description: 'Write posts in communities',
      onClick: onCreateCommunity,
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50'
    },
    { 
      icon: Calendar, 
      label: 'Plan for Event', 
      description: 'Host webinars, meetups, or live sessions',
      onClick: onCreateEvent,
      gradient: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50'
    },
    { 
      icon: Briefcase, 
      label: 'Post a free Job', 
      description: 'Hire talent or share job opportunities',
      onClick: onCreateJob,
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
  ];

  const handleItemClick = (onClick) => {
    setIsOpen(false);
    onClick?.();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden pointer-events-auto"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">

        {/* Action Sheet */}
        <div
          className={cn(
            "fixed bottom-24 right-6 z-50 transition-all duration-300 lg:hidden",
            "w-[320px] sm:w-[360px]",
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          )}
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 ring-1 ring-black/5">
            {/* Header */}
            <div className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 bg-gray-50">
              Create
            </div>

            {/* Items */}
            {menuItems.map((item, index) => (
              <div
                key={item.label}
                onClick={() => handleItemClick(item.onClick)}
                className={cn(
                  "flex items-center justify-between px-4 py-4 cursor-pointer select-none",
                  "group transition-colors",
                  "hover:bg-gray-100 active:bg-gray-200",
                  index !== menuItems.length - 1 && "border-b border-gray-200"
                )}
              >
                {/* Left */}
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-950">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-700">
                    {item.description}
                  </p>
                </div>

                {/* Right Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  "bg-gradient-to-br",
                  item.gradient
                )}
                >
                  <item.icon className="w-5 h-5 text-white" />
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
            "border-2 border-white/20"
          )}
          size="icon"
        >
          {isOpen ? (
            <X className="w-7 h-7 text-white transition-transform duration-300" />
          ) : (
            <Plus className="w-7 h-7 text-white transition-transform duration-300" />
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