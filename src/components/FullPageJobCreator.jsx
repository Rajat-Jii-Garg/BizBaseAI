 import React, { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Label } from '@/components/ui/label';
 import { Badge } from '@/components/ui/badge';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { 
   X, 
   Briefcase, 
   Plus,
   MapPin,
   DollarSign,
   Building,
   Loader2,
   Sparkles,
   CheckCircle2,
   Clock,
   Globe,
   Home,
   Users
 } from 'lucide-react';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { cn } from '@/lib/utils';
 
 const FullPageJobCreator = ({ isOpen, onClose, onSuccess }) => {
   const { user } = useAuth();
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
     title: '',
     company_name: '',
     location: '',
     job_type: 'full-time',
     work_mode: 'remote',
     experience_level: 'mid-level',
     industry: 'Technology',
     description: '',
     salary_min: '',
     salary_max: '',
     salary_currency: 'USD',
     skills_required: [],
     requirements: [],
     benefits: []
   });
   const [newSkill, setNewSkill] = useState('');
   const [newRequirement, setNewRequirement] = useState('');
   const [newBenefit, setNewBenefit] = useState('');
 
   const jobTypes = [
     { value: 'full-time', label: 'Full Time', icon: Clock },
     { value: 'part-time', label: 'Part Time', icon: Clock },
     { value: 'contract', label: 'Contract', icon: Briefcase },
     { value: 'freelance', label: 'Freelance', icon: Users }
   ];
 
   const workModes = [
     { value: 'remote', label: 'Remote', icon: Globe },
     { value: 'on-site', label: 'On-site', icon: Building },
     { value: 'hybrid', label: 'Hybrid', icon: Home }
   ];
 
   const experienceLevels = ['entry-level', 'mid-level', 'senior-level', 'executive'];
   const industries = ['Technology', 'Finance', 'Healthcare', 'Marketing', 'Design', 'Education', 'Consulting'];
 
   const handleInputChange = (field, value) => {
     setFormData(prev => ({ ...prev, [field]: value }));
   };
 
   const handleAddItem = (field, value, setValue) => {
     if (value.trim() && !formData[field].includes(value.trim())) {
       setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
       setValue('');
     }
   };
 
   const handleRemoveItem = (field, item) => {
     setFormData(prev => ({
       ...prev,
       [field]: prev[field].filter(i => i !== item)
     }));
   };
 
   const handleSubmit = async () => {
     if (!user) {
       toast.error('Please login to post a job');
       return;
     }
 
     if (!formData.title.trim() || !formData.company_name.trim() || !formData.description.trim()) {
       toast.error('Please fill in all required fields');
       return;
     }
 
     setLoading(true);
     try {
       const jobData = {
         title: formData.title.trim(),
         company_name: formData.company_name.trim(),
         location: formData.location.trim(),
         job_type: formData.job_type,
         work_mode: formData.work_mode,
         experience_level: formData.experience_level,
         industry: formData.industry,
         description: formData.description.trim(),
         skills_required: formData.skills_required,
         requirements: formData.requirements,
         benefits: formData.benefits,
         employer_id: user.id
       };
 
       if (formData.salary_min && formData.salary_max) {
         jobData.salary_min = parseInt(formData.salary_min);
         jobData.salary_max = parseInt(formData.salary_max);
         jobData.salary_currency = formData.salary_currency;
       }
 
       const { error } = await supabase.from('jobs').insert(jobData);
 
       if (error) throw error;
 
       toast.success('Job Posted!', {
         description: `"${formData.title}" is now live`
       });
 
       setFormData({
         title: '', company_name: '', location: '', job_type: 'full-time',
         work_mode: 'remote', experience_level: 'mid-level', industry: 'Technology',
         description: '', salary_min: '', salary_max: '', salary_currency: 'USD',
         skills_required: [], requirements: [], benefits: []
       });
       onSuccess?.();
       onClose();
     } catch (error) {
       console.error('Error posting job:', error);
       toast.error('Failed to post job');
     } finally {
       setLoading(false);
     }
   };
 
   if (!isOpen) return null;
 
   return (
     <div className="fixed inset-0 z-[100] bg-white flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
         <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
           <X className="w-5 h-5" />
         </Button>
         
         <div className="flex items-center gap-2">
           <Briefcase className="w-5 h-5 text-orange-600" />
           <span className="font-semibold text-gray-800">Post a Job</span>
         </div>
 
         <Button
           onClick={handleSubmit}
           disabled={!formData.title.trim() || !formData.company_name.trim() || loading}
           className={cn(
             "rounded-full px-5 font-semibold",
             formData.title.trim() && formData.company_name.trim()
               ? "bg-gradient-to-r from-orange-600 to-red-600 text-white" 
               : "bg-gray-200 text-gray-400"
           )}
         >
           {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
         </Button>
       </div>
 
       {/* Content */}
       <ScrollArea className="flex-1">
         <div className="p-4 space-y-6">
           {/* Job Title */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-orange-500" />
               Job Title *
             </Label>
             <Input
               value={formData.title}
               onChange={(e) => handleInputChange('title', e.target.value)}
               placeholder="e.g. Senior Software Developer"
               className="h-12 text-lg"
             />
           </div>
 
           {/* Company Name */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold flex items-center gap-2">
               <Building className="w-4 h-4" />
               Company Name *
             </Label>
             <Input
               value={formData.company_name}
               onChange={(e) => handleInputChange('company_name', e.target.value)}
               placeholder="Your company name"
             />
           </div>
 
           {/* Location */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold flex items-center gap-2">
               <MapPin className="w-4 h-4 text-red-500" />
               Location
             </Label>
             <Input
               value={formData.location}
               onChange={(e) => handleInputChange('location', e.target.value)}
               placeholder="City, Country or Remote"
             />
           </div>
 
           {/* Work Mode */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Work Mode</Label>
             <div className="grid grid-cols-3 gap-2">
               {workModes.map((mode) => (
                 <Button
                   key={mode.value}
                   type="button"
                   variant={formData.work_mode === mode.value ? "default" : "outline"}
                   onClick={() => handleInputChange('work_mode', mode.value)}
                   className={cn(
                     "h-14 flex-col gap-1",
                     formData.work_mode === mode.value && "bg-orange-600 hover:bg-orange-700"
                   )}
                 >
                   <mode.icon className="w-4 h-4" />
                   <span className="text-xs">{mode.label}</span>
                 </Button>
               ))}
             </div>
           </div>
 
           {/* Job Type */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Job Type</Label>
             <div className="grid grid-cols-2 gap-2">
               {jobTypes.map((type) => (
                 <Button
                   key={type.value}
                   type="button"
                   variant={formData.job_type === type.value ? "default" : "outline"}
                   size="sm"
                   onClick={() => handleInputChange('job_type', type.value)}
                   className={cn(
                     formData.job_type === type.value && "bg-orange-600 hover:bg-orange-700"
                   )}
                 >
                   {formData.job_type === type.value && <CheckCircle2 className="w-3 h-3 mr-1" />}
                   {type.label}
                 </Button>
               ))}
             </div>
           </div>
 
           {/* Experience Level */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Experience Level</Label>
             <div className="flex flex-wrap gap-2">
               {experienceLevels.map((level) => (
                 <Button
                   key={level}
                   type="button"
                   variant={formData.experience_level === level ? "default" : "outline"}
                   size="sm"
                   onClick={() => handleInputChange('experience_level', level)}
                   className={cn(
                     "rounded-full",
                     formData.experience_level === level && "bg-orange-600 hover:bg-orange-700"
                   )}
                 >
                   {level.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                 </Button>
               ))}
             </div>
           </div>
 
           {/* Industry */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Industry</Label>
             <div className="flex flex-wrap gap-2">
               {industries.map((ind) => (
                 <Button
                   key={ind}
                   type="button"
                   variant={formData.industry === ind ? "default" : "outline"}
                   size="sm"
                   onClick={() => handleInputChange('industry', ind)}
                   className={cn(
                     "rounded-full",
                     formData.industry === ind && "bg-orange-600 hover:bg-orange-700"
                   )}
                 >
                   {ind}
                 </Button>
               ))}
             </div>
           </div>
 
           {/* Description */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Job Description *</Label>
             <Textarea
               value={formData.description}
               onChange={(e) => handleInputChange('description', e.target.value)}
               placeholder="Describe the role, responsibilities..."
               rows={5}
             />
           </div>
 
           {/* Salary */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold flex items-center gap-2">
               <DollarSign className="w-4 h-4 text-green-500" />
               Salary Range (Optional)
             </Label>
             <div className="grid grid-cols-3 gap-2">
               <Input
                 type="number"
                 value={formData.salary_min}
                 onChange={(e) => handleInputChange('salary_min', e.target.value)}
                 placeholder="Min"
               />
               <Input
                 type="number"
                 value={formData.salary_max}
                 onChange={(e) => handleInputChange('salary_max', e.target.value)}
                 placeholder="Max"
               />
               <select
                 value={formData.salary_currency}
                 onChange={(e) => handleInputChange('salary_currency', e.target.value)}
                 className="border rounded-lg px-3"
               >
                 <option value="USD">USD</option>
                 <option value="EUR">EUR</option>
                 <option value="GBP">GBP</option>
                 <option value="INR">INR</option>
               </select>
             </div>
           </div>
 
           {/* Skills */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Required Skills</Label>
             <div className="flex gap-2">
               <Input
                 value={newSkill}
                 onChange={(e) => setNewSkill(e.target.value)}
                 placeholder="Add skills..."
                 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('skills_required', newSkill, setNewSkill))}
               />
               <Button type="button" onClick={() => handleAddItem('skills_required', newSkill, setNewSkill)} variant="outline" size="icon">
                 <Plus className="w-4 h-4" />
               </Button>
             </div>
             {formData.skills_required.length > 0 && (
               <div className="flex flex-wrap gap-2 mt-2">
                 {formData.skills_required.map((skill, idx) => (
                   <Badge key={idx} variant="secondary" className="gap-1">
                     {skill}
                     <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveItem('skills_required', skill)} />
                   </Badge>
                 ))}
               </div>
             )}
           </div>
 
           {/* Benefits */}
           <div className="space-y-2">
             <Label className="text-sm font-semibold">Benefits & Perks</Label>
             <div className="flex gap-2">
               <Input
                 value={newBenefit}
                 onChange={(e) => setNewBenefit(e.target.value)}
                 placeholder="Add benefits..."
                 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('benefits', newBenefit, setNewBenefit))}
               />
               <Button type="button" onClick={() => handleAddItem('benefits', newBenefit, setNewBenefit)} variant="outline" size="icon">
                 <Plus className="w-4 h-4" />
               </Button>
             </div>
             {formData.benefits.length > 0 && (
               <div className="flex flex-wrap gap-2 mt-2">
                 {formData.benefits.map((benefit, idx) => (
                   <Badge key={idx} className="gap-1 bg-green-100 text-green-700">
                     {benefit}
                     <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveItem('benefits', benefit)} />
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
 
 export default FullPageJobCreator;