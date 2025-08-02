import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all active jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true);

    if (jobsError || !jobs) {
      return new Response(JSON.stringify({ error: 'Failed to fetch jobs' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's applied jobs to exclude them
    const { data: appliedJobs } = await supabase
      .from('job_applications')
      .select('job_id')
      .eq('applicant_id', userId);

    const appliedJobIds = new Set(appliedJobs?.map(app => app.job_id) || []);
    const availableJobs = jobs.filter(job => !appliedJobIds.has(job.id));

    if (availableJobs.length === 0) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create user profile summary for AI analysis
    const userSkills = profile.skills || [];
    const userIndustry = profile.industry || '';
    const userExperience = profile.experience_years || 0;
    const userPosition = profile.current_position || '';
    const userLocation = profile.location || '';

    const userProfileSummary = `
User Profile:
- Current Position: ${userPosition}
- Industry: ${userIndustry}
- Experience: ${userExperience} years
- Location: ${userLocation}
- Skills: ${userSkills.join(', ')}
- Bio: ${profile.bio || 'Not provided'}
`;

    // Create jobs summary for AI analysis
    const jobsSummary = availableJobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company_name,
      industry: job.industry,
      location: job.location,
      experience_level: job.experience_level,
      skills_required: job.skills_required,
      job_type: job.job_type,
      work_mode: job.work_mode,
      description: job.description.substring(0, 200) + '...',
      salary_range: job.salary_min && job.salary_max ? `${job.salary_min}-${job.salary_max} ${job.salary_currency}` : 'Not specified'
    }));

    // Use OpenAI to analyze and rank jobs
    const prompt = `
You are an AI career advisor. Analyze the user profile and rank the following jobs based on how well they match the user's background, skills, and career progression.

${userProfileSummary}

Available Jobs:
${JSON.stringify(jobsSummary, null, 2)}

Please provide a response in the following JSON format:
{
  "recommendations": [
    {
      "job_id": "job_id_here",
      "match_score": 95,
      "reasons": [
        "Strong skill match with React and JavaScript",
        "Perfect experience level alignment",
        "Industry expertise in Technology"
      ],
      "growth_potential": "This role offers excellent growth opportunities in senior engineering positions"
    }
  ]
}

Rank jobs by match score (0-100), considering:
1. Skill alignment (40%)
2. Experience level fit (25%)
3. Industry match (20%)
4. Location preference (10%)
5. Career progression potential (5%)

Only include jobs with match score >= 60. Limit to top 10 recommendations.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI career advisor that provides accurate job recommendations based on user profiles.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const aiResult = await response.json();
    const aiRecommendations = JSON.parse(aiResult.choices[0].message.content);

    // Enrich recommendations with full job details
    const enrichedRecommendations = aiRecommendations.recommendations.map((rec: any) => {
      const job = availableJobs.find(j => j.id === rec.job_id);
      return {
        ...rec,
        job: job
      };
    }).filter((rec: any) => rec.job); // Filter out any recommendations where job wasn't found

    return new Response(JSON.stringify({ 
      recommendations: enrichedRecommendations,
      total_jobs_analyzed: availableJobs.length,
      user_profile_completion: profile.profile_completion_score || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-job-recommendations function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});