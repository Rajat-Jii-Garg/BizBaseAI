import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Building2, Mail, Phone, Globe, MapPin, Camera, Save, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BusinessSettings = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentBusiness, fetchBusinesses } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: currentBusiness?.name || '', description: currentBusiness?.description || '',
    email: currentBusiness?.email || '', phone: currentBusiness?.phone || '',
    website: currentBusiness?.website || '', address: currentBusiness?.address || '',
    city: currentBusiness?.city || '', country: currentBusiness?.country || ''
  });

  React.useEffect(() => {
    if (currentBusiness) {
      setFormData({
        name: currentBusiness.name || '', description: currentBusiness.description || '',
        email: currentBusiness.email || '', phone: currentBusiness.phone || '',
        website: currentBusiness.website || '', address: currentBusiness.address || '',
        city: currentBusiness.city || '', country: currentBusiness.country || ''
      });
    }
  }, [currentBusiness]);

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Business name is required'); return; }
    try {
      setSaving(true);
      const { error } = await supabase.from('businesses').update({
        name: formData.name, description: formData.description, email: formData.email,
        phone: formData.phone, website: formData.website, address: formData.address,
        city: formData.city, country: formData.country, updated_at: new Date().toISOString()
      }).eq('id', businessId);
      if (error) throw error;
      toast.success('Settings updated');
      fetchBusinesses();
    } catch (error) { console.error('Error:', error); toast.error('Failed to update'); } finally { setSaving(false); }
  };

  return (
    <div className="p-3 md:p-5 space-y-4 max-w-3xl text-[13px]">
      <div>
        <h1 className="text-base font-bold text-foreground flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />Business Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your business profile and preferences</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Business Profile</CardTitle>
          <CardDescription className="text-xs">Update your business information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarImage src={currentBusiness?.logo_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">{currentBusiness?.name?.charAt(0) || 'B'}</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" className="text-xs h-7"><Camera className="w-3 h-3 mr-1.5" />Change Logo</Button>
              <p className="text-[10px] text-muted-foreground mt-1">Recommended: 200x200px</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label className="text-xs">Business Name *</Label>
              <div className="relative mt-1"><Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="pl-8 h-8 text-xs" placeholder="Your Business Name" /></div>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="text-xs mt-1" placeholder="Describe your business..." rows={3} />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <div className="relative mt-1"><Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="pl-8 h-8 text-xs" placeholder="business@email.com" /></div>
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <div className="relative mt-1"><Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="pl-8 h-8 text-xs" placeholder="+91 12345 67890" /></div>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Website</Label>
              <div className="relative mt-1"><Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="pl-8 h-8 text-xs" placeholder="https://yourbusiness.com" /></div>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Address</Label>
              <div className="relative mt-1"><MapPin className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" /><Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="pl-8 text-xs" placeholder="Street address" rows={2} /></div>
            </div>
            <div>
              <Label className="text-xs">City</Label>
              <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="h-8 text-xs mt-1" placeholder="City" />
            </div>
            <div>
              <Label className="text-xs">Country</Label>
              <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="h-8 text-xs mt-1" placeholder="Country" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} size="sm" className="text-xs h-8"><Save className="w-3.5 h-3.5 mr-1.5" />{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Danger Zone</CardTitle>
          <CardDescription className="text-xs">Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            <AlertDescription className="text-xs">Deleting your business will permanently remove all associated data. This action cannot be undone.</AlertDescription>
          </Alert>
          <Button variant="destructive" size="sm" disabled className="text-xs h-8"><Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete Business</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessSettings;
