import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen, Clock, Eye, ArrowRight, Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Networking', 'Career', 'Business', 'Technology', 'Leadership'];

  // Featured articles (static for SEO + dynamic from DB)
  const featuredArticles = [
    {
      id: 'featured-1',
      title: 'Top 10 Professional Networking Tips for 2026',
      excerpt: 'Master the art of professional networking with these proven strategies that will help you build meaningful connections and grow your career.',
      category: 'Networking',
      cover_image_url: null,
      created_at: '2026-03-01',
      views_count: 1240,
      slug: 'top-10-networking-tips-2026'
    },
    {
      id: 'featured-2',
      title: 'How AI is Transforming Business Growth',
      excerpt: 'Discover how artificial intelligence is revolutionizing the way professionals build and scale their businesses in the digital age.',
      category: 'Technology',
      cover_image_url: null,
      created_at: '2026-02-25',
      views_count: 890,
      slug: 'ai-transforming-business-growth'
    },
    {
      id: 'featured-3',
      title: 'Building Your Personal Brand on BizBase',
      excerpt: 'Learn how to leverage BizBase\'s AI-powered tools to create a compelling professional presence and stand out in your industry.',
      category: 'Career',
      cover_image_url: null,
      created_at: '2026-02-20',
      views_count: 2100,
      slug: 'building-personal-brand-bizbase'
    },
    {
      id: 'featured-4',
      title: '5 Strategies to Grow Your Network Fast',
      excerpt: 'Proven tactics used by top professionals to rapidly expand their professional network and create lasting business relationships.',
      category: 'Networking',
      cover_image_url: null,
      created_at: '2026-02-15',
      views_count: 1560,
      slug: '5-strategies-grow-network'
    },
    {
      id: 'featured-5',
      title: 'The Future of Remote Work & Business',
      excerpt: 'Explore how remote work is reshaping business landscapes and what professionals need to do to stay ahead of the curve.',
      category: 'Business',
      cover_image_url: null,
      created_at: '2026-02-10',
      views_count: 980,
      slug: 'future-remote-work-business'
    },
    {
      id: 'featured-6',
      title: 'Leadership Skills Every Professional Needs',
      excerpt: 'Essential leadership qualities that set successful professionals apart and how to develop them in your career journey.',
      category: 'Leadership',
      cover_image_url: null,
      created_at: '2026-02-05',
      views_count: 1340,
      slug: 'leadership-skills-professionals'
    },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const allArticles = [...posts, ...featuredArticles];

  const filtered = allArticles.filter(article => {
    const matchSearch = article.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const categoryColors = {
    Networking: 'bg-blue-100 text-blue-700',
    Career: 'bg-green-100 text-green-700',
    Business: 'bg-purple-100 text-purple-700',
    Technology: 'bg-orange-100 text-orange-700',
    Leadership: 'bg-pink-100 text-pink-700',
    General: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-28 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700">
            <BookOpen className="w-3 h-3 mr-1" />
            BizBase Blog
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Insights for <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Professionals</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Expert tips on networking, career growth, and business development to help you succeed.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <Card key={article.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white/30" />
              </div>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`text-xs ${categoryColors[article.category] || categoryColors.General}`}>
                    {article.category}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views_count} views
                  </span>
                  <span className="text-sm font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Articles Found</h3>
            <p className="text-gray-600">Try a different search term or category.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
