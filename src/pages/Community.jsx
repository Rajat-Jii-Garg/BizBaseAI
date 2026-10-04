import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import DashboardLayout from '@/components/DashboardLayout';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Crown,
  Globe,
  ImagePlus,
  Loader2,
  Lock,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Send,
  Settings,
  Share2,
  Shield,
  UserPlus,
  Users,
  X
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  supabase,
} from '@/integrations/supabase/client';

import {
  useAuth,
} from '@/contexts/AuthContext';

import {
  toast,
} from 'sonner';

import CommunityManagementDialog from '@/components/CommunityManagementDialog';
import EnhancedPostCard from '@/components/EnhancedPostCard';
import SEOHead from '@/components/SEOHead';

const Community = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    user,
    profile,
  } = useAuth();

  const discussionRef = useRef(null);
  const fileInputRef = useRef(null);

  const [community, setCommunity] = useState(null);
  const [membership, setMembership] = useState(null);

  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [posts, setPosts] = useState([]);

  const [railCommunities, setRailCommunities] = useState({
    joined: [],
    recommended: [],
  });

  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [railLoading, setRailLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [postContent, setPostContent] = useState('');
  const [postFile, setPostFile] = useState(null);
  const [postPreview, setPostPreview] = useState(null);
  const [posting, setPosting] = useState(false);

  const [shareLoading, setShareLoading] = useState(false);

  const [activeView, setActiveView] = useState('home');

  const [managementOpen, setManagementOpen] =
    useState(false);

  const [managementSection, setManagementSection] =
    useState('settings');

  /*
   * -------------------------------------------------------
   * ACCESS STATE
   * -------------------------------------------------------
   */

  const isOwner =
    Boolean(user && community?.user_id === user.id);

  const isAdmin =
    isOwner ||
    (
      membership?.status === 'approved' &&
      ['admin', 'moderator'].includes(
        membership?.role
      )
    );

  const isApprovedMember =
    isOwner ||
    membership?.status === 'approved';

  const isPending =
    membership?.status === 'pending';

  const canViewContent =
    !community?.is_private ||
    isApprovedMember;

  /*
   * -------------------------------------------------------
   * LOAD COMMUNITY
   * -------------------------------------------------------
   */

  const fetchCommunity = useCallback(
    async () => {
      if (!id) return;

      setLoading(true);

      try {
        const {
          data,
          error,
        } = await supabase
          .from('communities')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setCommunity(data || null);
      } catch (error) {
        console.error(
          'Community loading error:',
          error
        );

        setCommunity(null);

        toast.error(
          error?.message ||
          'Unable to load community'
        );
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  /*
   * -------------------------------------------------------
   * LOAD CURRENT USER MEMBERSHIP
   * -------------------------------------------------------
   */

  const fetchMembership = useCallback(
    async () => {
      if (!user?.id || !id) {
        setMembership(null);
        return;
      }

      try {
        const {
          data,
          error,
        } = await supabase
          .from('community_members')
          .select(
            `
              id,
              community_id,
              user_id,
              role,
              status,
              joined_at
            `
          )
          .eq(
            'community_id',
            id
          )
          .eq(
            'user_id',
            user.id
          )
          .maybeSingle();

        if (error) {
          throw error;
        }

        setMembership(
          data || null
        );
      } catch (error) {
        console.error(
          'Membership loading error:',
          error
        );
      }
    },
    [id, user?.id]
  );

  /*
   * -------------------------------------------------------
   * LOAD MEMBERS
   * -------------------------------------------------------
   */

  const fetchMembers = useCallback(
    async () => {
      if (!id || !community) {
        return;
      }

      try {
        const {
          data: memberRows,
          error,
        } = await supabase
          .from('community_members')
          .select(
            `
              id,
              user_id,
              role,
              status,
              joined_at
            `
          )
          .eq(
            'community_id',
            id
          )
          .eq(
            'status',
            'approved'
          )
          .order(
            'joined_at',
            {
              ascending: true,
            }
          );

        if (error) {
          throw error;
        }

        const userIds = [
          ...new Set(
            (memberRows || [])
              .map(
                (row) =>
                  row.user_id
              )
          ),
        ];

        let profiles = [];

        if (userIds.length) {
          const {
            data,
            error: profileError,
          } = await supabase
            .from('profiles')
            .select(
              `
                id,
                username,
                full_name,
                avatar_url,
                current_position,
                company_name
              `
            )
            .in(
              'id',
              userIds
            );

          if (profileError) {
            throw profileError;
          }

          profiles = data || [];
        }

        const profileMap =
          new Map(
            profiles.map(
              (item) => [
                item.id,
                item,
              ]
            )
          );

        setMembers(
          (memberRows || [])
            .map(
              (row) => ({
                ...row,
                profile:
                  profileMap.get(
                    row.user_id
                  ) || null,
              })
            )
        );
      } catch (error) {
        console.error(
          'Members loading error:',
          error
        );
      }
    },
    [community, id]
  );

  /*
   * -------------------------------------------------------
   * LOAD PENDING MEMBERS
   * -------------------------------------------------------
   */

  const fetchPendingMembers =
    useCallback(
      async () => {
        if (!id || !isAdmin) {
          setPendingMembers([]);
          return;
        }

        try {
          const {
            data,
            error,
          } = await supabase
            .from(
              'community_members'
            )
            .select(
              `
                id,
                user_id,
                role,
                status,
                joined_at
              `
            )
            .eq(
              'community_id',
              id
            )
            .eq(
              'status',
              'pending'
            )
            .order(
              'joined_at',
              {
                ascending: true,
              }
            );

          if (error) {
            throw error;
          }

          const userIds = [
            ...new Set(
              (data || [])
                .map(
                  (row) =>
                    row.user_id
                )
            ),
          ];

          let profiles = [];

          if (userIds.length) {
            const {
              data: profileRows,
              error:
                profileError,
            } = await supabase
              .from('profiles')
              .select(
                `
                  id,
                  username,
                  full_name,
                  avatar_url,
                  current_position,
                  company_name
                `
              )
              .in(
                'id',
                userIds
              );

            if (profileError) {
              throw profileError;
            }

            profiles =
              profileRows || [];
          }

          const profileMap =
            new Map(
              profiles.map(
                (item) => [
                  item.id,
                  item,
                ]
              )
            );

          setPendingMembers(
            (data || []).map(
              (row) => ({
                ...row,
                profile:
                  profileMap.get(
                    row.user_id
                  ) || null,
              })
            )
          );
        } catch (error) {
          console.error(
            'Pending members error:',
            error
          );
        }
      },
      [id, isAdmin]
    );

  /*
   * -------------------------------------------------------
   * LOAD POSTS
   * -------------------------------------------------------
   */

  const fetchPosts = useCallback(
    async () => {
      if (
        !id ||
        !canViewContent
      ) {
        setPosts([]);
        return;
      }

      setPostsLoading(true);

      try {
        const {
          data: postRows,
          error,
        } = await supabase
          .from('posts')
          .select('*')
          .eq(
            'community_id',
            id
          )
          .order(
            'created_at',
            {
              ascending: false,
            }
          )
          .limit(50);

        if (error) {
          throw error;
        }

        const rows =
          postRows || [];

        const userIds = [
          ...new Set(
            rows.map(
              (post) =>
                post.user_id
            )
          ),
        ];

        const postIds =
          rows.map(
            (post) =>
              post.id
          );

        let profiles = [];
        let likes = [];
        let reposts = [];
        let pins = [];

        if (userIds.length) {
          const {
            data,
          } = await supabase
            .from('profiles')
            .select(
              `
                id,
                username,
                full_name,
                avatar_url,
                current_position,
                company_name
              `
            )
            .in(
              'id',
              userIds
            );

          profiles =
            data || [];
        }

        if (
          user?.id &&
          postIds.length
        ) {
          const [
            likeResult,
            repostResult,
          ] =
            await Promise.all([
              supabase
                .from(
                  'post_likes'
                )
                .select(
                  'post_id'
                )
                .eq(
                  'user_id',
                  user.id
                )
                .in(
                  'post_id',
                  postIds
                ),

              supabase
                .from(
                  'post_reposts'
                )
                .select(
                  'post_id'
                )
                .eq(
                  'user_id',
                  user.id
                )
                .in(
                  'post_id',
                  postIds
                ),
            ]);

          likes =
            likeResult.data ||
            [];

          reposts =
            repostResult.data ||
            [];
        }

        if (
          isApprovedMember &&
          postIds.length
        ) {
          const {
            data,
            error:
              pinError,
          } = await supabase
            .from(
              'community_pins'
            )
            .select(
              'post_id'
            )
            .eq(
              'community_id',
              id
            )
            .in(
              'post_id',
              postIds
            );

          if (pinError) {
            throw pinError;
          }

          pins =
            data || [];
        }

        const profileMap =
          new Map(
            profiles.map(
              (item) => [
                item.id,
                item,
              ]
            )
          );

        const likedIds =
          new Set(
            likes.map(
              (item) =>
                item.post_id
            )
          );

        const repostedIds =
          new Set(
            reposts.map(
              (item) =>
                item.post_id
            )
          );

        const pinnedIds =
          new Set(
            pins.map(
              (item) =>
                item.post_id
            )
          );

        setPosts(
          rows.map(
            (post) => ({
              ...post,

              likes_count:
                post.likes_count ||
                0,

              comments_count:
                post.comments_count ||
                0,

              shares_count:
                post.shares_count ||
                0,

              reposts_count:
                post.reposts_count ||
                0,

              profiles:
                profileMap.get(
                  post.user_id
                ) || {
                  full_name:
                    'BizBase Member',
                  username:
                    null,
                  avatar_url:
                    null,
                },

              user_has_liked:
                likedIds.has(
                  post.id
                ),

              user_has_reposted:
                repostedIds.has(
                  post.id
                ),

              is_pinned:
                pinnedIds.has(
                  post.id
                ),
            })
          )
        );
      } catch (error) {
        console.error(
          'Posts loading error:',
          error
        );

        toast.error(
          error?.message ||
          'Failed to load discussions'
        );
      } finally {
        setPostsLoading(false);
      }
    },
    [
      canViewContent,
      id,
      isApprovedMember,
      user?.id,
    ]
  );

  /*
   * -------------------------------------------------------
   * LEFT COMMUNITY RAIL
   * -------------------------------------------------------
   */

  const fetchCommunityRail =
    useCallback(
      async () => {
        if (!user?.id) {
          setRailCommunities({
            joined: [],
            recommended: [],
          });

          return;
        }

        setRailLoading(true);

        try {
          const [
            communitiesResult,
            membershipsResult,
          ] =
            await Promise.all([
              supabase
                .from(
                  'communities'
                )
                .select(
                  `
                    id,
                    name,
                    image_url,
                    category,
                    description,
                    members_count,
                    is_private,
                    user_id,
                    activity_level
                  `
                )
                .order(
                  'members_count',
                  {
                    ascending:
                      false,
                  }
                )
                .limit(80),

              supabase
                .from(
                  'community_members'
                )
                .select(
                  `
                    community_id,
                    role,
                    status
                  `
                )
                .eq(
                  'user_id',
                  user.id
                ),
            ]);

          if (
            communitiesResult.error
          ) {
            throw communitiesResult.error;
          }

          if (
            membershipsResult.error
          ) {
            throw membershipsResult.error;
          }

          const all =
            communitiesResult.data ||
            [];

          const membershipMap =
            new Map(
              (
                membershipsResult.data ||
                []
              ).map(
                (row) => [
                  row.community_id,
                  row,
                ]
              )
            );

          const joined =
            all.filter(
              (item) =>
                item.user_id ===
                  user.id ||
                membershipMap.get(
                  item.id
                )?.status ===
                  'approved'
            );

          const recommended =
            all
              .filter(
                (item) =>
                  item.id !== id &&
                  !joined.some(
                    (joinedItem) =>
                      joinedItem.id ===
                      item.id
                  )
              )
              .slice(
                0,
                6
              );

          setRailCommunities({
            joined,
            recommended,
          });
        } catch (error) {
          console.error(
            'Community rail error:',
            error
          );

          setRailCommunities({
            joined: [],
            recommended: [],
          });
        } finally {
          setRailLoading(false);
        }
      },
      [
        id,
        user?.id,
      ]
    );

  /*
   * -------------------------------------------------------
   * INITIAL LOAD
   * -------------------------------------------------------
   */

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  useEffect(() => {
    fetchCommunityRail();
  }, [fetchCommunityRail]);

  useEffect(() => {
    if (!community) {
      return;
    }

    fetchMembers();
    fetchPendingMembers();
    fetchPosts();
  }, [
    community,
    fetchMembers,
    fetchPendingMembers,
    fetchPosts,
  ]);

  /*
   * -------------------------------------------------------
   * REALTIME
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const channel =
      supabase
        .channel(
          `community-page-${id}`
        )

        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table:
              'community_members',
            filter:
              `community_id=eq.${id}`,
          },
          () => {
            fetchMembership();
            fetchMembers();
            fetchPendingMembers();
            fetchCommunity();
            fetchCommunityRail();
          }
        )

        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts',
            filter:
              `community_id=eq.${id}`,
          },
          () => {
            fetchPosts();
            fetchCommunity();
          }
        )

        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [
    id,
    fetchMembership,
    fetchMembers,
    fetchPendingMembers,
    fetchCommunity,
    fetchPosts,
    fetchCommunityRail,
  ]);

  /*
   * -------------------------------------------------------
   * JOIN
   * -------------------------------------------------------
   */

  const handleJoin =
    async () => {
      if (!user) {
        toast.error(
          'Please login to join this community'
        );
        return;
      }

      if (
        membership?.status ===
        'approved'
      ) {
        return;
      }

      if (
        membership?.status ===
        'pending'
      ) {
        toast.info(
          'Your join request is already pending'
        );
        return;
      }

      setActionLoading(true);

      try {
        const status =
          community.is_private
            ? 'pending'
            : 'approved';

        const {
          error,
        } = await supabase
          .from(
            'community_members'
          )
          .insert({
            community_id:
              id,
            user_id:
              user.id,
            role:
              'member',
            status,
          });

        if (error) {
          throw error;
        }

        await Promise.all([
          fetchMembership(),
          fetchCommunity(),
          fetchMembers(),
          fetchCommunityRail(),
        ]);

        toast.success(
          status ===
            'pending'
            ? 'Join request sent'
            : 'You joined the community'
        );
      } catch (error) {
        console.error(
          'Join error:',
          error
        );

        toast.error(
          error?.message ||
          'Failed to join community'
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
   * -------------------------------------------------------
   * LEAVE
   * -------------------------------------------------------
   */

  const handleLeave =
    async () => {
      if (
        !user ||
        !membership
      ) {
        return;
      }

      if (isOwner) {
        toast.error(
          'The community owner cannot leave the community.'
        );
        return;
      }

      const confirmed =
        window.confirm(
          `Leave ${community.name}?`
        );

      if (!confirmed) {
        return;
      }

      setActionLoading(true);

      try {
        const {
          error,
        } = await supabase
          .from(
            'community_members'
          )
          .delete()
          .eq(
            'community_id',
            id
          )
          .eq(
            'user_id',
            user.id
          );

        if (error) {
          throw error;
        }

        await Promise.all([
          fetchMembership(),
          fetchCommunity(),
          fetchMembers(),
          fetchCommunityRail(),
        ]);

        toast.success(
          'You left the community'
        );
      } catch (error) {
        console.error(
          'Leave error:',
          error
        );

        toast.error(
          error?.message ||
          'Failed to leave community'
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
   * -------------------------------------------------------
   * IMAGE UPLOAD
   * -------------------------------------------------------
   */

  const handleFileChange =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          'image/'
        )
      ) {
        toast.error(
          'Please select an image'
        );

        return;
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        toast.error(
          'Image is too large',
          {
            description:
              'Maximum size is 10MB.',
          }
        );

        return;
      }

      setPostFile(file);

      const reader =
        new FileReader();

      reader.onload = () => {
        setPostPreview(
          reader.result
        );
      };

      reader.readAsDataURL(
        file
      );
    };

  const removePostFile =
    () => {
      setPostFile(null);
      setPostPreview(null);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          '';
      }
    };

  const uploadPostImage =
    async () => {
      if (
        !postFile ||
        !user
      ) {
        return null;
      }

      const extension =
        postFile.name
          .split('.')
          .pop()
          ?.toLowerCase() ||
        'jpg';

      const path =
        `community/${id}/${user.id}/${Date.now()}.${extension}`;

      const {
        error,
      } = await supabase
        .storage
        .from('posts')
        .upload(
          path,
          postFile,
          {
            cacheControl:
              '3600',
            upsert:
              false,
            contentType:
              postFile.type,
          }
        );

      if (error) {
        throw error;
      }

      const {
        data,
      } =
        supabase
          .storage
          .from('posts')
          .getPublicUrl(
            path
          );

      return data.publicUrl;
    };

  /*
   * -------------------------------------------------------
   * CREATE POST
   * -------------------------------------------------------
   */

  const handleCreatePost =
    async () => {
      if (!user) {
        toast.error(
          'Please login to post'
        );
        return;
      }

      if (
        !isApprovedMember
      ) {
        toast.error(
          'Join the community before posting'
        );
        return;
      }

      if (
        !postContent.trim() &&
        !postFile
      ) {
        toast.error(
          'Write something or add an image'
        );
        return;
      }

      setPosting(true);

      try {
        const imageUrl =
          await uploadPostImage();

        const {
          data,
          error,
        } = await supabase
          .from('posts')
          .insert({
            user_id:
              user.id,

            content:
              postContent.trim() ||
              'Shared an image with the community.',

            image_url:
              imageUrl,

            community_id:
              id,
          })
          .select('*')
          .single();

        if (error) {
          throw error;
        }

        try {
          await supabase.rpc(
            'process_post_hashtags',
            {
              post_id:
                data.id,
              content:
                data.content,
            }
          );
        } catch (
          hashtagError
        ) {
          console.warn(
            'Hashtag processing skipped:',
            hashtagError
          );
        }

        setPostContent('');
        removePostFile();

        toast.success(
          'Posted to the community'
        );

        await fetchPosts();
      } catch (error) {
        console.error(
          'Create post error:',
          error
        );

        toast.error(
          error?.message ||
          'Failed to publish post'
        );
      } finally {
        setPosting(false);
      }
    };

  /*
   * -------------------------------------------------------
   * SHARE
   * -------------------------------------------------------
   */

  const handleShare =
    async () => {
      setShareLoading(true);

      const url =
        window.location.href;

      try {
        if (
          navigator.share
        ) {
          await navigator.share({
            title:
              `${community.name} | BizBase`,
            text:
              community.description ||
              `Join ${community.name} on BizBase`,
            url,
          });
        } else {
          await navigator.clipboard.writeText(
            url
          );

          toast.success(
            'Community link copied'
          );
        }
      } catch (error) {
        if (
          error?.name !==
          'AbortError'
        ) {
          try {
            await navigator.clipboard.writeText(
              url
            );

            toast.success(
              'Community link copied'
            );
          } catch {
            toast.error(
              'Unable to share community'
            );
          }
        }
      } finally {
        setShareLoading(
          false
        );
      }
    };

  const copyCommunityLink =
    async () => {
      try {
        await navigator.clipboard.writeText(
          window.location.href
        );

        toast.success(
          'Community link copied'
        );
      } catch {
        toast.error(
          'Unable to copy link'
        );
      }
    };

  /*
   * -------------------------------------------------------
   * HELPERS
   * -------------------------------------------------------
   */

  const getInitials =
    (person) => {
      const value =
        person?.full_name ||
        person?.username ||
        'U';

      return value
        .split(/\s+/)
        .map(
          (part) =>
            part[0]
        )
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

  const navigateSection =
    (section) => {
      setActiveView(
        section
      );

      window.setTimeout(
        () => {
          const element =
            document.getElementById(
              section ===
                'members'
                ? 'community-members-list'
                : section ===
                  'about'
                  ? 'community-about-full'
                  : 'community-home'
            );

          element?.scrollIntoView({
            behavior:
              'smooth',
            block:
              'start',
          });
        },
        20
      );
    };

  /*
   * -------------------------------------------------------
   * DERIVED DATA
   * -------------------------------------------------------
   */

  const pinnedPosts =
    useMemo(
      () =>
        posts.filter(
          (post) =>
            post.is_pinned
        ),
      [posts]
    );

  const regularPosts =
    useMemo(
      () =>
        posts.filter(
          (post) =>
            !post.is_pinned
        ),
      [posts]
    );

  const activeMembers =
    useMemo(
      () =>
        members.slice(
          0,
          8
        ),
      [members]
    );

  const joinedCommunities =
    railCommunities.joined ||
    [];

  const recommendedCommunities =
    railCommunities.recommended ||
    [];

  /*
   * -------------------------------------------------------
   * QUICK JOIN FROM LEFT RAIL
   * -------------------------------------------------------
   */

  const quickJoin =
    async (item) => {
      if (!user) {
        toast.error(
          'Please login first'
        );
        return;
      }

      try {
        const status =
          item.is_private
            ? 'pending'
            : 'approved';

        const {
          error,
        } = await supabase
          .from(
            'community_members'
          )
          .insert({
            community_id:
              item.id,
            user_id:
              user.id,
            role:
              'member',
            status,
          });

        if (error) {
          throw error;
        }

        toast.success(
          status ===
            'pending'
            ? 'Join request sent'
            : `Joined ${item.name}`
        );

        await fetchCommunityRail();
      } catch (error) {
        if (
          error?.code ===
          '23505'
        ) {
          navigate(
            `/communities/${item.id}`
          );

          return;
        }

        toast.error(
          error?.message ||
          'Unable to join community'
        );
      }
    };

  /*
   * -------------------------------------------------------
   * LOADING
   * -------------------------------------------------------
   */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#f6f8fb] p-4 sm:p-6">
          <div className="max-w-[1440px] mx-auto space-y-5 animate-pulse">

            <div className="h-8 w-28 bg-slate-200 rounded-lg" />

            <div className="h-60 bg-slate-200 rounded-2xl" />

            <div className="grid lg:grid-cols-[220px_minmax(0,1fr)_285px] gap-5">

              <div className="h-96 bg-slate-200 rounded-2xl" />

              <div className="space-y-4">
                <div className="h-28 bg-slate-200 rounded-2xl" />
                <div className="h-80 bg-slate-200 rounded-2xl" />
              </div>

              <div className="h-96 bg-slate-200 rounded-2xl" />

            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /*
   * -------------------------------------------------------
   * NOT FOUND
   * -------------------------------------------------------
   */

  if (!community) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto p-6">

          <Button
            variant="outline"
            onClick={() =>
              navigate(
                '/communities'
              )
            }
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Communities
          </Button>

          <Card>
            <CardContent className="p-10 text-center">

              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />

              <h1 className="text-2xl font-semibold">
                Community not available
              </h1>

              <p className="text-slate-500 mt-2">
                This community may have been removed or is not available.
              </p>

            </CardContent>
          </Card>

        </div>
      </DashboardLayout>
    );
  }

  /*
   * -------------------------------------------------------
   * COMMUNITY RAIL ITEM
   * -------------------------------------------------------
   */

  const CommunityRailItem =
    ({
      item,
      active = false,
    }) => (
      <button
        type="button"
        onClick={() =>
          navigate(
            `/communities/${item.id}`
          )
        }
        className={`
          w-full
          flex
          items-center
          gap-2.5
          rounded-xl
          px-2.5
          py-2
          text-left
          transition
          ${
            active
              ? 'bg-blue-50 text-blue-700'
              : 'hover:bg-slate-50 text-slate-700'
          }
        `}
      >

        <Avatar className="h-8 w-8 shrink-0 rounded-lg">

          <AvatarImage
            src={
              item.image_url ||
              undefined
            }
          />

          <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 text-[10px] font-bold">
            {(
              item.name ||
              'C'
            )
              .slice(
                0,
                2
              )
              .toUpperCase()}
          </AvatarFallback>

        </Avatar>

        <div className="min-w-0 flex-1">

          <p className="text-xs font-semibold truncate">
            {item.name}
          </p>

          <p className="text-[10px] text-slate-500 truncate">
            {(
              item.members_count ||
              0
            ).toLocaleString()}{' '}
            members
          </p>

        </div>

      </button>
    );

  /*
   * -------------------------------------------------------
   * PAGE
   * -------------------------------------------------------
   */

  return (
    <DashboardLayout>
      <SEOHead
        title={`${community.name} | BizBase Communities`}
        description={
          community.description?.slice(0, 155) ||
          `Join ${community.name} on BizBase.`
        }
        path={`/communities/${community.id}`}
        type="article"
      />

      <div className="min-h-screen bg-[#f5f7fb]">
        <div className="mx-auto max-w-[1480px] px-3 py-4 sm:px-5 lg:px-6">
          {/* =========================================================
              PAGE LAYOUT
              LEFT = COMMUNITY NAV
              RIGHT = COMMUNITY WORKSPACE
          ========================================================= */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[225px_minmax(0,1fr)]">
            {/* =======================================================
                LEFT SIDEBAR
            ======================================================= */}
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-3">

                    {/* ALL COMMUNITIES */}
                    <Button
                      variant="ghost"
                      className="mb-3 h-9 w-full justify-start px-2 text-xs text-slate-600 hover:bg-slate-50"
                      onClick={() =>
                        navigate('/communities')
                      }
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      All Communities
                    </Button>

                    {/* =================================================
                        RECOMMENDED
                    ================================================= */}
                    <div className="mb-2 px-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        Recommended Communities
                      </p>
                    </div>
                    <div className="space-y-1">
                      {railLoading ? (
                        [1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className="h-10 animate-pulse rounded-xl bg-slate-100"
                          />
                        ))
                      ) : recommendedCommunities.length > 0 ? (
                        recommendedCommunities
                          .slice(0, 6)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="group flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/communities/${item.id}`
                                  )
                                }
                                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                              >
                                <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                                  <AvatarImage
                                    src={
                                      item.image_url ||
                                      undefined
                                    }
                                  />
                                  <AvatarFallback className="rounded-lg bg-blue-50 text-[9px] font-bold text-blue-700">
                                    {(
                                      item.name ||
                                      'C'
                                    )
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="truncate text-[11px] font-semibold text-slate-800">
                                    {item.name}
                                  </p>
                                  <p className="truncate text-[9px] text-slate-400">
                                    {(
                                      item.members_count ||
                                      0
                                    ).toLocaleString()}{' '}
                                    members
                                  </p>

                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  quickJoin(item)
                                }
                                className="shrink-0 text-[9px] font-bold text-blue-600 hover:text-blue-800"
                              >
                                Join
                              </button>
                            </div>
                          ))
                      ) : (
                        <p className="px-2 py-2 text-[11px] text-slate-400">
                          No new recommendations.
                        </p>
                      )}
                    </div>
                    <div className="my-4 border-t border-slate-100" />

                    {/* =================================================
                        MY COMMUNITIES
                    ================================================= */}
                    <div className="mb-2 px-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        My Communities
                      </p>
                    </div>
                    <div className="space-y-1">
                      {joinedCommunities.length > 0 ? (
                        joinedCommunities
                          .slice(0, 10)
                          .map((item) => (
                            <CommunityRailItem
                              key={item.id}
                              item={item}
                              active={
                                item.id ===
                                community.id
                              }
                            />
                          ))
                      ) : (
                        <p className="px-2 py-2 text-[11px] text-slate-400">
                          Your joined communities will appear here.
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 h-8 w-full text-[11px]"
                      onClick={() =>
                        navigate('/communities')
                      }
                    >
                      <Users className="mr-1.5 h-3.5 w-3.5" />
                      Explore Communities
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* =======================================================
                RIGHT WORKSPACE
                HERO + CENTER FEED + RIGHT INFO
            ======================================================= */}
            <div className="min-w-0">
              {/* =====================================================
                  TOP ACTION BAR
              ===================================================== */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  onClick={() =>
                    navigate('/communities')
                  }
                  className="h-8 px-2 text-xs text-slate-500"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Communities
                </Button>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white"
                    onClick={copyCommunityLink}
                    title="Copy community link"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 bg-white text-xs"
                    onClick={handleShare}
                    disabled={shareLoading}
                  >
                    {shareLoading ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Share2 className="mr-1 h-3.5 w-3.5" />
                    )}
                    Share
                  </Button>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56"
                      >
                        {isOwner && (
                          <DropdownMenuItem
                            onClick={() => {
                              setManagementSection(
                                'settings'
                              );
                              setManagementOpen(
                                true
                              );
                            }}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Edit Community
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setManagementSection(
                              'requests'
                            );
                            setManagementOpen(
                              true
                            );
                          }}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Join Requests
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setManagementSection(
                              'members'
                            );
                            setManagementOpen(
                              true
                            );
                          }}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Manage Members
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setManagementSection(
                              'moderation'
                            );
                            setManagementOpen(
                              true
                            );
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Moderation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={
                            copyCommunityLink
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Community Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* =====================================================
                  COMMUNITY HERO
                  FULL WIDTH OF WORKSPACE
              ===================================================== */}

              <Card className="mb-4 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
                <div className="relative h-[210px] overflow-hidden sm:h-[240px] lg:h-[255px]">
                  {community.image_url ? (
                    <img
                      src={community.image_url}
                      alt={community.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#172554] via-[#1d4ed8] to-[#4f46e5]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#0f172a]/45 to-transparent" />

                  {/* HERO TOP */}
                  <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3 sm:left-6 sm:right-6">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        className={`border-0 px-2.5 py-1 text-[9px] font-bold text-white ${
                          community.is_private
                            ? 'bg-rose-500'
                            : 'bg-emerald-500'
                        }`}
                      >
                        {community.is_private ? (
                          <>
                            <Lock className="mr-1 h-3 w-3" />
                            Private
                          </>
                        ) : (
                          <>
                            <Globe className="mr-1 h-3 w-3" />
                            Public
                          </>
                        )}
                      </Badge>
                      {isOwner && (
                        <Badge className="border border-white/20 bg-white/15 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur">
                          <Crown className="mr-1 h-3 w-3" />
                          Owner
                        </Badge>
                      )}
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[9px] text-white backdrop-blur">
                      {community.activity_level ===
                      'very_active'
                        ? 'Very Active'
                        : community.activity_level ===
                          'active'
                        ? 'Active'
                        : 'Professional Community'}
                    </span>
                  </div>

                  {/* HERO CONTENT */}
                  <div className="absolute bottom-6 left-5 right-5 text-white sm:left-6 sm:right-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
                      {community.category ||
                        'Professional Community'}
                    </p>
                    <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl lg:text-[42px]">
                      {community.name}
                    </h1>
                    <p className="mt-1 max-w-3xl text-xs leading-5 text-white/75 sm:text-sm">
                      {community.description ||
                        'A professional community for ideas, networking, opportunities and collaboration.'}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[10px] text-white/80 sm:text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {(
                          community.members_count ||
                          0
                        ).toLocaleString()}{' '}
                        members
                      </span>

                      <span>•</span>
                      <span>
                        Ideas · Networking · Opportunities
                      </span>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    COMMUNITY TABS
                ================================================= */}
                <div className="flex items-center justify-between border-t border-slate-100 px-3 sm:px-5">
                  <div className="flex min-w-0 items-center gap-1 overflow-x-auto py-1.5">
                    {[
                      ['home', 'Discussion'],
                      ['members', 'Members'],
                      ['about', 'About'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          navigateSection(value)
                        }
                        className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                          activeView === value
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* JOIN / LEAVE */}
                  <div className="hidden shrink-0 sm:block">
                    {isApprovedMember ? (
                      !isOwner && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={
                            handleLeave
                          }
                          disabled={
                            actionLoading
                          }
                        >
                          Leave
                        </Button>
                      )
                    ) : isPending ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="h-8 text-xs text-amber-700"
                      >
                        Request Pending
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="h-8 bg-blue-600 text-xs hover:bg-blue-700"
                        onClick={
                          handleJoin
                        }
                        disabled={
                          actionLoading
                        }
                      >
                        {actionLoading ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserPlus className="mr-1 h-3.5 w-3.5" />
                        )}
                        {community.is_private
                          ? 'Request to Join'
                          : 'Join Community'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* =====================================================
                  MOBILE COMMUNITY SWITCHER
              ===================================================== */}
              <div className="mb-3 flex gap-2 overflow-x-auto lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate('/communities')
                  }
                  className="shrink-0"
                >
                  Explore
                </Button>
                {joinedCommunities
                  .slice(0, 5)
                  .map((item) => (
                    <Button
                      key={item.id}
                      variant={
                        item.id ===
                        community.id
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/communities/${item.id}`
                        )
                      }
                      className="shrink-0"
                    >
                      {item.name}
                    </Button>
                  ))}
              </div>

              {/* =====================================================
                  FEED + RIGHT INFORMATION
              ===================================================== */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                {/* ===================================================
                    CENTER
                =================================================== */}
                <main className="min-w-0">
                  <div
                    id="community-home"
                    className="scroll-mt-24 space-y-4"
                  >

                    {/* =================================================
                        PENDING REQUEST
                    ================================================= */}
                    {isAdmin &&
                      pendingMembers.length > 0 && (
                        <Card className="rounded-2xl border-amber-200 bg-amber-50/70">
                          <CardContent className="flex items-center justify-between gap-3 p-3.5">
                            <div>
                              <p className="text-sm font-semibold text-amber-900">
                                {pendingMembers.length}{' '}
                                join request
                                {pendingMembers.length >
                                1
                                  ? 's'
                                  : ''}
                              </p>
                              <p className="mt-0.5 text-[11px] text-amber-800">
                                Review requests from Community Management.
                              </p>
                            </div>

                            <Button
                              size="sm"
                              className="h-8 bg-amber-600 hover:bg-amber-700"
                              onClick={() => {
                                setManagementSection(
                                  'requests'
                                );
                                setManagementOpen(
                                  true
                                );
                              }}
                            >
                              Review
                            </Button>

                          </CardContent>

                        </Card>

                      )}


                    {/* =================================================
                        POST COMPOSER
                    ================================================= */}

                    {isApprovedMember && (

                      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">

                        <CardContent className="p-4">

                          <div className="flex items-start gap-3">

                            <Avatar className="h-9 w-9 shrink-0">

                              <AvatarImage
                                src={
                                  profile?.avatar_url ||
                                  undefined
                                }
                              />

                              <AvatarFallback>
                                {getInitials(
                                  profile
                                )}
                              </AvatarFallback>

                            </Avatar>

                            <div className="min-w-0 flex-1">

                              <Textarea
                                value={
                                  postContent
                                }
                                onChange={(event) =>
                                  setPostContent(
                                    event.target.value
                                  )
                                }
                                placeholder={`Share something with ${community.name}...`}
                                className="min-h-[82px] resize-none rounded-xl border-slate-200 text-sm"
                                maxLength={3000}
                              />

                              {postPreview && (

                                <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-200">

                                  <img
                                    src={
                                      postPreview
                                    }
                                    alt="Selected"
                                    className="max-h-72 w-full object-cover"
                                  />

                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    onClick={
                                      removePostFile
                                    }
                                    className="absolute right-2 top-2 h-8 w-8 rounded-full"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>

                                </div>

                              )}

                              <div className="mt-2.5 flex items-center justify-between">

                                <div className="flex items-center gap-1.5">

                                  <input
                                    ref={
                                      fileInputRef
                                    }
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    onChange={
                                      handleFileChange
                                    }
                                  />

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      fileInputRef.current?.click()
                                    }
                                    className="h-8 text-xs text-blue-600"
                                  >
                                    <ImagePlus className="mr-1 h-3.5 w-3.5" />
                                    Photo
                                  </Button>

                                  <span className="text-[10px] text-slate-400">
                                    {postContent.length}/3000
                                  </span>

                                </div>

                                <Button
                                  onClick={
                                    handleCreatePost
                                  }
                                  disabled={
                                    posting ||
                                    (
                                      !postContent.trim() &&
                                      !postFile
                                    )
                                  }
                                  className="h-8 bg-blue-600 text-xs hover:bg-blue-700"
                                >

                                  {posting ? (
                                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Send className="mr-1 h-3.5 w-3.5" />
                                  )}

                                  Publish

                                </Button>

                              </div>

                            </div>

                          </div>

                        </CardContent>

                      </Card>

                    )}


                    {/* =================================================
                        PINNED
                    ================================================= */}

                    {canViewContent &&
                      pinnedPosts.length > 0 && (

                        <section className="space-y-2">

                          <div>

                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                              Community highlights
                            </p>

                            <h2 className="text-lg font-bold text-slate-900">
                              Pinned discussions
                            </h2>

                          </div>

                          <div className="space-y-3">

                            {pinnedPosts
                              .slice(0, 2)
                              .map((post) => (

                                <EnhancedPostCard
                                  key={`pinned-${post.id}`}
                                  post={{
                                    ...post,
                                    community,
                                  }}
                                  showCommunityContext={false}
                                  onEngagementUpdate={
                                    fetchPosts
                                  }
                                />

                              ))}

                          </div>

                        </section>

                      )}


                    {/* =================================================
                        PRIVATE COMMUNITY
                    ================================================= */}

                    {!canViewContent &&
                    community.is_private ? (

                      <Card className="rounded-2xl border-slate-200 bg-white">

                        <CardContent className="p-10 text-center">

                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                            <Lock className="h-5 w-5" />
                          </div>

                          <h2 className="mt-4 font-bold">
                            Private Community
                          </h2>

                          <p className="mt-1 text-xs text-slate-500">
                            Request access to view discussions and participate.
                          </p>

                          {!isPending && (

                            <Button
                              onClick={
                                handleJoin
                              }
                              className="mt-4 bg-blue-600 hover:bg-blue-700"
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Request to Join
                            </Button>

                          )}

                        </CardContent>

                      </Card>

                    ) : (

                      <section
                        ref={
                          discussionRef
                        }
                        className="scroll-mt-24 space-y-3"
                      >

                        {/* FEED HEADER */}

                        <div className="flex items-end justify-between">

                          <div>

                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                              Community Feed
                            </p>

                            <h2 className="text-lg font-bold text-slate-900">
                              Latest Discussions
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Ideas, questions, updates and opportunities from members.
                            </p>

                          </div>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-white"
                            onClick={
                              fetchPosts
                            }
                            disabled={
                              postsLoading
                            }
                          >
                            <RefreshCw
                              className={
                                postsLoading
                                  ? 'h-3.5 w-3.5 animate-spin'
                                  : 'h-3.5 w-3.5'
                              }
                            />
                          </Button>

                        </div>


                        {/* POSTS */}

                        {postsLoading ? (

                          <div className="space-y-3">

                            {[1, 2, 3].map(
                              (item) => (

                                <Card
                                  key={item}
                                  className="rounded-2xl"
                                >

                                  <CardContent className="space-y-3 p-5">

                                    <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />

                                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />

                                    <div className="h-24 animate-pulse rounded bg-slate-200" />

                                  </CardContent>

                                </Card>

                              )
                            )}

                          </div>

                        ) : regularPosts.length === 0 ? (

                          <Card className="rounded-2xl border-dashed border-slate-300 bg-white">

                            <CardContent className="p-10 text-center">

                              <MessageSquare className="mx-auto h-9 w-9 text-slate-300" />

                              <h3 className="mt-3 text-sm font-bold text-slate-800">
                                No discussions yet
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                Start the first professional conversation in this community.
                              </p>

                            </CardContent>

                          </Card>

                        ) : (

                          <div className="space-y-3">

                            {regularPosts.map(
                              (post) => (

                                <EnhancedPostCard
                                  key={
                                    post.id
                                  }
                                  post={{
                                    ...post,
                                    community,
                                  }}
                                  showCommunityContext={false}
                                  onEngagementUpdate={
                                    fetchPosts
                                  }
                                />

                              )
                            )}

                          </div>

                        )}

                      </section>

                    )}


                    {/* =================================================
                        MEMBERS VIEW
                    ================================================= */}

                    {activeView ===
                      'members' &&
                      canViewContent && (

                        <section
                          id="community-members-list"
                          className="scroll-mt-24"
                        >

                          <Card className="rounded-2xl border-slate-200 bg-white">

                            <CardHeader>

                              <CardTitle className="text-base">
                                Community Members
                              </CardTitle>

                            </CardHeader>

                            <CardContent className="grid gap-2 sm:grid-cols-2">

                              {members.map(
                                (member) => {

                                  const person =
                                    member.profile;

                                  return (

                                    <button
                                      key={
                                        member.id
                                      }
                                      type="button"
                                      onClick={() =>
                                        person?.username &&
                                        navigate(
                                          `/${person.username}`
                                        )
                                      }
                                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:bg-slate-50"
                                    >

                                      <Avatar className="h-9 w-9">

                                        <AvatarImage
                                          src={
                                            person?.avatar_url ||
                                            undefined
                                          }
                                        />

                                        <AvatarFallback>
                                          {getInitials(
                                            person
                                          )}
                                        </AvatarFallback>

                                      </Avatar>

                                      <div className="min-w-0 flex-1">

                                        <p className="truncate text-sm font-semibold">
                                          {person?.full_name ||
                                            person?.username ||
                                            'BizBase Member'}
                                        </p>

                                        <p className="truncate text-[11px] text-slate-500">
                                          {person?.current_position ||
                                            person?.company_name ||
                                            'Professional member'}
                                        </p>

                                      </div>

                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] capitalize"
                                      >
                                        {member.user_id ===
                                        community.user_id
                                          ? 'Owner'
                                          : member.role ||
                                            'member'}
                                      </Badge>

                                    </button>

                                  );

                                }
                              )}

                            </CardContent>

                          </Card>

                        </section>

                      )}


                    {/* =================================================
                        ABOUT VIEW
                    ================================================= */}

                    {activeView ===
                      'about' && (

                        <section
                          id="community-about-full"
                          className="scroll-mt-24"
                        >

                          <Card className="rounded-2xl border-slate-200 bg-white">

                            <CardHeader>

                              <CardTitle className="text-base">
                                About {community.name}
                              </CardTitle>

                            </CardHeader>

                            <CardContent className="grid gap-5 md:grid-cols-2">

                              <div>

                                <p className="text-sm leading-7 text-slate-700">
                                  {community.description ||
                                    'A professional community for knowledge sharing, networking and collaboration.'}
                                </p>

                              </div>

                              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                                <p className="mb-2 text-sm font-semibold">
                                  Community Guidelines
                                </p>

                                <p className="whitespace-pre-wrap text-xs leading-5 text-slate-600">
                                  {community.rules ||
                                    'Be respectful, stay on topic and contribute useful professional knowledge.'}
                                </p>

                              </div>

                            </CardContent>

                          </Card>

                        </section>

                      )}

                  </div>

                </main>


                {/* ===================================================
                    RIGHT INFORMATION SIDEBAR
                =================================================== */}

                <aside className="hidden space-y-3 xl:block">

                  {/* ABOUT */}

                  <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">

                    <CardHeader className="pb-2">

                      <CardTitle className="flex items-center justify-between text-sm">

                        <span>
                          About this community
                        </span>

                        {isOwner && (

                          <button
                            type="button"
                            onClick={() => {
                              setManagementSection(
                                'settings'
                              );
                              setManagementOpen(
                                true
                              );
                            }}
                            className="text-[10px] font-semibold text-blue-600 hover:underline"
                          >
                            Edit
                          </button>

                        )}

                      </CardTitle>

                    </CardHeader>

                    <CardContent className="space-y-3">

                      <p className="text-xs leading-5 text-slate-600">
                        {community.description ||
                          'A professional space for knowledge, networking, opportunities and collaboration.'}
                      </p>

                      <div className="grid grid-cols-2 gap-2">

                        <div className="rounded-xl bg-slate-50 p-2.5">

                          <p className="text-[10px] text-slate-400">
                            Members
                          </p>

                          <p className="mt-0.5 text-sm font-bold">
                            {(
                              community.members_count ||
                              0
                            ).toLocaleString()}
                          </p>

                        </div>

                        <div className="rounded-xl bg-slate-50 p-2.5">

                          <p className="text-[10px] text-slate-400">
                            Posts
                          </p>

                          <p className="mt-0.5 text-sm font-bold">
                            {posts.length}
                          </p>

                        </div>

                      </div>

                      {Array.isArray(
                        community.tags
                      ) &&
                        community.tags.length >
                          0 && (

                          <div className="flex flex-wrap gap-1.5">

                            {community.tags
                              .slice(0, 8)
                              .map(
                                (
                                  tag,
                                  index
                                ) => (

                                  <Badge
                                    key={`${tag}-${index}`}
                                    variant="secondary"
                                    className="bg-slate-100 text-[9px]"
                                  >
                                    #{tag}
                                  </Badge>

                                )
                              )}

                          </div>

                        )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-full text-xs"
                        onClick={
                          handleShare
                        }
                      >
                        <Share2 className="mr-1.5 h-3.5 w-3.5" />
                        Invite / Share
                      </Button>

                    </CardContent>

                  </Card>


                  {/* MEMBERS */}

                  <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">

                    <CardHeader className="pb-2">

                      <CardTitle className="flex items-center justify-between text-sm">

                        <span>
                          Community Members
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            navigateSection(
                              'members'
                            )
                          }
                          className="text-[10px] font-semibold text-blue-600 hover:underline"
                        >
                          See all
                        </button>

                      </CardTitle>

                    </CardHeader>

                    <CardContent className="space-y-1">

                      {activeMembers
                        .slice(0, 6)
                        .map((member) => {

                          const person =
                            member.profile;

                          return (

                            <button
                              key={
                                member.id
                              }
                              type="button"
                              onClick={() =>
                                person?.username &&
                                navigate(
                                  `/${person.username}`
                                )
                              }
                              className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition hover:bg-slate-50"
                            >

                              <Avatar className="h-8 w-8">

                                <AvatarImage
                                  src={
                                    person?.avatar_url ||
                                    undefined
                                  }
                                />

                                <AvatarFallback className="text-[9px]">
                                  {getInitials(
                                    person
                                  )}
                                </AvatarFallback>

                              </Avatar>

                              <div className="min-w-0 flex-1">

                                <p className="truncate text-[11px] font-semibold">
                                  {person?.full_name ||
                                    person?.username ||
                                    'BizBase Member'}
                                </p>

                                <p className="truncate text-[9px] text-slate-400">
                                  {person?.current_position ||
                                    'Professional'}
                                </p>

                              </div>

                              {member.user_id ===
                                community.user_id && (
                                <Crown className="h-3 w-3 text-amber-500" />
                              )}

                            </button>

                          );

                        })}

                      <Button
                        size="sm"
                        className="mt-2 h-8 w-full bg-blue-600 text-xs hover:bg-blue-700"
                        onClick={() =>
                          navigateSection(
                            'members'
                          )
                        }
                      >
                        View Members
                      </Button>

                    </CardContent>

                  </Card>


                  {/* GUIDELINES */}

                  <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">

                    <CardHeader className="pb-2">

                      <CardTitle className="text-sm">
                        Community Guidelines
                      </CardTitle>

                    </CardHeader>

                    <CardContent>

                      <p className="whitespace-pre-wrap text-[11px] leading-5 text-slate-600">
                        {community.rules ||
                          'Be respectful and supportive.\nKeep discussions relevant.\nAvoid spam and self-promotion.\nContribute useful professional knowledge.'}
                      </p>

                    </CardContent>

                  </Card>


                  {/* ADMIN MANAGEMENT */}

                  {isAdmin && (

                    <Card className="rounded-2xl border-blue-100 bg-blue-50/60 shadow-sm">

                      <CardContent className="p-3">

                        <div className="flex items-center justify-between gap-2">

                          <div>

                            <p className="text-xs font-bold text-blue-900">
                              Community Management
                            </p>

                            <p className="mt-0.5 text-[10px] text-blue-700">
                              Members, requests & moderation
                            </p>

                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 bg-white text-[10px]"
                            onClick={() => {
                              setManagementSection(
                                'settings'
                              );
                              setManagementOpen(
                                true
                              );
                            }}
                          >
                            <Settings className="mr-1 h-3 w-3" />
                            Manage
                          </Button>

                        </div>

                      </CardContent>

                    </Card>

                  )}

                </aside>

              </div>

            </div>

          </div>

        </div>


        {/* =========================================================
            COMMUNITY MANAGEMENT DIALOG
        ========================================================= */}

        <CommunityManagementDialog
          open={
            managementOpen
          }
          onOpenChange={
            setManagementOpen
          }
          community={
            community
          }
          user={
            user
          }
          isOwner={
            isOwner
          }
          isAdmin={
            isAdmin
          }
          initialSection={
            managementSection
          }
          onCommunityUpdated={(
            updated
          ) => {

            if (updated) {
              setCommunity(
                updated
              );
            }

            fetchCommunity();
            fetchMembership();
            fetchMembers();
            fetchPendingMembers();
            fetchPosts();
            fetchCommunityRail();

          }}
        />

      </div>

    </DashboardLayout>
  );
};

export default Community;