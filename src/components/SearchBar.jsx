import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, User, Briefcase, Calendar, Hash, Building2, MapPin, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
          className="block w-full pl-7 sm:pl-9 lg:pl-11 pr-10 sm:pr-12 lg:pr-14 py-1.5 sm:py-2 lg:py-3 border border-gray-200 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white focus:outline-none focus:ring-0 focus:border-gray-200 transition-all text-sm sm:text-base lg:text-lg"
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
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[95vw] sm:w-[520px] lg:w-[640px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : hasResults ? (
            <div className="py-3 px-1 sm:px-2">
              {/* Users */}
              {searchResults.users.length > 0 && (
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">People</h3>
                  {searchResults.users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleResultClick('user', user)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {user.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.current_position && user.company_name 
                            ? `${user.current_position} at ${user.company_name}`
                            : user.current_position || user.company_name || 'Professional'
                          }
                        </p>
                      </div>
                      {user.location && (
                        <div className="flex items-center text-xs text-gray-400">
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
                <div className="px-4 py-2 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Jobs</h3>
                  {searchResults.jobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleResultClick('job', job)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                        <p className="text-xs text-gray-500 truncate">{job.company_name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">{job.job_type}</Badge>
                        {job.location && (
                          <div className="flex items-center text-xs text-gray-400 mt-1">
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
                <div className="px-4 py-2 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Events</h3>
                  {searchResults.events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleResultClick('event', event)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                        <p className="text-xs text-gray-500 truncate">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{event.type}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Hashtags */}
              {searchResults.hashtags.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hashtags</h3>
                  {searchResults.hashtags.map((hashtag) => (
                    <div
                      key={hashtag.id}
                      onClick={() => handleResultClick('hashtag', hashtag)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Hash className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">#{hashtag.name}</p>
                        <p className="text-xs text-gray-500">{hashtag.usage_count} posts</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Companies */}
              {searchResults.companies.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Companies</h3>
                  {searchResults.companies.map((company) => (
                    <div
                      key={company.id}
                      onClick={() => handleResultClick('company', company)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{company.name}</p>
                        <p className="text-xs text-gray-500">Company</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : searchQuery.length > 2 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;