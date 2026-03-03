import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Users, Briefcase, Calendar, FileText, Building2, MapPin, Loader2 } from "lucide-react";

const STATIC_PAGES = [
  { path: "/", label: "Home", icon: Globe },
  { path: "/login", label: "Login", icon: Users },
  { path: "/signup", label: "Sign Up", icon: Users },
  { path: "/forget-password", label: "Forgot Password", icon: Users },
  { path: "/demo", label: "Demo", icon: Globe },
  { path: "/contact", label: "Contact", icon: Globe },
  { path: "/faq", label: "FAQ", icon: Globe },
  { path: "/dashboard", label: "Dashboard", icon: Globe },
  { path: "/network", label: "Network", icon: Users },
  { path: "/messages", label: "Messages", icon: Users },
  { path: "/notifications", label: "Notifications", icon: Globe },
  { path: "/connections", label: "Connections", icon: Users },
  { path: "/communities", label: "Communities", icon: Users },
  { path: "/settings", label: "Settings", icon: Globe },
  { path: "/events", label: "Events", icon: Calendar },
  { path: "/insights", label: "Insights", icon: Globe },
  { path: "/ai-assistant", label: "AI Assistant", icon: Globe },
  { path: "/jobs", label: "Jobs", icon: Briefcase },
  { path: "/my-businesses", label: "My Businesses", icon: Building2 },
  { path: "/business-setup", label: "Business Setup", icon: Building2 },
  { path: "/sitemap", label: "Sitemap", icon: MapPin },
];

const Sitemap = () => {
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDynamic = async () => {
      setLoading(true);
      const [profilesRes, postsRes, communitiesRes] = await Promise.all([
        supabase.from("profiles").select("id, username, full_name").not("username", "is", null).order("created_at", { ascending: false }).limit(200),
        supabase.from("posts").select("id, user_id, content, created_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("communities").select("id, name").order("created_at", { ascending: false }).limit(100),
      ]);

      const profilesList = profilesRes.data || [];
      setProfiles(profilesList);
      setCommunities(communitiesRes.data || []);

      // Map posts with usernames
      const userIds = [...new Set((postsRes.data || []).map((p) => p.user_id))];
      const profileMap = {};
      profilesList.forEach((p) => { profileMap[p.id] = p.username; });

      // Fetch missing usernames
      const missingIds = userIds.filter((id) => !profileMap[id]);
      if (missingIds.length > 0) {
        const { data: extra } = await supabase.from("profiles").select("id, username").in("id", missingIds);
        (extra || []).forEach((p) => { profileMap[p.id] = p.username; });
      }

      setPosts(
        (postsRes.data || [])
          .filter((p) => profileMap[p.user_id])
          .map((p) => ({
            ...p,
            username: profileMap[p.user_id],
            snippet: p.content?.substring(0, 60) || "Post",
          }))
      );
      setLoading(false);
    };
    fetchDynamic();
  }, []);

  const SectionHeader = ({ icon: Icon, title, count }) => (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-5 h-5 text-primary" />
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {count !== undefined && (
        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{count}</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Sitemap</h1>
          <p className="text-sm text-muted-foreground">All pages and content on BizBase AI</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Static Pages */}
          <div className="bg-card rounded-xl border border-border p-5">
            <SectionHeader icon={Globe} title="Pages" count={STATIC_PAGES.length} />
            <ul className="space-y-1.5">
              {STATIC_PAGES.map((page) => (
                <li key={page.path}>
                  <Link to={page.path} className="text-sm text-primary hover:underline flex items-center gap-1.5">
                    <page.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {page.label}
                    <span className="text-[10px] text-muted-foreground ml-auto">{page.path}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User Profiles */}
          <div className="bg-card rounded-xl border border-border p-5">
            <SectionHeader icon={Users} title="User Profiles" count={profiles.length} />
            <ul className="space-y-1 max-h-[400px] overflow-y-auto">
              {profiles.map((p) => (
                <li key={p.id}>
                  <Link to={`/${p.username}`} className="text-sm text-primary hover:underline flex items-center justify-between">
                    <span>@{p.username}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{p.full_name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Posts */}
          <div className="bg-card rounded-xl border border-border p-5 md:col-span-2">
            <SectionHeader icon={FileText} title="Posts" count={posts.length} />
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/${p.username}/post/${p.id}`}
                    className="text-sm text-primary hover:underline block truncate"
                    title={p.snippet}
                  >
                    {p.snippet}...
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Communities */}
          {communities.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5 md:col-span-2">
              <SectionHeader icon={Users} title="Communities" count={communities.length} />
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {communities.map((c) => (
                  <li key={c.id}>
                    <Link to={`/communities/${c.id}`} className="text-sm text-primary hover:underline">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border bg-card mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center">
          <Link to="/" className="text-sm text-primary hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
