 import React, { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Label } from '@/components/ui/label';
 import { Badge } from '@/components/ui/badge';
 import { Switch } from '@/components/ui/switch';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { 
   X, 
   Users, 
   Plus,
   Globe,
   Lock,
   Hash,
   Shield,
   Loader2,
   Sparkles,
   CheckCircle2
 } from 'lucide-react';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { cn } from '@/lib/utils';
 
 const FullPageCommunityCreator = ({ isOpen, onClose, onSuccess }) => {
   const { user } = useAuth();
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
     name: '',
     description: '',
     category: '',
     is_private: false,
     activity_level: 'moderate',
     rules: '',
     tags: []
   });
   const [newTag, setNewTag] = useState('');
 
   const categories = [
     'Technology', 'Business', 'Marketing', 'Design', 'Education', 
     'Leadership', 'Finance', 'Healthcare', 'Startup', 'Freelancing'
   ];
 
   const handleInputChange = (field, value) => {
     setFormData(prev => ({ ...prev, [field]: value }));
   };
 
   const handleAddTag = () => {
     if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
       setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
       setNewTag('');
     }
   };
 
   const handleRemoveTag = (tagToRemove) => {
     setFormData(prev => ({
       ...prev,
       tags: prev.tags.filter(tag => tag !== tagToRemove)
     }));
   };
 
   const handleSubmit = async () => {
     if (!user) {
       toast.error('Please login to create a community');
       return;
     }
 
     if (!formData.name.trim() || !formData.category || !formData.rules.trim()) {
       toast.error('Please fill in all required fields');
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
           tags: formData.tags,
           rules: formData.rules.trim(),
           user_id: user.id
         })
         .select()
         .single();
 
       if (error) throw error;
 
       // Add creator as admin member
       await supabase.from('community_members').insert({
         community_id: data.id,
         user_id: user.id,
         role: 'admin'
       });
 
       toast.success('Community Created!', {
         description: `"${formData.name}" is now live`
       });
 
       setFormData({
         name: '', description: '', category: '', is_private: false,
         activity_level: 'moderate', rules: '', tags: []
       });
       onSuccess?.();
       onClose();
     } catch (error) {
       console.error('Error creating community:', error);
       toast.error('Failed to create community');
     } finally {
       setLoading(false);
     }
   };
 
   if (!isOpen) return null;
 
   return (
     <div className="fixed inset-0 z-[100] bg-white flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
         <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
           <X className="w-5 h-5" />
         </Button>
         
         <div className="flex items-center gap-2">
           <Users className="w-5 h-5 text-green-600" />
           <span className="font-semibold text-gray-800">Create Community</span>
         </div>
 
         <Button
           onClick={handleSubmit}
           disabled={!formData.name.trim() || !formData.category || loading}
           className={cn(
             "rounded-full px-5 font-semibold",
             formData.name.trim() && formData.category
               ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white" 
               : "bg-gray-200 text-gray-400"
           )}
         >
           {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
         </Button>
       </div>
 
       {/* Content */}
       <ScrollArea className="flex-1">
         <div className="p-4 space-y-6">
           {/* Community Name */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-green-500" />
               Community Name *
             </Label>
             <Input
               value={formData.name}
               onChange={(e) => handleInputChange('name', e.target.value)}
               placeholder="Give your community a name"
               className="h-12 text-lg"
             />
           </div>
 
           {/* Description */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Description</Label>
             <Textarea
               value={formData.description}
               onChange={(e) => handleInputChange('description', e.target.value)}
               placeholder="What is your community about?"
               rows={3}
             />
           </div>
 
           {/* Category */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Category *</Label>
             <div className="flex flex-wrap gap-2">
               {categories.map((cat) => (
                 <Button
                   key={cat}
                   type="button"
                   variant={formData.category === cat ? "default" : "outline"}
                   size="sm"
                   onClick={() => handleInputChange('category', cat)}
                   className={cn(
                     "rounded-full",
                     formData.category === cat && "bg-green-600 hover:bg-green-700"
                   )}
                 >
                   {formData.category === cat && <CheckCircle2 className="w-3 h-3 mr-1" />}
                   {cat}
                 </Button>
               ))}
             </div>
           </div>
 
           {/* Privacy Toggle */}
           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
             <div className="flex items-center gap-3">
               {formData.is_private ? (
                 <Lock className="w-5 h-5 text-red-500" />
               ) : (
                 <Globe className="w-5 h-5 text-green-500" />
               )}
               <div>
                 <p className="font-medium">{formData.is_private ? 'Private' : 'Public'} Community</p>
                 <p className="text-xs text-gray-500">
                   {formData.is_private ? 'Members need approval to join' : 'Anyone can join'}
                 </p>
               </div>
             </div>
             <Switch
               checked={formData.is_private}
               onCheckedChange={(checked) => handleInputChange('is_private', checked)}
             />
           </div>
 
           {/* Tags */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold flex items-center gap-2">
               <Hash className="w-4 h-4" />
               Tags
             </Label>
             <div className="flex gap-2">
               <Input
                 value={newTag}
                 onChange={(e) => setNewTag(e.target.value)}
                 placeholder="Add tags..."
                 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
               />
               <Button type="button" onClick={handleAddTag} variant="outline" size="icon">
                 <Plus className="w-4 h-4" />
               </Button>
             </div>
             {formData.tags.length > 0 && (
               <div className="flex flex-wrap gap-2 mt-2">
                 {formData.tags.map((tag, idx) => (
                   <Badge key={idx} variant="secondary" className="gap-1">
                     {tag}
                     <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                   </Badge>
                 ))}
               </div>
             )}
           </div>
 
           {/* Community Rules */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold flex items-center gap-2">
               <Shield className="w-4 h-4 text-blue-500" />
               Community Guidelines *
             </Label>
             <Textarea
               value={formData.rules}
               onChange={(e) => handleInputChange('rules', e.target.value)}
               placeholder="Set rules for your community members..."
               rows={4}
             />
           </div>
         </div>
       </ScrollArea>
     </div>
   );
 };
 
 export default FullPageCommunityCreator;