 import React, { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Label } from '@/components/ui/label';
 import { Badge } from '@/components/ui/badge';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { 
   X, 
   Calendar, 
   Plus,
   Clock,
   MapPin,
   Users,
   DollarSign,
   Loader2,
   Sparkles,
   CheckCircle2,
   Video,
   Building
 } from 'lucide-react';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { cn } from '@/lib/utils';
 
 const FullPageEventCreator = ({ isOpen, onClose, onSuccess }) => {
   const { user } = useAuth();
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
     title: '',
     description: '',
     date: '',
     time: '',
     location: '',
     type: 'workshop',
     category: 'Technology',
     price: 'Free',
     max_attendees: 100,
     tags: []
   });
   const [newTag, setNewTag] = useState('');
 
   const categories = ['Technology', 'Networking', 'Marketing', 'Finance', 'Leadership', 'Design', 'Business'];
   const eventTypes = [
     { value: 'workshop', label: 'Workshop', icon: Building },
     { value: 'webinar', label: 'Webinar', icon: Video },
     { value: 'networking', label: 'Networking', icon: Users },
     { value: 'conference', label: 'Conference', icon: Calendar }
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
       toast.error('Please login to create an event');
       return;
     }
 
     if (!formData.title.trim() || !formData.date || !formData.time || !formData.location.trim()) {
       toast.error('Please fill in all required fields');
       return;
     }
 
     setLoading(true);
     try {
       const { error } = await supabase.from('events').insert({
         user_id: user.id,
         title: formData.title.trim(),
         description: formData.description.trim(),
         date: formData.date,
         time: formData.time,
         location: formData.location.trim(),
         type: formData.type,
         category: formData.category,
         price: formData.price,
         max_attendees: formData.max_attendees,
         tags: formData.tags
       });
 
       if (error) throw error;
 
       toast.success('Event Created!', {
         description: `"${formData.title}" is now live`
       });
 
       setFormData({
         title: '', description: '', date: '', time: '', location: '',
         type: 'workshop', category: 'Technology', price: 'Free', max_attendees: 100, tags: []
       });
       onSuccess?.();
       onClose();
     } catch (error) {
       console.error('Error creating event:', error);
       toast.error('Failed to create event');
     } finally {
       setLoading(false);
     }
   };
 
   if (!isOpen) return null;
 
   return (
     <div className="fixed inset-0 z-[100] bg-white flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-violet-50">
         <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
           <X className="w-5 h-5" />
         </Button>
         
         <div className="flex items-center gap-2">
           <Calendar className="w-5 h-5 text-purple-600" />
           <span className="font-semibold text-gray-800">Create Event</span>
         </div>
 
         <Button
           onClick={handleSubmit}
           disabled={!formData.title.trim() || !formData.date || loading}
           className={cn(
             "rounded-full px-5 font-semibold",
             formData.title.trim() && formData.date
               ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white" 
               : "bg-gray-200 text-gray-400"
           )}
         >
           {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
         </Button>
       </div>
 
       {/* Content */}
       <ScrollArea className="flex-1">
         <div className="p-4 space-y-6">
           {/* Event Title */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-purple-500" />
               Event Title *
             </Label>
             <Input
               value={formData.title}
               onChange={(e) => handleInputChange('title', e.target.value)}
               placeholder="Name your event"
               className="h-12 text-lg"
             />
           </div>
 
           {/* Description */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Description</Label>
             <Textarea
               value={formData.description}
               onChange={(e) => handleInputChange('description', e.target.value)}
               placeholder="What's your event about?"
               rows={3}
             />
           </div>
 
           {/* Event Type */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Event Type</Label>
             <div className="grid grid-cols-2 gap-2">
               {eventTypes.map((type) => (
                 <Button
                   key={type.value}
                   type="button"
                   variant={formData.type === type.value ? "default" : "outline"}
                   onClick={() => handleInputChange('type', type.value)}
                   className={cn(
                     "h-16 flex-col gap-1",
                     formData.type === type.value && "bg-purple-600 hover:bg-purple-700"
                   )}
                 >
                   <type.icon className="w-5 h-5" />
                   <span className="text-xs">{type.label}</span>
                 </Button>
               ))}
             </div>
           </div>
 
           {/* Date & Time */}
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label className="text-sm font-semibold flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 Date *
               </Label>
               <Input
                 type="date"
                 value={formData.date}
                 onChange={(e) => handleInputChange('date', e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <Label className="text-sm font-semibold flex items-center gap-2">
                 <Clock className="w-4 h-4" />
                 Time *
               </Label>
               <Input
                 type="time"
                 value={formData.time}
                 onChange={(e) => handleInputChange('time', e.target.value)}
               />
             </div>
           </div>
 
           {/* Location */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold flex items-center gap-2">
               <MapPin className="w-4 h-4 text-red-500" />
               Location *
             </Label>
             <Input
               value={formData.location}
               onChange={(e) => handleInputChange('location', e.target.value)}
               placeholder="Virtual or Physical Address"
             />
           </div>
 
           {/* Category */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Category</Label>
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
                     formData.category === cat && "bg-purple-600 hover:bg-purple-700"
                   )}
                 >
                   {formData.category === cat && <CheckCircle2 className="w-3 h-3 mr-1" />}
                   {cat}
                 </Button>
               ))}
             </div>
           </div>
 
           {/* Price & Capacity */}
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label className="text-sm font-semibold flex items-center gap-2">
                 <DollarSign className="w-4 h-4" />
                 Price
               </Label>
               <Input
                 value={formData.price}
                 onChange={(e) => handleInputChange('price', e.target.value)}
                 placeholder="Free, $25, etc."
               />
             </div>
             <div className="space-y-2">
               <Label className="text-sm font-semibold flex items-center gap-2">
                 <Users className="w-4 h-4" />
                 Max Attendees
               </Label>
               <Input
                 type="number"
                 value={formData.max_attendees}
                 onChange={(e) => handleInputChange('max_attendees', parseInt(e.target.value) || 100)}
                 min="1"
               />
             </div>
           </div>
 
           {/* Tags */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Tags</Label>
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
         </div>
       </ScrollArea>
     </div>
   );
 };
 
 export default FullPageEventCreator;