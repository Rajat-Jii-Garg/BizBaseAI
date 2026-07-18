import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, Clock, IndianRupee, Building, Users, Search, Filter, Bookmark, BookmarkCheck, Plus, Eye, Briefcase, Calendar, Share2, ExternalLink, BadgeCheck, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import CreateJobModal from '@/components/CreateJobModal';
import SEOHead from '@/components/SEOHead';
import { buildShareUrl } from '@/lib/siteUrl';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());
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
    }
  }, [user]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedIndustry, selectedJobType, selectedWorkMode, selectedExperience]);

  const INDIA_RE = /(india|bharat|bangalore|bengaluru|mumbai|delhi|gurgaon|gurugram|noida|hyderabad|chennai|pune|kolkata|ahmedabad|jaipur|kochi|cochin|indore|chandigarh|lucknow|nagpur|coimbatore|trivandrum|thiruvananthapuram|mysore|mysuru|vadodara|surat|bhubaneswar|visakhapatnam|vizag|goa|kerala|gujarat|maharashtra|karnataka|tamil nadu|telangana|punjab|haryana|rajasthan|uttar pradesh|west bengal|odisha)/i;

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      // India-only: keep internal jobs (posted on BizBase) + external whose location matches India.
      const indiaOnly = (data || []).filter(
        (j) => j.source === 'internal' || INDIA_RE.test(j.location || '')
      );
      setJobs(indiaOnly);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
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
    if (selectedIndustry && selectedIndustry !== "all-industries") {
      filtered = filtered.filter(job => job.industry === selectedIndustry);
    }
    if (selectedJobType && selectedJobType !== "all-types") {
      filtered = filtered.filter(job => job.job_type === selectedJobType);
    }
    if (selectedWorkMode && selectedWorkMode !== "all-modes") {
      filtered = filtered.filter(job => job.work_mode === selectedWorkMode);
    }
    if (selectedExperience && selectedExperience !== "all-levels") {
      filtered = filtered.filter(job => job.experience_level === selectedExperience);
    }
    setFilteredJobs(filtered);
  };

  const handleSaveJob = async (jobId) => {
    if (!user) { toast.error('Please login to save jobs'); return; }
    try {
      if (savedJobs.has(jobId)) {
        const { error } = await supabase.from('saved_jobs').delete().eq('job_id', jobId).eq('user_id', user.id);
        if (error) throw error;
        setSavedJobs(prev => { const n = new Set(prev); n.delete(jobId); return n; });
        toast.success('Job removed from saved');
      } else {
        const { error } = await supabase.from('saved_jobs').insert({ job_id: jobId, user_id: user.id });
        if (error) throw error;
        setSavedJobs(prev => new Set([...prev, jobId]));
        toast.success('Job saved');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  const handleApplyJob = async (job) => {
    if (!job.is_active) {
      toast.error('This job is closed');
      return;
    }
    // External jobs: open original posting in new tab
    if (job.source && job.source !== 'internal' && job.external_url) {
      window.open(job.external_url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!user) { toast.error('Please login to apply'); return; }
    setApplicationData({ ...applicationData, job_id: job.id });
    setShowApplicationModal(true);
  };

  const handleShareJob = async (job) => {
    // Always share BizBase's own job page (never external site URL)
    const url = job.slug
      ? buildShareUrl(`/jobs/${job.slug}`)
      : buildShareUrl(`/jobs?job=${job.id}`);
    const shareData = {
      title: `${job.title} at ${job.company_name} | BizBase Jobs`,
      text: `${job.title} — ${job.company_name} (${job.location}). Apply via BizBase.`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${url}`);
        toast.success('Job link copied!');
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied!');
        } catch { toast.error('Could not share'); }
      }
    }
  };

  const submitApplication = async () => {
    try {
      const { error } = await supabase.from('job_applications').insert({
        job_id: applicationData.job_id,
        applicant_id: user?.id,
        cover_letter: applicationData.cover_letter,
        resume_url: applicationData.resume_url
      });
      if (error) throw error;
      setAppliedJobs(prev => new Set([...prev, applicationData.job_id]));
      setShowApplicationModal(false);
      setApplicationData({ job_id: '', cover_letter: '', resume_url: '' });
      toast.success('Application submitted!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
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
    const cur = currency || 'INR';
    const fmt = (n) => new Intl.NumberFormat(cur === 'INR' ? 'en-IN' : 'en-US').format(n);
    return `${cur} ${fmt(min)} - ${fmt(max)}`;
  };

  const getUniqueValues = (key) => [...new Set(jobs.map(job => job[key]))].filter(Boolean);

  const activeFiltersCount = [selectedIndustry, selectedJobType, selectedWorkMode, selectedExperience]
    .filter(v => v && !v.startsWith('all-')).length;

  const clearFilters = () => {
    setSelectedIndustry('');
    setSelectedJobType('');
    setSelectedWorkMode('');
    setSelectedExperience('');
  };

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.is_active).length;
  const remoteJobs = jobs.filter(j => j.work_mode === 'remote').length;
  const savedCount = savedJobs.size;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading jobs...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEOHead title="Jobs - Find Your Next Opportunity" description="Browse thousands of job listings on BizBase AI. Find remote, hybrid, and on-site opportunities across industries." path="/jobs" />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 lg:space-y-6">

          {/* Header - Title + Post Job button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Trending Jobs</h1>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-0.5 lg:mt-1">Discover opportunities that match your skills</p>
            </div>
            <CreateJobModal onJobCreated={fetchJobs} />
          </div>

          {/* Stats row - compact on mobile, spacious on desktop */}
          <div className="grid grid-cols-4 gap-2 lg:gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg px-2 py-2 lg:px-4 lg:py-4 text-center">
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-primary">{totalJobs}</p>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground leading-tight">Total Jobs</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg px-2 py-2 lg:px-4 lg:py-4 text-center">
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-green-600">{activeJobs}</p>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground leading-tight">Active</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-lg px-2 py-2 lg:px-4 lg:py-4 text-center">
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-amber-600">{remoteJobs}</p>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground leading-tight">Remote</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-lg px-2 py-2 lg:px-4 lg:py-4 text-center">
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-purple-600">{savedCount}</p>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground leading-tight">Saved</p>
            </div>
          </div>

          {/* Search bar + Filter button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-[10px] h-10"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 rounded-[10px] px-3 gap-1.5 shrink-0">
                  <Filter className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Filter</span>
                  {activeFiltersCount > 0 && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full bg-primary text-primary-foreground">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3 space-y-3" align="end">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Filters</span>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs text-muted-foreground">
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-industries">All Industries</SelectItem>
                      {getUniqueValues('industry').map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-types">All Types</SelectItem>
                      {getUniqueValues('job_type').map(t => (
                        <SelectItem key={t} value={t}>{t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedWorkMode} onValueChange={setSelectedWorkMode}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Work Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-modes">All Modes</SelectItem>
                      {getUniqueValues('work_mode').map(m => (
                        <SelectItem key={m} value={m}>{m.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-levels">All Levels</SelectItem>
                      {getUniqueValues('experience_level').map(l => (
                        <SelectItem key={l} value={l}>{l.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Jobs Found heading */}
          <h2 className="text-sm sm:text-base font-semibold text-foreground">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          </h2>

          {/* Jobs List */}
          <div className="space-y-3">
            {filteredJobs.map((job) => {
              const closed = !job.is_active || (job.application_deadline && new Date(job.application_deadline) < new Date());
              return (
              <Card key={job.id} className={`hover:shadow-md transition-shadow border-border/50 ${closed ? 'opacity-70' : ''}`}>
                <CardContent className="p-3 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <h3
                          className="text-sm sm:text-base font-semibold text-foreground cursor-pointer hover:text-primary truncate"
                          onClick={() => incrementJobViews(job.id)}
                        >
                          {job.title}
                        </h3>
                        {closed && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground border-muted-foreground/30 gap-0.5">
                            <Lock className="h-2.5 w-2.5" /> Closed
                          </Badge>
                        )}
                        {job.is_featured && !closed && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800">Featured</Badge>
                        )}
                        {!closed && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary gap-0.5">
                            <BadgeCheck className="h-2.5 w-2.5" /> Verified by BizBase
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1"><Building className="h-3 w-3" />{job.company_name}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                        <span className="hidden sm:flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(job.created_at).toLocaleDateString('en-IN')}</span>
                        <span className="hidden md:flex items-center gap-1"><Eye className="h-3 w-3" />{job.views_count}</span>
                        <span className="hidden md:flex items-center gap-1"><Users className="h-3 w-3" />{job.applications_count} apps</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => handleSaveJob(job.id)}>
                      {savedJobs.has(job.id) ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                    </Button>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">{job.job_type.replace('-', ' ')}</Badge>
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">{job.work_mode.replace('-', ' ')}</Badge>
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">{job.experience_level.replace('-', ' ')}</Badge>
                    {Array.isArray(job.skills_required) && job.skills_required.slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">{skill}</Badge>
                    ))}
                    {job.skills_required?.length > 3 && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">+{job.skills_required.length - 3}</Badge>
                    )}
                  </div>

                  {job.salary_min && job.salary_max && (
                    <p className="text-xs sm:text-sm text-green-600 font-medium mb-2 flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}/yr
                    </p>
                  )}

                  {job.application_deadline && (
                    <p className="text-[10px] sm:text-xs text-destructive mb-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Apply by: {new Date(job.application_deadline).toLocaleDateString('en-IN')}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {closed ? (
                      <Button variant="outline" size="sm" disabled className="text-xs h-8 rounded-full gap-1">
                        <Lock className="h-3 w-3" /> Hiring Closed
                      </Button>
                    ) : appliedJobs.has(job.id) ? (
                      <Button variant="outline" size="sm" disabled className="text-xs h-8 rounded-full">Applied</Button>
                    ) : (
                      <Button size="sm" onClick={() => handleApplyJob(job)} className="text-xs h-8 rounded-full gap-1">
                        {job.source && job.source !== 'internal' ? (<>Apply <ExternalLink className="h-3 w-3" /></>) : 'Apply Now'}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleShareJob(job)} className="text-xs h-8 rounded-full gap-1">
                      <Share2 className="h-3 w-3" /> Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
              );
            })}

            {filteredJobs.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Briefcase className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <h3 className="text-base font-semibold text-foreground mb-1">No jobs found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Application Modal */}
          <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Apply for Job</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Cover Letter *</label>
                  <Textarea
                    placeholder="Write a compelling cover letter..."
                    value={applicationData.cover_letter}
                    onChange={(e) => setApplicationData({ ...applicationData, cover_letter: e.target.value })}
                    rows={5}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Resume URL (Optional)</label>
                  <Input
                    placeholder="https://example.com/resume.pdf"
                    value={applicationData.resume_url}
                    onChange={(e) => setApplicationData({ ...applicationData, resume_url: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowApplicationModal(false)}>Cancel</Button>
                  <Button onClick={submitApplication} disabled={!applicationData.cover_letter.trim()}>Submit</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
