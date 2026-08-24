import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { FOUNDER_STAGES, LOOKING_FOR_OPTIONS } from '@/hooks/useFounders';

const EMPTY = {
  startup_name: '',
  tagline: '',
  website: '',
  stage: 'idea',
  industry: '',
  city: '',
  team_size: '',
  funding_stage: '',
  looking_for: [],
  is_hiring: false,
  pitch: '',
};

const FounderProfileModal = ({ open, onOpenChange, founderProfile, onSave }) => {
  const [values, setValues] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(founderProfile ? { ...EMPTY, ...founderProfile } : EMPTY);
    }
  }, [open, founderProfile]);

  const set = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const toggleLookingFor = (item) => {
    setValues((prev) => ({
      ...prev,
      looking_for: prev.looking_for?.includes(item)
        ? prev.looking_for.filter((i) => i !== item)
        : [...(prev.looking_for || []), item],
    }));
  };

  const handleSave = async () => {
    if (!values.startup_name?.trim()) {
      toast.error('Startup / company name is required');
      return;
    }
    setSaving(true);
    const payload = {
      startup_name: values.startup_name.trim(),
      tagline: values.tagline?.trim() || null,
      website: values.website?.trim() || null,
      stage: values.stage || 'idea',
      industry: values.industry?.trim() || null,
      city: values.city?.trim() || null,
      team_size: values.team_size?.trim() || null,
      funding_stage: values.funding_stage?.trim() || null,
      looking_for: values.looking_for || [],
      is_hiring: !!values.is_hiring,
      pitch: values.pitch?.trim() || null,
    };
    if (founderProfile?.id) payload.id = founderProfile.id;

    const { error } = await onSave(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message || 'Could not save your founder profile');
      return;
    }
    toast.success(founderProfile ? 'Founder profile updated' : 'You are live in the Founders directory 🚀');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            {founderProfile ? 'Edit founder profile' : 'Join as a Founder'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Startup / Company name *</Label>
              <Input
                value={values.startup_name}
                onChange={(e) => set('startup_name', e.target.value)}
                placeholder="e.g. BizBase"
              />
            </div>
            <div className="space-y-2">
              <Label>One-line pitch</Label>
              <Input
                value={values.tagline || ''}
                onChange={(e) => set('tagline', e.target.value)}
                placeholder="Smart networking for Indian professionals"
              />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <select
                className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm"
                value={values.stage}
                onChange={(e) => set('stage', e.target.value)}
              >
                {FOUNDER_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input
                value={values.industry || ''}
                onChange={(e) => set('industry', e.target.value)}
                placeholder="SaaS, D2C, FinTech..."
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={values.city || ''}
                onChange={(e) => set('city', e.target.value)}
                placeholder="Bangalore"
              />
            </div>
            <div className="space-y-2">
              <Label>Team size</Label>
              <Input
                value={values.team_size || ''}
                onChange={(e) => set('team_size', e.target.value)}
                placeholder="1-5"
              />
            </div>
            <div className="space-y-2">
              <Label>Funding stage</Label>
              <Input
                value={values.funding_stage || ''}
                onChange={(e) => set('funding_stage', e.target.value)}
                placeholder="Bootstrapped / Pre-seed / Seed"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={values.website || ''}
                onChange={(e) => set('website', e.target.value)}
                placeholder="https://yourstartup.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>What are you looking for?</Label>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR_OPTIONS.map((item) => {
                const active = values.looking_for?.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleLookingFor(item)}
                    className="focus:outline-none"
                  >
                    <Badge variant={active ? 'default' : 'outline'} className="cursor-pointer">
                      {item}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>What are you building?</Label>
            <Textarea
              rows={4}
              value={values.pitch || ''}
              onChange={(e) => set('pitch', e.target.value)}
              placeholder="Problem you're solving, who it's for, and where you are today."
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={!!values.is_hiring}
              onChange={(e) => set('is_hiring', e.target.checked)}
              className="rounded border-input"
            />
            We are currently hiring
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : founderProfile ? 'Save changes' : 'Go live'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FounderProfileModal;
