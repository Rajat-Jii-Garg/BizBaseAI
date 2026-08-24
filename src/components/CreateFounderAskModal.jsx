import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ASK_KINDS } from '@/hooks/useFounders';

const CreateFounderAskModal = ({ open, onOpenChange, onCreate }) => {
  const [kind, setKind] = useState('advice');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setKind('advice');
    setTitle('');
    setDescription('');
    setCity('');
    setTagsText('');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Add a title and some details');
      return;
    }
    setSaving(true);
    const tags = tagsText
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 6);
    const { error } = await onCreate({
      kind,
      title: title.trim(),
      description: description.trim(),
      city: city.trim() || null,
      tags,
      status: 'open',
    });
    setSaving(false);
    if (error) {
      toast.error(error.message || 'Could not post your ask');
      return;
    }
    toast.success('Posted to the Founder Board 🚀 (+0.75 BizCoins)');
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Post an ask or an offer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>What do you need?</Label>
            <div className="flex flex-wrap gap-2">
              {ASK_KINDS.map((k) => (
                <button key={k.value} type="button" onClick={() => setKind(k.value)} className="focus:outline-none">
                  <Badge variant={kind === k.value ? 'default' : 'outline'} className="cursor-pointer">
                    {k.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Looking for a technical co-founder for a B2B SaaS"
              maxLength={140}
            />
          </div>

          <div className="space-y-2">
            <Label>Details *</Label>
            <Textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context, what you've built so far, and exactly how someone can help you."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City (optional)</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bangalore" />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="saas, b2b, fintech" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Posting...' : 'Post ask'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFounderAskModal;
