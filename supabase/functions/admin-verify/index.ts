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
    const { method = 'verify', search = '', postId, userId, jobId, businessId, communityId, eventId, verified, status, active } = body

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

    // ─── STATS ───
    if (method === 'getStats') {
      const [users, posts, businesses, jobs, communities, events, connections, messages] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('businesses').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('communities').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('connections').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
      ])

      return new Response(JSON.stringify({
        stats: {
          totalUsers: users.count || 0,
          totalPosts: posts.count || 0,
          totalBusinesses: businesses.count || 0,
          totalJobs: jobs.count || 0,
          totalCommunities: communities.count || 0,
          totalEvents: events.count || 0,
          totalConnections: connections.count || 0,
          totalMessages: messages.count || 0,
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ─── RECENT ACTIVITY ───
    if (method === 'getRecentActivity') {
      const [recentUsers, recentPosts, recentJobs] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('posts').select('id, content, created_at, user_id, profiles:user_id(full_name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('jobs').select('id, title, company_name, created_at').order('created_at', { ascending: false }).limit(5),
      ])

      return new Response(JSON.stringify({
        recentUsers: recentUsers.data || [],
        recentPosts: recentPosts.data || [],
        recentJobs: recentJobs.data || [],
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ─── GROWTH STATS ───
    if (method === 'getGrowthStats') {
      // Get user signups by day for last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const [usersData, postsData] = await Promise.all([
        supabase.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()).order('created_at', { ascending: true }),
        supabase.from('posts').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()).order('created_at', { ascending: true }),
      ])

      // Aggregate by date
      const aggregateByDate = (items: any[]) => {
        const map: Record<string, number> = {}
        for (const item of items) {
          const date = item.created_at?.split('T')[0]
          if (date) map[date] = (map[date] || 0) + 1
        }
        return Object.entries(map).map(([date, count]) => ({ date, count }))
      }

      return new Response(JSON.stringify({
        userGrowth: aggregateByDate(usersData.data || []),
        postGrowth: aggregateByDate(postsData.data || []),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ─── USERS ───
    if (method === 'getUsers') {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100)
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`)
      }
      const { data, error } = await query
      if (error) throw error
      return new Response(JSON.stringify({ users: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'toggleUserVerified') {
      if (!userId) throw new Error('userId required')
      const { error } = await supabase.from('profiles').update({ is_verified: !!verified }).eq('id', userId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'deleteUser') {
      if (!userId) throw new Error('userId required')
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── POSTS ───
    if (method === 'getPosts') {
      let query = supabase.from('posts')
        .select('*, profiles:user_id(full_name, avatar_url, username)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (search) {
        query = query.ilike('content', `%${search}%`)
      }
      const { data, error } = await query
      if (error) throw error
      return new Response(JSON.stringify({ posts: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'deletePost') {
      if (!postId) throw new Error('postId required')
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── BUSINESSES ───
    if (method === 'getBusinesses') {
      let query = supabase.from('businesses').select('*, profiles:owner_id(full_name, email)').order('created_at', { ascending: false }).limit(100)
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      }
      const { data, error } = await query
      if (error) throw error
      return new Response(JSON.stringify({ businesses: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'toggleBusinessVerified') {
      if (!businessId) throw new Error('businessId required')
      const { error } = await supabase.from('businesses').update({ is_verified: !!verified }).eq('id', businessId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'toggleBusinessStatus') {
      if (!businessId || !status) throw new Error('businessId and status required')
      const { error } = await supabase.from('businesses').update({ status }).eq('id', businessId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── JOBS ───
    if (method === 'getJobs') {
      let query = supabase.from('jobs').select('*, profiles:employer_id(full_name, email)').order('created_at', { ascending: false }).limit(100)
      if (search) {
        query = query.or(`title.ilike.%${search}%,company_name.ilike.%${search}%`)
      }
      const { data, error } = await query
      if (error) throw error
      return new Response(JSON.stringify({ jobs: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'toggleJobActive') {
      if (!jobId) throw new Error('jobId required')
      const { error } = await supabase.from('jobs').update({ is_active: !!active }).eq('id', jobId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'deleteJob') {
      if (!jobId) throw new Error('jobId required')
      const { error } = await supabase.from('jobs').delete().eq('id', jobId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── COMMUNITIES ───
    if (method === 'getCommunities') {
      let query = supabase.from('communities').select('*, profiles:user_id(full_name)').order('created_at', { ascending: false }).limit(100)
      if (search) {
        query = query.ilike('name', `%${search}%`)
      }
      const { data, error } = await query
      if (error) throw error
      return new Response(JSON.stringify({ communities: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'deleteCommunity') {
      if (!communityId) throw new Error('communityId required')
      // Delete members first, then community
      await supabase.from('community_members').delete().eq('community_id', communityId)
      const { error } = await supabase.from('communities').delete().eq('id', communityId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── EVENTS ───
    if (method === 'getEvents') {
      let query = supabase.from('events').select('*, profiles:user_id(full_name)').order('created_at', { ascending: false }).limit(100)
      if (search) {
        query = query.ilike('title', `%${search}%`)
      }
      const { data, error } = await query
      if (error) throw error
      return new Response(JSON.stringify({ events: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'deleteEvent') {
      if (!eventId) throw new Error('eventId required')
      await supabase.from('event_attendees').delete().eq('event_id', eventId)
      await supabase.from('saved_events').delete().eq('event_id', eventId)
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── ADMIN ROLES ───
    if (method === 'getAdmins') {
      const { data, error } = await supabase.from('user_roles')
        .select('*, profiles:user_id(full_name, email, avatar_url)')
        .eq('role', 'admin')
      if (error) throw error
      return new Response(JSON.stringify({ admins: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'addAdmin') {
      if (!userId) throw new Error('userId required')
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' })
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'removeAdmin') {
      if (!userId) throw new Error('userId required')
      // Don't allow removing yourself
      if (userId === user.id) {
        return new Response(JSON.stringify({ error: 'Cannot remove yourself as admin' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin')
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
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
