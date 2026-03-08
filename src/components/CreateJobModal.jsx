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
  Briefcase, 
  MapPin, 
  DollarSign,
  Calendar,
  Users,
  Building
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateJobModal = ({ onJobCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    location: '',
    job_type: 'full-time',
    work_mode: 'on-site',
    experience_level: 'mid-level',
    industry: '',
    description: '',
    requirements: [],
    skills_required: [],
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    benefits: [],
    application_deadline: '',
    is_featured: false
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' }
  ];

  const workModes = [
    { value: 'on-site', label: 'On-site' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const experienceLevels = [
    { value: 'entry-level', label: 'Entry Level' },
    { value: 'mid-level', label: 'Mid Level' },
    { value: 'senior-level', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' }
  ];

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing',
    'Sales', 'Design', 'Engineering', 'Manufacturing', 'Retail',
    'Media', 'Consulting', 'Legal', 'Real Estate', 'Transportation'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddItem = (itemType, newItem, setNewItem) => {
    if (newItem.trim() && !formData[itemType].includes(newItem.trim())) {
      setFormData(prev => ({
        ...prev,
        [itemType]: [...prev[itemType], newItem.trim()]
      }));
      setNewItem('');
    }
  };

  const handleRemoveItem = (itemType, itemToRemove) => {
    setFormData(prev => ({
      ...prev,
      [itemType]: prev[itemType].filter(item => item !== itemToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to post a job",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim() || !formData.company_name.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
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
        requirements: formData.requirements,
        skills_required: formData.skills_required,
        benefits: formData.benefits,
        is_featured: formData.is_featured,
        employer_id: user.id
      };

      // Add salary if provided
      if (formData.salary_min && formData.salary_max) {
        jobData.salary_min = parseInt(formData.salary_min);
        jobData.salary_max = parseInt(formData.salary_max);
        jobData.salary_currency = formData.salary_currency;
      }

      // Add deadline if provided
      if (formData.application_deadline) {
        jobData.application_deadline = formData.application_deadline;
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Job Posted Successfully!",
        description: `"${formData.title}" has been posted and is now live.`
      });

      // Reset form
      setFormData({
        title: '',
        company_name: '',
        location: '',
        job_type: 'full-time',
        work_mode: 'on-site',
        experience_level: 'mid-level',
        industry: '',
        description: '',
        requirements: [],
        skills_required: [],
        salary_min: '',
        salary_max: '',
        salary_currency: 'USD',
        benefits: [],
        application_deadline: '',
        is_featured: false
      });

      setOpen(false);
      
      if (onJobCreated) {
        onJobCreated();
      }

    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full h-9 px-3 sm:px-4 text-xs sm:text-sm">
          <Plus className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Post Job</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Post a New Job
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-5 h-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Senior Software Developer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Your company name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. New York, NY or Remote"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_type">Job Type</Label>
                  <Select value={formData.job_type} onValueChange={(value) => handleInputChange('job_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_mode">Work Mode</Label>
                  <Select value={formData.work_mode} onValueChange={(value) => handleInputChange('work_mode', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {workModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={5}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Salary Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Compensation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">Minimum Salary</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => handleInputChange('salary_min', e.target.value)}
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary_max">Maximum Salary</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => handleInputChange('salary_max', e.target.value)}
                    placeholder="80000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary_currency">Currency</Label>
                  <Select value={formData.salary_currency} onValueChange={(value) => handleInputChange('salary_currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_deadline">Application Deadline (Optional)</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement (e.g., Bachelor's degree in Computer Science)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('requirements', newRequirement, setNewRequirement))}
                />
                <Button type="button" onClick={() => handleAddItem('requirements', newRequirement, setNewRequirement)} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.requirements.length > 0 && (
                <div className="space-y-2">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{req}</span>
                      <X 
                        className="w-4 h-4 cursor-pointer hover:text-red-500" 
                        onClick={() => handleRemoveItem('requirements', req)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g., React, Python, Project Management)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('skills_required', newSkill, setNewSkill))}
                />
                <Button type="button" onClick={() => handleAddItem('skills_required', newSkill, setNewSkill)} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.skills_required.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills_required.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-500" 
                        onClick={() => handleRemoveItem('skills_required', skill)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Benefits & Perks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit (e.g., Health insurance, Flexible hours)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('benefits', newBenefit, setNewBenefit))}
                />
                <Button type="button" onClick={() => handleAddItem('benefits', newBenefit, setNewBenefit)} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {benefit}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-500" 
                        onClick={() => handleRemoveItem('benefits', benefit)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Featured Job Option */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Featured Job</Label>
                  <p className="text-sm text-gray-500">
                    Featured jobs get better visibility and appear at the top of search results
                  </p>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
              </div>
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
              {loading ? 'Posting Job...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobModal;