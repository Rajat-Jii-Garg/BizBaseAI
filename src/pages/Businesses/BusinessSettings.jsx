import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Camera,
  Save,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BusinessLayout from '@/components/BusinessLayout';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BusinessSettings = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { currentBusiness, fetchBusinesses } = useBusinessContext();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: currentBusiness?.name || '',
    description: currentBusiness?.description || '',
    email: currentBusiness?.email || '',
    phone: currentBusiness?.phone || '',
    website: currentBusiness?.website || '',
    address: currentBusiness?.address || '',
    city: currentBusiness?.city || '',
    country: currentBusiness?.country || ''
  });

  React.useEffect(() => {
    if (currentBusiness) {
      setFormData({
        name: currentBusiness.name || '',
        description: currentBusiness.description || '',
        email: currentBusiness.email || '',
        phone: currentBusiness.phone || '',
        website: currentBusiness.website || '',
        address: currentBusiness.address || '',
        city: currentBusiness.city || '',
        country: currentBusiness.country || ''
      });
    }
  }, [currentBusiness]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Business name is required');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('businesses')
        .update({
          name: formData.name,
          description: formData.description,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId);

      if (error) throw error;

      toast.success('Business settings updated successfully');
      fetchBusinesses();
    } catch (error) {
      console.error('Error updating business:', error);
      toast.error('Failed to update business settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BusinessLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Settings className="w-7 h-7 text-primary" />
            Business Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your business profile and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>Update your business information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={currentBusiness?.logo_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {currentBusiness?.name?.charAt(0) || 'B'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Recommended: 200x200px</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Business Name *</Label>
                <div className="relative mt-1.5">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="pl-10"
                    placeholder="Your Business Name"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1.5"
                  placeholder="Describe your business..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10"
                    placeholder="business@email.com"
                  />
                </div>
              </div>

              <div>
                <Label>Phone</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="pl-10"
                    placeholder="+91 12345 67890"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label>Website</Label>
                <div className="relative mt-1.5">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="pl-10"
                    placeholder="https://yourbusiness.com"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label>Address</Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="pl-10"
                    placeholder="Street address"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <Label>City</Label>
                <Input 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="mt-1.5"
                  placeholder="City"
                />
              </div>

              <div>
                <Label>Country</Label>
                <Input 
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="mt-1.5"
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Deleting your business will permanently remove all associated data including leads, projects, services, and team members. This action cannot be undone.
              </AlertDescription>
            </Alert>
            <Button variant="destructive" disabled>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Business
            </Button>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  );
};

export default BusinessSettings;
