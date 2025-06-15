import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const [profilePhoto, setProfilePhoto] = React.useState<string | undefined>(undefined);

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    toast({ title: "Profile saved", description: "Profile updated (UI only, not saved anywhere yet)." });
  }

  function handleCompanySave(e: React.FormEvent) {
    e.preventDefault();
    toast({ title: "Company saved", description: "Company settings saved (UI only, not persistent)." });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(URL.createObjectURL(file));
      toast({ title: "Profile photo uploaded (UI only)" });
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 min-w-0 md:ml-64 bg-gray-50 transition-all">
          <DashboardHeader />
          <main className="p-4 md:p-8 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-7 animate-fade-in">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Settings</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Settings */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-5" onSubmit={handleProfileSave}>
                    <div className="flex items-center gap-4 flex-wrap">
                      <Avatar className="w-16 h-16">
                        <AvatarImage
                          src={profilePhoto || "https://randomuser.me/api/portraits/men/1.jpg"}
                          alt="Profile"
                          className="object-cover"
                        />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Change Photo</label>
                        <Input type="file" accept="image/*" onChange={handlePhotoChange} className="text-xs max-w-[180px]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
                      <Input type="text" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                      <Input type="email" placeholder="john@email.com" />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                      Save Profile
                    </Button>
                  </form>
                </CardContent>
              </Card>
              {/* Company Settings */}
              <Card className="animate-fade-in delay-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Company <span className="text-xs bg-gray-100 px-2 rounded text-gray-500">Org</span></CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-5" onSubmit={handleCompanySave}>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Company Name</label>
                      <Input type="text" placeholder="BizBase Inc." />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Industry</label>
                      <Input type="text" placeholder="Technology" />
                    </div>
                    <Button type="submit" className="w-full bg-purple-600 text-white hover:bg-purple-700">
                      Save Company
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
