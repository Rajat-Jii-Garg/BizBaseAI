import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen, Clock, Eye, ArrowRight, Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

const CATEGORIES = ['All', 'Business', 'Startups', 'Fundraising', 'Technology', 'Career'];

const CATEGORY_CLASSES = {
  Business: 'bg-purple-100 text-purple-700',
  Startups: 'bg-blue-100 text-blue-700',
  Fundraising: 'bg-emerald-100 text-emerald-700',
  Technology: 'bg-orange-100 text-orange-700',
  Career: 'bg-green-100 text-green-700',
  General: 'bg-gray-100 text-gray-700',
};

const Articles = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    let active = true;

    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id,title,slug,excerpt,category,region,source_name,created_at,views_count,cover_image_url,tags')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!active) return;
      if (error) console.error('Error fetching articles:', error);
      setPosts(data || []);
      setLoading(false);
    };

    fetchPosts();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return posts.filter((article) => {
      const haystack = [article.title, article.excerpt, article.source_name, ...(article.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchSearch = !query || haystack.includes(query);
      const matchCategory = selectedCategory === 'All' || article.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [posts, search, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="Business, Startup & Funding News"
        description="Original BizBase editorial coverage of Indian and global business, startup, fundraising, technology and career news, with source links and professional takeaways."
        path="/articles"
      />
      <Navbar />

      <section className="pt-28 pb-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700">
            <BookOpen className="w-3 h-3 mr-1" />
            BizBase Editorial
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Business & Startup Intelligence
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            India and global business, startup, fundraising and technology updates—rewritten as useful professional briefs.
          </p>

          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-base bg-white"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-72 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <Link key={article.id} to={`/articles/${article.slug}`} className="block">
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  {article.cover_image_url ? (
                    <img src={article.cover_image_url} alt={article.title} loading="lazy" className="h-44 w-full object-cover" />
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                      <BookOpen className="w-14 h-14 text-white/30" />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge className={`text-xs ${CATEGORY_CLASSES[article.category] || CATEGORY_CLASSES.General}`}>
                        {article.category || 'General'}
                      </Badge>
                      {article.region && <span className="text-xs text-slate-500">{article.region}</span>}
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(article.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-3">
                      {article.title}
                    </h2>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4">{article.excerpt}</p>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {article.views_count || 0} views
                      </span>
                      <span className="text-sm font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read article <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                    {article.source_name && (
                      <div className="mt-3 text-xs text-slate-400">Source: {article.source_name}</div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Articles Found</h3>
            <p className="text-slate-600">Try another category or search term.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Articles;
