
import React from 'react';
import AppSidebar from '@/components/AppSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [profilePhoto, setProfilePhoto] = React.useState<string | undefined>(undefined);

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    toast({ title: "Saved", description: "Profile updated (dummy, not persistent)." });
  }
  function handleCompanySave(e: React.FormEvent) {
    e.preventDefault();
    toast({ title: "Saved", description: "Company settings saved (dummy, not persistent)." });
  }
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(URL.createObjectURL(file));
      toast({ title: "Profile photo uploaded (UI only)" });
    }
  }
  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="ml-64 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleProfileSave}>
                  <div className="flex items-center gap-3">
                    <div>
                      <img
                        src={profilePhoto || "https://randomuser.me/api/portraits/men/1.jpg"}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Change Photo</label>
                      <Input type="file" accept="image/*" onChange={handlePhotoChange} className="text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <Input type="text" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <Input type="email" placeholder="john@email.com" />
                  </div>
                  <Button type="submit" className="bg-blue-600 text-white">Save</Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCompanySave}>
                  <div>
                    <label className="text-sm text-gray-500">Company Name</label>
                    <Input type="text" placeholder="BizBase Inc." />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Industry</label>
                    <Input type="text" placeholder="Technology" />
                  </div>
                  <Button type="submit" className="bg-purple-600 text-white">Save</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};
export default Settings;
