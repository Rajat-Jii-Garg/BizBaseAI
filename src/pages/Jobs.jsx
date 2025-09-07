import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Clock, DollarSign, Building, Users, Search, Filter, Bookmark, BookmarkCheck, Brain, Target, Plus, Eye, Briefcase, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import CreateJobModal from '@/components/CreateJobModal';

const Jobs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [applicationData, setApplicationData] = useState({
    job_id: '',
    cover_letter: '',
    resume_url: ''
  });
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
      fetchAppliedJobs();
      fetchAIRecommendations();
    }
  }, [user]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedIndustry, selectedJobType, selectedWorkMode, selectedExperience]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      setSavedJobs(new Set(data?.map(item => item.job_id) || []));
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('applicant_id', user?.id);

      if (error) throw error;
      setAppliedJobs(new Set(data?.map(item => item.job_id) || []));
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  const fetchAIRecommendations = async () => {
    if (!user) return;
    
    setLoadingRecommendations(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-job-recommendations', {
        body: { userId: user.id }
      });

      if (error) throw error;
      setRecommendations(data?.recommendations || []);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills_required?.some(skill => skill?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedIndustry) {
      filtered = filtered.filter(job => job.industry === selectedIndustry);
    }

    if (selectedJobType) {
      filtered = filtered.filter(job => job.job_type === selectedJobType);
    }

    if (selectedWorkMode) {
      filtered = filtered.filter(job => job.work_mode === selectedWorkMode);
    }

    if (selectedExperience) {
      filtered = filtered.filter(job => job.experience_level === selectedExperience);
    }

    setFilteredJobs(filtered);
  };

  const handleSaveJob = async (jobId) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to save jobs.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (savedJobs.has(jobId)) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('job_id', jobId)
          .eq('user_id', user.id);

        if (error) throw error;
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast({
          title: "Job Removed",
          description: "Job removed from saved list.",
        });
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_jobs')
          .insert({
            job_id: jobId,
            user_id: user.id
          });

        if (error) throw error;
        setSavedJobs(prev => new Set([...prev, jobId]));
        toast({
          title: "Job Saved",
          description: "Job added to your saved list.",
        });
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: "Error",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyJob = async (jobId) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to apply for jobs.",
        variant: "destructive",
      });
      return;
    }

    setApplicationData({ ...applicationData, job_id: jobId });
    setShowApplicationModal(true);
  };

  const submitApplication = async () => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: applicationData.job_id,
          applicant_id: user?.id,
          cover_letter: applicationData.cover_letter,
          resume_url: applicationData.resume_url
        });

      if (error) throw error;

      setAppliedJobs(prev => new Set([...prev, applicationData.job_id]));
      setShowApplicationModal(false);
      setApplicationData({ job_id: '', cover_letter: '', resume_url: '' });

      toast({
        title: "Application Submitted",
        description: "Your job application has been submitted successfully.",
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const incrementJobViews = async (jobId) => {
    try {
      const { error } = await supabase.rpc('increment_job_views', { job_id: jobId });
      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing job views:', error);
    }
  };

  const formatSalary = (min, max, currency) => {
    const formatNumber = (num) => {
      return new Intl.NumberFormat('en-US').format(num);
    };
    return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const getUniqueValues = (key) => {
    return [...new Set(jobs.map(job => job[key]))].filter(Boolean);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading jobs...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs Portal</h1>
              <p className="text-gray-600">Discover opportunities that match your skills and career goals</p>
            </div>
            <div className="flex gap-3">
              <CreateJobModal onJobCreated={fetchJobs} />
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Jobs</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">{jobs.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Active Employers</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">{[...new Set(jobs.map(job => job.company_name))].length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Remote Jobs</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{jobs.filter(job => job.work_mode === 'remote').length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Saved Jobs</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-1">{savedJobs.size}</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-industries">All Industries</SelectItem>
                  {getUniqueValues('industry').map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  {getUniqueValues('job_type').map(type => (
                    <SelectItem key={type} value={type}>
                      {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedWorkMode} onValueChange={setSelectedWorkMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Work Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Modes</SelectItem>
                  {getUniqueValues('work_mode').map(mode => (
                    <SelectItem key={mode} value={mode}>
                      {mode.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-levels">All Levels</SelectItem>
                  {getUniqueValues('experience_level').map(level => (
                    <SelectItem key={level} value={level}>
                      {level.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {user && showRecommendations && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">AI Recommended Jobs</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAIRecommendations}
                disabled={loadingRecommendations}
              >
                {loadingRecommendations ? 'Analyzing...' : 'Refresh'}
              </Button>
            </div>
            
            {loadingRecommendations ? (
              <div className="text-center py-8">
                <div className="text-gray-600">AI is analyzing your profile and matching jobs...</div>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.slice(0, 4).map((rec) => rec.job ? (
                  <Card key={rec.job_id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{rec.job.title}</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {rec.match_score}% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.job.company_name} • {rec.job.location}</p>
                      <div className="text-xs text-blue-600 mb-2">
                        <Target className="h-3 w-3 inline mr-1" />
                        {rec.reasons.slice(0, 2).join(', ')}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApplyJob(rec.job_id)}>
                          Quick Apply
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSaveJob(rec.job_id)}>
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Complete your profile to get AI-powered job recommendations!</p>
              </div>
            )}
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
            </h2>
          </div>

          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 
                        className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                        onClick={() => incrementJobViews(job.id)}
                      >
                        {job.title}
                      </h3>
                      {job.is_featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Featured</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{job.company_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{job.views_count} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{job.applications_count} applications</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{job.job_type.replace('-', ' ')}</Badge>
                      <Badge variant="outline">{job.work_mode.replace('-', ' ')}</Badge>
                      <Badge variant="outline">{job.experience_level.replace('-', ' ')}</Badge>
                      <Badge variant="outline">{job.industry}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {Array.isArray(job.skills_required) &&
                        job.skills_required.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))
                      }
                      {job.skills_required.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.skills_required.length - 5} more
                        </Badge>
                      )}
                    </div>

                    {job.salary_min && job.salary_max && (
                      <div className="flex items-center gap-1 text-green-600 font-medium mb-4">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)} per year
                        </span>
                      </div>
                    )}

                    {job.benefits && job.benefits.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(job.benefits) &&
                            job.benefits.slice(0, 3).map((benefit, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {benefit}
                              </Badge>
                            ))
                          }
                          {job.benefits.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.benefits.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {job.application_deadline && (
                      <div className="text-sm text-red-600 mb-4">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Apply by: {new Date(job.application_deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveJob(job.id)}
                      className="p-2"
                    >
                      {savedJobs.has(job.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {appliedJobs.has(job.id) ? (
                      <Button variant="outline" size="sm" disabled>
                        Applied
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApplyJob(job.id)}
                      >
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredJobs.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Application Modal */}
        <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Apply for Job</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Cover Letter *
                </label>
                <Textarea
                  placeholder="Write a compelling cover letter..."
                  value={applicationData.cover_letter}
                  onChange={(e) => setApplicationData({
                    ...applicationData,
                    cover_letter: e.target.value
                  })}
                  rows={6}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Resume URL (Optional)
                </label>
                <Input
                  placeholder="https://example.com/resume.pdf"
                  value={applicationData.resume_url}
                  onChange={(e) => setApplicationData({
                    ...applicationData,
                    resume_url: e.target.value
                  })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowApplicationModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitApplication}
                  disabled={!applicationData.cover_letter.trim()}
                >
                  Submit Application
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
