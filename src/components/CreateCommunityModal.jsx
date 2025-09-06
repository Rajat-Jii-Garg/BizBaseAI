import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  X,
  Globe,
  Lock,
  Users,
  Shield,
  AlertCircle,
  Hash,
  Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateCommunityModal = ({ onCommunityCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    is_private: false,
    activity_level: 'moderate',
    image_url: '',
    tags: [],
    rules: ''
  });
  const [newTag, setNewTag] = useState('');

  const categories = [
    'Technology',
    'Business',
    'Marketing',
    'Design',
    'Education',
    'Leadership',
    'Finance',
    'Healthcare',
    'Entertainment',
    'Sports',
    'Travel',
    'Food',
    'Art',
    'Music',
    'Photography',
    'Science',
    'Engineering',
    'Startup',
    'Freelancing',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to create a community",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim() || !formData.category || !formData.rules.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('communities')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          is_private: formData.is_private,
          activity_level: formData.activity_level,
          image_url: formData.image_url || null,
          tags: formData.tags,
          rules: formData.rules.trim(),
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Create community insert error:', error);
        throw error;
      }

      // Automatically join the creator as a member with admin role
      const { data: memberData, error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) {
        // rollback: remove created community to avoid orphan if membership fails
        console.error('Community created but adding member failed:', memberError);
        await supabase.from('communities').delete().eq('id', community.data.id);
        throw memberError;
      }

      toast({
        title: "Community Created!",
        description: `"${formData.name}" has been created successfully. You are the admin`
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        is_private: false,
        activity_level: 'moderate',
        image_url: '',
        tags: [],
        rules: ''
      });
      setNewTag('');
      setOpen(false);
      
      if (onCommunityCreated) {
        onCommunityCreated();
      }

    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: "Error",
        description: "Failed to create community. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Create Community
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Create New Community
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter community name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what your community is about..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Community Image URL (Optional)</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Privacy & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Community Type</Label>
                  <p className="text-xs text-gray-500">
                    {formData.is_private ? 'Private communities require approval to join' : 'Public communities are open to everyone'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className={`w-4 h-4 ${!formData.is_private ? 'text-green-600' : 'text-gray-400'}`} />
                  <Switch
                    checked={formData.is_private}
                    onCheckedChange={(checked) => handleInputChange('is_private', checked)}
                  />
                  <Lock className={`w-4 h-4 ${formData.is_private ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity_level">Expected Activity Level</Label>
                <Select value={formData.activity_level} onValueChange={(value) => handleInputChange('activity_level', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very_active">Very Active (Daily discussions)</SelectItem>
                    <SelectItem value="active">Active (Regular discussions)</SelectItem>
                    <SelectItem value="moderate">Moderate (Weekly discussions)</SelectItem>
                    <SelectItem value="quiet">Quiet (Occasional discussions)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tags (e.g., javascript, startup, networking)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Community Guidelines *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.rules}
                onChange={(e) => handleInputChange('rules', e.target.value)}
                placeholder="Set community rules and guidelines for members..."
                rows={5}
                required
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Creating...' : 'Create Community'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunityModal;