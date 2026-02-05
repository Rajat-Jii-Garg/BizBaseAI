import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, User, Briefcase, Calendar, Hash, Building2, MapPin, X, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    users: [],
    jobs: [],
    events: [],
    hashtags: [],
    companies: []
  });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch();
    } else {
      setSearchResults({ users: [], jobs: [], events: [], hashtags: [], companies: [] });
      setShowResults(false);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setShowResults(true);
      
      // Search users/profiles
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, current_position, avatar_url, company_name, location')
        .or(`full_name.ilike.%${searchQuery}%,current_position.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`)
        .limit(5);

      // Search jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, job_type, salary_min, salary_max')
        .or(`title.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%,skills_required.cs.{${searchQuery}}`)
        .eq('is_active', true)
        .limit(5);

      // Search events
      const { data: events } = await supabase
        .from('events')
        .select('id, title, description, date, time, location, type')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
        .limit(5);

      // Search hashtags
      const { data: hashtags } = await supabase
        .from('hashtags')
        .select('id, name, usage_count')
        .ilike('name', `%${searchQuery}%`)
        .order('usage_count', { ascending: false })
        .limit(5);

      // Get unique companies from users and jobs
      const companies = new Set();
      users?.forEach(user => user.company_name && companies.add(user.company_name));
      jobs?.forEach(job => job.company_name && companies.add(job.company_name));
      
      const companiesArray = Array.from(companies)
        .filter(company => company.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
        .map((company, index) => ({ id: index, name: company }));

      setSearchResults({
        users: users || [],
        jobs: jobs || [],
        events: events || [],
        hashtags: hashtags || [],
        companies: companiesArray
      });
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
      setSearchQuery('');
    }
  };

  const handleResultClick = (type, item) => {
    setShowResults(false);
    setSearchQuery('');
    
    switch (type) {
      case 'user':
        navigate(`/profile/${item.id}`);
        break;
      case 'job':
        navigate(`/jobs?job=${item.id}`);
        break;
      case 'event':
        navigate(`/events?event=${item.id}`);
        break;
      case 'hashtag':
        navigate(`/feed?hashtag=${item.name}`);
        break;
      case 'company':
        navigate(`/search?q=${encodeURIComponent(item.name)}&type=company`);
        break;
      default:
        break;
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
  };

  const hasResults = searchResults.users.length > 0 || 
                    searchResults.jobs.length > 0 || 
                    searchResults.events.length > 0 || 
                    searchResults.hashtags.length > 0 || 
                    searchResults.companies.length > 0;

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length > 2 && setShowResults(true)}
          className="block w-full pl-7 sm:pl-9 lg:pl-11 pr-10 sm:pr-12 lg:pr-14 py-1.5 sm:py-2 lg:py-3 border border-gray-200 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-gray-200 transition-all text-sm sm:text-base lg:text-lg"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 px-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {/* <Button 
          type="submit"
          size="sm"
          className="absolute right-1 top-1 bottom-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg lg:rounded-xl px-3 lg:px-5 shadow-sm"
        >
          <Search className="h-4 w-4" />
        </Button> */}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="fixed md:absolute top-[68px] md:top-full left-0 right-0 md:left-1/2 md:-translate-x-1/2 mx-2 sm:mx-3 md:mx-0 w-auto md:w-[480px] lg:w-[560px] mt-0 md:mt-2 max-h-[70vh] md:max-h-[65vh] bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]">
          {/* Premium Header */}
          <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-medium text-gray-600">Search Results</span>
          </div>
          
          <ScrollArea className="max-h-[calc(70vh-40px)] md:max-h-[calc(65vh-40px)]">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">Searching...</p>
            </div>
          ) : hasResults ? (
            <div className="py-2">
              {/* Users */}
              {searchResults.users.length > 0 && (
                <div className="px-2 sm:px-3 py-1.5">
                  <div className="flex items-center gap-1.5 px-1 mb-1.5">
                    <User className="w-3 h-3 text-blue-500" />
                    <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">People</h3>
                  </div>
                  {searchResults.users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleResultClick('user', user)}
                      className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent rounded-lg cursor-pointer transition-all duration-200 group"
                    >
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-white shadow-sm">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-medium">
                          {user.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{user.full_name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                          {user.current_position && user.company_name 
                            ? `${user.current_position} at ${user.company_name}`
                            : user.current_position || user.company_name || 'Professional'
                          }
                        </p>
                      </div>
                      {user.location && (
                        <div className="hidden sm:flex items-center text-[10px] text-gray-400">
                          <MapPin className="w-3 h-3 mr-1" />
                          {user.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Jobs */}
              {searchResults.jobs.length > 0 && (
                <div className="px-2 sm:px-3 py-1.5 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 px-1 mb-1.5">
                    <Briefcase className="w-3 h-3 text-green-500" />
                    <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs</h3>
                  </div>
                  {searchResults.jobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleResultClick('job', job)}
                      className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-transparent rounded-lg cursor-pointer transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
                        <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate group-hover:text-green-600 transition-colors">{job.title}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">{job.company_name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 bg-green-50 border-green-200 text-green-700">{job.job_type}</Badge>
                        {job.location && (
                          <div className="hidden sm:flex items-center text-[10px] text-gray-400 mt-1 justify-end">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Events */}
              {searchResults.events.length > 0 && (
                <div className="px-2 sm:px-3 py-1.5 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 px-1 mb-1.5">
                    <Calendar className="w-3 h-3 text-purple-500" />
                    <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Events</h3>
                  </div>
                  {searchResults.events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleResultClick('event', event)}
                      className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent rounded-lg cursor-pointer transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors">{event.title}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 bg-purple-50 border-purple-200 text-purple-700">{event.type}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Hashtags */}
              {searchResults.hashtags.length > 0 && (
                <div className="px-2 sm:px-3 py-1.5 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 px-1 mb-1.5">
                    <TrendingUp className="w-3 h-3 text-blue-500" />
                    <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Trending</h3>
                  </div>
                  {searchResults.hashtags.map((hashtag) => (
                    <div
                      key={hashtag.id}
                      onClick={() => handleResultClick('hashtag', hashtag)}
                      className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent rounded-lg cursor-pointer transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
                        <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">#{hashtag.name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">{hashtag.usage_count} posts</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Companies */}
              {searchResults.companies.length > 0 && (
                <div className="px-2 sm:px-3 py-1.5 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 px-1 mb-1.5">
                    <Building2 className="w-3 h-3 text-orange-500" />
                    <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Companies</h3>
                  </div>
                  {searchResults.companies.map((company) => (
                    <div
                      key={company.id}
                      onClick={() => handleResultClick('company', company)}
                      className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-transparent rounded-lg cursor-pointer transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center shadow-sm">
                        <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">{company.name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">Company</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : searchQuery.length > 2 && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 font-medium">No results found</p>
              <p className="text-xs text-gray-400 mt-1">Try searching for "{searchQuery}"</p>
            </div>
          )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default SearchBar;