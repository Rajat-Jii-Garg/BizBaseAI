import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import {
  Bell, Eye, Lock, Mail, Settings as SettingsIcon, Shield,
  Smartphone, Trash2, Upload, User, Save, Loader2, Globe, Palette, Sparkles, Send
} from 'lucide-react';

const Settings = () => {
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    current_position: '',
    company_name: '',
    industry: '',
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: false,
    allowSearchEngines: true,
    actively_looking_for_work: false,
  });

  const [notifSettings, setNotifSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    connectionRequests: true,
    postLikes: true,
    postComments: true,
    postShares: false,
    networkUpdates: true,
    jobAlerts: true,
    aiCoachEmails: true,
  });
  const [coachSaving, setCoachSaving] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        phone: profile.phone || '',
        current_position: profile.current_position || '',
        company_name: profile.company_name || '',
        industry: profile.industry || '',
      });
      // Load privacy settings from the profiles row (server-enforced)
      setPrivacySettings(prev => ({
        ...prev,
        actively_looking_for_work: profile.actively_looking_for_work || false,
        showEmail: profile.show_email || false,
        showPhone: profile.show_phone || false,
        showLocation: profile.show_location || false,
      }));
      const prefs = profile.notification_preferences || {};
      setNotifSettings(prev => ({
        ...prev,
        ...prefs,
        aiCoachEmails: profile.ai_coach_emails_enabled !== false,
      }));
    }
  }, [profile, user]);

  const toggleAiCoach = async (enabled) => {
    if (!user) return;
    setNotifSettings(p => ({ ...p, aiCoachEmails: enabled }));
    setCoachSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ai_coach_emails_enabled: enabled })
        .eq('id', user.id);
      if (error) throw error;
      toast.success(enabled ? 'AI Coach emails enabled' : 'AI Coach emails disabled');
    } catch (e) {
      toast.error('Failed to update preference');
      setNotifSettings(p => ({ ...p, aiCoachEmails: !enabled }));
    } finally {
      setCoachSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    setSavingNotif(true);
    try {
      const { aiCoachEmails, ...prefs } = notifSettings;
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: prefs })
        .eq('id', user.id);
      if (error) throw error;
      toast.success('Notification preferences saved!');
    } catch (e) {
      toast.error('Failed to save preferences');
      console.error(e);
    } finally {
      setSavingNotif(false);
    }
  };


  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          actively_looking_for_work: privacySettings.actively_looking_for_work,
          show_email: privacySettings.showEmail,
          show_phone: privacySettings.showPhone,
          show_location: privacySettings.showLocation,
        })
        .eq('id', user.id);
      if (error) throw error;
      toast.success('Privacy settings saved!');
    } catch (error) {
      toast.error('Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send reset email');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await signOut();
        toast.success('Account signed out. Contact support for full deletion.');
      } catch (error) {
        toast.error('Failed to process request');
      }
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setSaving(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      toast.success('Profile photo updated!');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to upload photo');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotifSettings(prev => ({ ...prev, pushNotifications: true }));
      toast.success('Push notifications enabled!');
    } else {
      toast.error('Push notification permission denied');
    }
  };

  return (
    <DashboardLayout>
      <SEOHead title="Settings" description="Manage your BizBase AI account settings, privacy, and preferences." path="/settings" noIndex />
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <SettingsIcon className="w-6 h-6 text-primary" />
              Account Settings
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Eye className="w-4 h-4" /> Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                      {profileData.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span><Upload className="w-4 h-4 mr-2" /> Upload New Photo</span>
                      </Button>
                    </Label>
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    <p className="text-sm text-muted-foreground mt-1">Square image, at least 200x200px</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={profileData.full_name} onChange={(e) => setProfileData(p => ({ ...p, full_name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={profileData.phone} onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={profileData.location} onChange={(e) => setProfileData(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Position</Label>
                    <Input value={profileData.current_position} onChange={(e) => setProfileData(p => ({ ...p, current_position: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input value={profileData.company_name} onChange={(e) => setProfileData(p => ({ ...p, company_name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input value={profileData.industry} onChange={(e) => setProfileData(p => ({ ...p, industry: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={profileData.website} onChange={(e) => setProfileData(p => ({ ...p, website: e.target.value }))} placeholder="https://" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Bio</Label>
                    <Textarea value={profileData.bio} onChange={(e) => setProfileData(p => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Tell us about yourself..." />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader><CardTitle className="text-foreground">Privacy & Visibility</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {[
                  { key: 'showEmail', label: 'Show Email Address', desc: 'Display email on your profile' },
                  { key: 'showPhone', label: 'Show Phone Number', desc: 'Display phone on your profile' },
                  { key: 'allowSearchEngines', label: 'Allow Search Engines', desc: 'Let search engines index your profile' },
                  { key: 'actively_looking_for_work', label: 'Open to Work', desc: 'Show recruiters you\'re available' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={privacySettings[item.key]}
                      onCheckedChange={(checked) => setPrivacySettings(p => ({ ...p, [item.key]: checked }))}
                    />
                  </div>
                ))}
                <Button onClick={handleSavePrivacy} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Profile Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-foreground">Weekly AI Coach Emails</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Every Monday, our AI analyzes your profile and emails you personalized suggestions to grow your network and improve your visibility.
                    </p>
                  </div>
                  <Switch
                    checked={notifSettings.aiCoachEmails}
                    disabled={coachSaving}
                    onCheckedChange={toggleAiCoach}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={sendCoachTest} disabled={sendingTest || !notifSettings.aiCoachEmails}>
                  {sendingTest ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send me a test analysis now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-foreground">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <Label className="text-foreground">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch checked={notifSettings.emailNotifications} onCheckedChange={(c) => setNotifSettings(p => ({ ...p, emailNotifications: c }))} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-green-600" />
                      <div>
                        <Label className="text-foreground">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Browser push notifications</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={requestPushPermission}>
                      {typeof Notification !== 'undefined' &&
                        Notification.permission === 'granted'
                          ? 'Enabled ✓' 
                          : 'Enable'}
                    </Button>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium text-foreground mb-3">Activity Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'connectionRequests', label: 'Connection Requests' },
                        { key: 'postLikes', label: 'Post Likes' },
                        { key: 'postComments', label: 'Post Comments' },
                        { key: 'postShares', label: 'Post Shares' },
                        { key: 'networkUpdates', label: 'Network Updates' },
                        { key: 'jobAlerts', label: 'Job Alerts' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <Label className="text-foreground">{item.label}</Label>
                          <Switch checked={notifSettings[item.key]} onCheckedChange={(c) => setNotifSettings(p => ({ ...p, [item.key]: c }))} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Button onClick={() => toast.success('Notification preferences saved!')}>
                  <Save className="w-4 h-4 mr-2" /> Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account & Security */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-foreground">Security</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">Change Password</Label>
                      <p className="text-sm text-muted-foreground">Send a password reset email</p>
                    </div>
                    <Button variant="outline" onClick={handleChangePassword}>
                      <Lock className="w-4 h-4 mr-2" /> Reset Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back.</p>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
