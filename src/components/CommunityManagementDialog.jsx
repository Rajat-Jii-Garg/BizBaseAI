import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Settings,
  Shield
} from 'lucide-react';
import CommunityAdminPanel from './CommunityAdminPanel';

const CommunityManagementDialog = ({
  open,
  onOpenChange,
  community,
  user,
  isOwner,
  isAdmin,
  initialSection = 'settings',
  onCommunityUpdated
}) => {
  if (!community || !isAdmin) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="
          w-[calc(100%-1rem)]
          max-w-5xl
          max-h-[90vh]
          overflow-y-auto
          p-0
        "
      >
        <DialogHeader className="sticky top-0 z-20 bg-white border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            {initialSection === 'settings' ? (
              <Settings className="w-5 h-5 text-blue-600" />
            ) : (
              <Shield className="w-5 h-5 text-blue-600" />
            )}

            {initialSection === 'settings'
              ? 'Edit Community'
              : 'Community Management'}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          <CommunityAdminPanel
            community={community}
            user={user}
            isOwner={isOwner}
            isAdmin={isAdmin}
            initialSection={initialSection}
            onCommunityUpdated={(updated) => {
              onCommunityUpdated?.(updated);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityManagementDialog;