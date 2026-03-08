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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check admin role using the has_role function
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    })

    if (roleError) {
      console.error('Role check error:', roleError)
      return new Response(JSON.stringify({ error: 'Role check failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { method } = await req.json().catch(() => ({ method: 'verify' }))

    if (method === 'verify') {
      return new Response(JSON.stringify({ isAdmin: !!isAdmin }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Admin-only operations below
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'getStats') {
      const [users, posts, businesses, jobs, communities, events] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('businesses').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('communities').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
      ])

      return new Response(JSON.stringify({
        stats: {
          totalUsers: users.count || 0,
          totalPosts: posts.count || 0,
          totalBusinesses: businesses.count || 0,
          totalJobs: jobs.count || 0,
          totalCommunities: communities.count || 0,
          totalEvents: events.count || 0,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'getUsers') {
      const { page = 1, limit = 20, search = '' } = await req.json().catch(() => ({}))
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)
      
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`)
      }

      const { data, error, count } = await query
      if (error) throw error

      return new Response(JSON.stringify({ users: data, total: count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'getPosts') {
      const { data, error } = await supabase.from('posts')
        .select('*, profiles:user_id(full_name, avatar_url, username)')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return new Response(JSON.stringify({ posts: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'deletePost') {
      const { postId } = await req.json().catch(() => ({}))
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'deleteUser') {
      const { userId } = await req.json().catch(() => ({}))
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'getBusinesses') {
      const { data, error } = await supabase.from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return new Response(JSON.stringify({ businesses: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown method' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Admin verify error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
