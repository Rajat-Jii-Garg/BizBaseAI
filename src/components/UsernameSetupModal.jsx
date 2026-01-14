import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AtSign, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const UsernameSetupModal = ({ open, onClose }) => {
  const { user, profile } = useAuth();
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check username availability
  const checkUsernameAvailability = useCallback(async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    setCheckingUsername(true);
    try {
      const { data, error } = await supabase.rpc('is_username_available', { 
        check_username: usernameToCheck 
      });
      
      if (error) throw error;
      setUsernameAvailable(data);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, []);

  // Debounced username check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailability]);

  const handleUsernameChange = (value) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
  };

  const handleSave = async () => {
    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (usernameAvailable === false) {
      toast.error('This username is already taken');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Username saved successfully!');
      onClose();
      // Reload to refresh profile data
      window.location.reload();
    } catch (error) {
      console.error('Error saving username:', error);
      toast.error('Failed to save username. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Set Your Username
          </DialogTitle>
          <DialogDescription>
            Choose a unique username for your BizBase profile. This will be your public identity on the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Choose a unique username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={`pl-10 pr-10 ${
                  usernameAvailable === true ? 'border-green-500 focus:border-green-500' : 
                  usernameAvailable === false ? 'border-destructive focus:border-destructive' : ''
                }`}
                autoFocus
              />
              <div className="absolute right-3 top-3">
                {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {!checkingUsername && usernameAvailable === true && <CheckCircle className="h-4 w-4 text-green-500" />}
                {!checkingUsername && usernameAvailable === false && <XCircle className="h-4 w-4 text-destructive" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your profile URL: bizbase.com/@{username || 'username'}
            </p>
            {usernameAvailable === false && (
              <p className="text-xs text-destructive">This username is already taken</p>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Username rules:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 3 characters long</li>
              <li>Only lowercase letters, numbers, and underscores</li>
              <li>Must be unique across all users and businesses</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={!username || username.length < 3 || usernameAvailable !== true || saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Username'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UsernameSetupModal;