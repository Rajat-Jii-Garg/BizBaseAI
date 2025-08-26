
import DashboardLayout from '@/components/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Eye,
  Lock,
  Mail,
  Settings as SettingsIcon,
  Shield,
  Smartphone,
  Trash2,
  Upload,
  User
} from 'lucide-react';
import { useState } from 'react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    // Profile Settings
    full_name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    
    // Privacy Settings
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowSearchEngines: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    connectionRequests: true,
    postLikes: true,
    postComments: true,
    postShares: false,
    networkUpdates: true,
    jobAlerts: true,
    
    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    
    // Account Settings
    language: 'en',
    timezone: 'UTC',
    theme: 'light'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Save profile settings logic here
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Delete account logic here
        await signOut();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete account.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
              Account Settings
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-bold text-xl">
                      {settings.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" className="mb-2">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New Photo
                    </Button>
                    <p className="text-sm text-gray-500">
                      Recommended: Square image, at least 200x200px
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={settings.full_name}
                      onChange={(e) => handleSettingChange('full_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => handleSettingChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={settings.location}
                      onChange={(e) => handleSettingChange('location', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={settings.website}
                      onChange={(e) => handleSettingChange('website', e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={loading}>
                  Save Profile Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Privacy & Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-gray-500">Who can see your profile</p>
                    </div>
                    <select 
                      className="border rounded px-3 py-2"
                      value={settings.profileVisibility}
                      onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                    >
                      <option value="public">Public</option>
                      <option value="connections">Connections Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Email Address</Label>
                      <p className="text-sm text-gray-500">Display email on your profile</p>
                    </div>
                    <Switch
                      checked={settings.showEmail}
                      onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Phone Number</Label>
                      <p className="text-sm text-gray-500">Display phone on your profile</p>
                    </div>
                    <Switch
                      checked={settings.showPhone}
                      onCheckedChange={(checked) => handleSettingChange('showPhone', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Search Engines</Label>
                      <p className="text-sm text-gray-500">Let search engines index your profile</p>
                    </div>
                    <Switch
                      checked={settings.allowSearchEngines}
                      onCheckedChange={(checked) => handleSettingChange('allowSearchEngines', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-green-600" />
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-500">Receive push notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Activity Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'connectionRequests', label: 'Connection Requests' },
                        { key: 'postLikes', label: 'Post Likes' },
                        { key: 'postComments', label: 'Post Comments' },
                        { key: 'postShares', label: 'Post Shares' },
                        { key: 'networkUpdates', label: 'Network Updates' },
                        { key: 'jobAlerts', label: 'Job Alerts' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <Label>{item.label}</Label>
                          <Switch
                            checked={settings[item.key]}
                            onCheckedChange={(checked) => handleSettingChange(item.key, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Security & Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified of new logins</p>
                    </div>
                    <Switch
                      checked={settings.loginAlerts}
                      onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Password</h4>
                    <Button variant="outline">
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <select 
                        className="w-full border rounded px-3 py-2"
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <select 
                        className="w-full border rounded px-3 py-2"
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="GMT">GMT</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-3 text-red-600">Danger Zone</h4>
                    <div className="space-y-3">
                      <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                        Export Account Data
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </Button>
                      <p className="text-sm text-gray-500">
                        This action cannot be undone. All your data will be permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
