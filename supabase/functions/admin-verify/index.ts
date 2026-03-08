import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No auth header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    const { method = 'verify', search = '', postId, userId, businessId, jobId, communityId, eventId } = body

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    })

    if (method === 'verify') {
      return new Response(JSON.stringify({ isAdmin: !!isAdmin }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const json = (data: unknown) => new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

    // ─── STATS ───
    if (method === 'getStats') {
      const [users, posts, businesses, jobs, communities, events, connections, messages] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('businesses').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('communities').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('connections').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
      ])

      // Recent signups (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      
      const [recentUsers, recentPosts, recentBusinesses, monthlyUsers, monthlyPosts] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
        supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
        supabase.from('businesses').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
        supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
      ])

      return json({
        stats: {
          totalUsers: users.count || 0,
          totalPosts: posts.count || 0,
          totalBusinesses: businesses.count || 0,
          totalJobs: jobs.count || 0,
          totalCommunities: communities.count || 0,
          totalEvents: events.count || 0,
          totalConnections: connections.count || 0,
          totalMessages: messages.count || 0,
          recentUsers: recentUsers.count || 0,
          recentPosts: recentPosts.count || 0,
          recentBusinesses: recentBusinesses.count || 0,
          monthlyUsers: monthlyUsers.count || 0,
          monthlyPosts: monthlyPosts.count || 0,
        }
      })
    }

    // ─── RECENT ACTIVITY ───
    if (method === 'getRecentActivity') {
      const [recentUsersData, recentPostsData, recentBusinessesData] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('posts').select('id, content, created_at, user_id, profiles:user_id(full_name, avatar_url)').order('created_at', { ascending: false }).limit(5),
        supabase.from('businesses').select('id, name, logo_url, created_at, industry').order('created_at', { ascending: false }).limit(5),
      ])

      return json({
        recentUsers: recentUsersData.data || [],
        recentPosts: recentPostsData.data || [],
        recentBusinesses: recentBusinessesData.data || [],
      })
    }

    // ─── GROWTH DATA (for charts) ───
    if (method === 'getGrowthData') {
      // Get user signups per day for last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      
      const [usersData, postsData] = await Promise.all([
        supabase.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
        supabase.from('posts').select('created_at').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
      ])

      // Aggregate by day
      const aggregateByDay = (items: any[]) => {
        const counts: Record<string, number> = {}
        for (const item of items || []) {
          const day = item.created_at.split('T')[0]
          counts[day] = (counts[day] || 0) + 1
        }
        return counts
      }

      const usersByDay = aggregateByDay(usersData.data || [])
      const postsByDay = aggregateByDay(postsData.data || [])

      // Build 30-day array
      const days = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const key = d.toISOString().split('T')[0]
        days.push({
          date: key,
          label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          users: usersByDay[key] || 0,
          posts: postsByDay[key] || 0,
        })
      }

      return json({ growthData: days })
    }

    // ─── USERS ───
    if (method === 'getUsers') {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50)
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`)
      }
      const { data, error } = await query
      if (error) throw error
      return json({ users: data })
    }

    // ─── TOGGLE USER VERIFICATION ───
    if (method === 'toggleUserVerification') {
      if (!userId) throw new Error('userId required')
      const { data: profile } = await supabase.from('profiles').select('is_verified').eq('id', userId).single()
      const { error } = await supabase.from('profiles').update({ is_verified: !profile?.is_verified }).eq('id', userId)
      if (error) throw error
      return json({ success: true, is_verified: !profile?.is_verified })
    }

    // ─── UPDATE USER BIZCOINS ───
    if (method === 'updateUserBizcoins') {
      if (!userId) throw new Error('userId required')
      const { amount } = body
      if (amount === undefined) throw new Error('amount required')
      const { error } = await supabase.from('profiles').update({ bizcoins: amount }).eq('id', userId)
      if (error) throw error
      return json({ success: true })
    }

    // ─── POSTS ───
    if (method === 'getPosts') {
      const { data, error } = await supabase.from('posts')
        .select('*, profiles:user_id(full_name, avatar_url, username)')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return json({ posts: data })
    }

    if (method === 'deletePost') {
      if (!postId) throw new Error('postId required')
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) throw error
      return json({ success: true })
    }

    // ─── USERS DELETE ───
    if (method === 'deleteUser') {
      if (!userId) throw new Error('userId required')
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error
      return json({ success: true })
    }

    // ─── BUSINESSES ───
    if (method === 'getBusinesses') {
      const { data, error } = await supabase.from('businesses')
        .select('*, profiles:owner_id(full_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return json({ businesses: data })
    }

    if (method === 'deleteBusiness') {
      if (!businessId) throw new Error('businessId required')
      // Delete related data first
      await Promise.all([
        supabase.from('business_leads').delete().eq('business_id', businessId),
        supabase.from('business_projects').delete().eq('business_id', businessId),
        supabase.from('business_services').delete().eq('business_id', businessId),
        supabase.from('business_team_members').delete().eq('business_id', businessId),
        supabase.from('business_transactions').delete().eq('business_id', businessId),
      ])
      const { error } = await supabase.from('businesses').delete().eq('id', businessId)
      if (error) throw error
      return json({ success: true })
    }

    if (method === 'toggleBusinessStatus') {
      if (!businessId) throw new Error('businessId required')
      const { data: biz } = await supabase.from('businesses').select('status').eq('id', businessId).single()
      const newStatus = biz?.status === 'active' ? 'suspended' : 'active'
      const { error } = await supabase.from('businesses').update({ status: newStatus }).eq('id', businessId)
      if (error) throw error
      return json({ success: true, status: newStatus })
    }

    // ─── JOBS ───
    if (method === 'getJobs') {
      const { data, error } = await supabase.from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return json({ jobs: data })
    }

    if (method === 'deleteJob') {
      if (!jobId) throw new Error('jobId required')
      await supabase.from('job_applications').delete().eq('job_id', jobId)
      const { error } = await supabase.from('jobs').delete().eq('id', jobId)
      if (error) throw error
      return json({ success: true })
    }

    if (method === 'toggleJobStatus') {
      if (!jobId) throw new Error('jobId required')
      const { data: job } = await supabase.from('jobs').select('is_active').eq('id', jobId).single()
      const { error } = await supabase.from('jobs').update({ is_active: !job?.is_active }).eq('id', jobId)
      if (error) throw error
      return json({ success: true, is_active: !job?.is_active })
    }

    // ─── COMMUNITIES ───
    if (method === 'getCommunities') {
      const { data, error } = await supabase.from('communities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return json({ communities: data })
    }

    if (method === 'deleteCommunity') {
      if (!communityId) throw new Error('communityId required')
      await supabase.from('community_members').delete().eq('community_id', communityId)
      const { error } = await supabase.from('communities').delete().eq('id', communityId)
      if (error) throw error
      return json({ success: true })
    }

    // ─── EVENTS ───
    if (method === 'getEvents') {
      const { data, error } = await supabase.from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return json({ events: data })
    }

    if (method === 'deleteEvent') {
      if (!eventId) throw new Error('eventId required')
      await supabase.from('event_attendees').delete().eq('event_id', eventId)
      await supabase.from('saved_events').delete().eq('event_id', eventId)
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) throw error
      return json({ success: true })
    }

    return new Response(JSON.stringify({ error: 'Unknown method' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Admin error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
