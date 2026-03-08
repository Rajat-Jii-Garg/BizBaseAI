import CreateEventModal from '@/components/CreateEventModal';
import DashboardLayout from '@/components/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Calendar,
  Clock,
  Filter,
  Globe,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Users,
  Video
} from 'lucide-react';
import { useEffect, useState } from 'react';

const Events = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState('discover');
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, selectedTab]);

  const fetchEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (selectedTab === 'discover') {
        // Fetch all upcoming events (exclude past events)
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            event_attendees (
              id,
              user_id
            )
          `)
          .gte('date', today)
          .order('date', { ascending: true });

        if (error) throw error;
        
        // Get profiles separately to avoid foreign key issues
        const userIds = [...new Set(data?.map(event => event.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        // Get user's saved events to mark them
        const { data: userSavedEvents } = await supabase
          .from('saved_events')
          .select('event_id')
          .eq('user_id', user.id);

        const savedEventIds = new Set(userSavedEvents?.map(se => se.event_id) || []);

        const eventsWithAttendees = data?.map(event => {
          const profile = profiles?.find(p => p.id === event.user_id);
          const isUserAttending = event.event_attendees?.some(ea => ea.user_id === user.id);
          
          return {
            ...event,
            attendees: event.event_attendees?.length || 0,
            isUserAttending,
            isSaved: savedEventIds.has(event.id),
            organizer: {
              name: profile?.full_name || 'Unknown',
              avatar: profile?.avatar_url || ''
            }
          };
        }) || [];
        
        setEvents(eventsWithAttendees);
      } else if (selectedTab === 'my-events') {
        // Fetch all user's events (including past events for history)
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            event_attendees (
              id,
              user_id
            )
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        
        const userEvents = data?.map(event => ({
          ...event,
          attendees: event.event_attendees?.length || 0,
          isUserAttending: true, // User is always attending their own events
          canEdit: true, // User can edit their own events
          organizer: {
            name: 'You',
            avatar: ''
          }
        })) || [];
        
        setMyEvents(userEvents);
      } else if (selectedTab === 'saved-events') {
        // Fetch saved events
        const { data, error } = await supabase
          .from('saved_events')
          .select(`
            *,
            events (
              *,
              event_attendees (
                id
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Get profiles for saved events
        const eventUserIds = [...new Set(data?.map(saved => saved.events?.user_id).filter(Boolean))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', eventUserIds);

        const userSavedEvents = data?.map(saved => {
          const profile = profiles?.find(p => p.id === saved.events?.user_id);
          const isUserAttending = saved.events?.event_attendees?.some(ea => ea.user_id === user.id);
          
          return {
            ...saved.events,
            attendees: saved.events?.event_attendees?.length || 0,
            isUserAttending,
            isSaved: true, // Always true for saved events
            organizer: {
              name: profile?.full_name || 'Unknown',
              avatar: profile?.avatar_url || ''
            }
          };
        }).filter(event => event.date >= new Date().toISOString().split('T')[0]) || []; // Only show upcoming saved events
        
        setSavedEvents(userSavedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Technology', 'Networking', 'Marketing', 'Finance', 'Leadership'];
  const eventTypes = [
    { id: 'webinar', label: 'Webinars', icon: Video },
    { id: 'networking', label: 'Networking', icon: Users },
    { id: 'workshop', label: 'Workshops', icon: Briefcase },
    { id: 'conference', label: 'Conferences', icon: Globe }
  ];

  const getCurrentEvents = () => {
    if (selectedTab === 'discover') return events;
    if (selectedTab === 'my-events') return myEvents;
    if (selectedTab === 'saved-events') return savedEvents;
    return [];
  };

  const filteredEvents = getCurrentEvents().filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinEvent = async (event_id) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Event Joined!",
        description: "You've successfully registered for this event."
      });
      
      fetchEvents(); // Refresh to update attendee count
    } catch (error) {
      if (error.code === '23505') {
        toast({
          title: "Already Registered",
          description: "You're already registered for this event.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to register for event",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveEvent = async (eventId) => {
    if (!user) return;

    try {
      // Check if already saved
      const { data: existing } = await supabase
        .from('saved_events')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_events')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Event Removed",
          description: "Event removed from saved events."
        });
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_events')
          .insert({
            event_id: eventId,
            user_id: user.id
          });

        if (error) throw error;

        toast({
          title: "Event Saved",
          description: "Event saved to your collection."
        });
      }
      
      fetchEvents(); // Refresh data
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id); // Ensure user can only delete their own events

      if (error) throw error;

      toast({
        title: "Event Deleted",
        description: "Event has been successfully deleted."
      });
      
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Trending Events</h1>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-[10px] h-9"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Event</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {[
            { id: 'discover', label: 'Discover' },
            { id: 'my-events', label: 'My Events' },
            { id: 'saved-events', label: 'Saved' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 py-1.5 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded-lg px-3 py-2 bg-white text-sm flex-1 sm:flex-none"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className={`hover:shadow-lg transition-shadow ${event.featured ? 'ring-2 ring-yellow-200' : ''}`}>
                {event.featured && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 text-xs font-bold">
                    ⭐ FEATURED EVENT
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={event.organizer?.avatar} />
                        <AvatarFallback>{event.organizer?.name?.charAt(0) || 'E'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600">by {event.organizer?.name || 'Unknown'}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveEvent(event.id)}
                      className={event.isSaved ? 'text-blue-600' : 'text-gray-400'}
                    >
                      {event.isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </Button>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(event.tags || []).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-green-600">{event.price}</span>
                      <Badge variant="outline">{event.category}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      {event.canEdit ? (
                        <>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Edit Event
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleJoinEvent(event.id)}
                          disabled={event.isUserAttending}
                        >
                          {event.isUserAttending ? 'Registered' : (event.price === 'Free' ? 'Join Event' : 'Register')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600">Try adjusting your search terms or browse different categories.</p>
            </CardContent>
          </Card>
        )}

        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onEventCreated={fetchEvents}
        />
      </div>
    </DashboardLayout>
  );
};

export default Events;