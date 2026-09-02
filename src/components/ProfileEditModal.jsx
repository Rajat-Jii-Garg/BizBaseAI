import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Edit3, Loader2, Plus, Trash2, XCircle} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const ProfileEditModal = ({
  children,
  onProfileUpdate,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (value) => {
    if (isControlled) {
      controlledOnOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // EMAIL IDENTITY STATE
  // =========================================================
  const [emailVerified, setEmailVerified] = useState(false);
  const [authEmail, setAuthEmail] = useState('');

  const [activeTab, setActiveTab] = useState('basic');

  // =========================================================
  // USERNAME STATE
  // =========================================================
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [originalUsername, setOriginalUsername] = useState('');

  // =========================================================
  // DIRTY STATE
  // =========================================================
  const [isDirty, setIsDirty] = useState(false);
  const initialProfileRef = useRef(null);

  const PROFILE_FIELDS = [
    'full_name',
    'username',
    'profession',
    'bio',
    'about',
    'location',
    'belongs_to',
    'email',
    'phone',
    'website',
    'linkedin_url',
    'current_position',
    'company_name',
    'industry'
  ];

  // =========================================================
  // PROFILE DATA
  // =========================================================
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    profession: '',
    bio: '',
    about: '',
    location: '',
    belongs_to: '',
    email: '',
    phone: '',
    website: '',
    linkedin_url: '',
    current_position: '',
    company_name: '',
    industry: ''
  });

  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // =========================================================
  // NEW ITEM FORM STATES
  // =========================================================
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    level: 'Beginner'
  });

  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    location: ''
  });

  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field_of_study: '',
    start_year: '',
    end_year: '',
    grade: '',
    description: ''
  });

  const [newCertificate, setNewCertificate] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: ''
  });

  const [newLanguage, setNewLanguage] = useState({
    language: '',
    proficiency: 'Beginner'
  });

  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    achievement_date: '',
    category: 'General'
  });

  // =========================================================
  // FETCH PROFILE WHEN MODAL OPENS
  // =========================================================
  useEffect(() => {
    if (open && user?.id) {
      fetchProfileData();
    }
  }, [open, user?.id]);

  // =========================================================
  // AUTH STATE LISTENER
  //
  // Keeps emailVerified/authEmail updated when Supabase Auth
  // session changes, including email verification completion.
  // =========================================================
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user;

      if (!authUser) {
        setEmailVerified(false);
        setAuthEmail('');
        return;
      }

      const nextEmail =
        authUser.email?.trim().toLowerCase() || '';

      setEmailVerified(
        Boolean(authUser.email_confirmed_at)
      );

      setAuthEmail(nextEmail);

      setProfile((prev) => {
        if (prev.email === nextEmail) {
          return prev;
        }

        return {
          ...prev,
          email: nextEmail
        };
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =========================================================
  // FETCH PROFILE DATA
  // =========================================================
  const fetchProfileData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // -------------------------------------------------------
      // GET AUTH USER
      // -------------------------------------------------------
      const {
        data: { user: authUser },
        error: authUserError
      } = await supabase.auth.getUser();

      if (authUserError) {
        throw authUserError;
      }

      if (!authUser) {
        throw new Error('Authenticated user not found.');
      }

      const verified = Boolean(
        authUser.email_confirmed_at
      );

      const currentAuthEmail =
        authUser.email?.trim().toLowerCase() || '';

      setEmailVerified(verified);
      setAuthEmail(currentAuthEmail);

      // -------------------------------------------------------
      // FETCH PROFILE
      // -------------------------------------------------------
      const {
        data: profileData,
        error: profileError
      } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (profileData) {
        // Auth email is the source of truth.
        const normalizedProfile = {
          ...profileData,
          email:
            currentAuthEmail ||
            profileData.email ||
            ''
        };

        setProfile(normalizedProfile);

        setOriginalUsername(
          profileData.username || ''
        );

        initialProfileRef.current = {
          ...normalizedProfile
        };

        setIsDirty(false);
      }

      // -------------------------------------------------------
      // FETCH RELATED DATA
      // -------------------------------------------------------
      const [
        skillsRes,
        expRes,
        eduRes,
        certRes,
        langRes,
        achRes
      ] = await Promise.all([
        supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', user.id),

        supabase
          .from('user_experience')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', {
            ascending: false
          }),

        supabase
          .from('user_education')
          .select('*')
          .eq('user_id', user.id)
          .order('end_year', {
            ascending: false
          }),

        supabase
          .from('user_certificates')
          .select('*')
          .eq('user_id', user.id)
          .order('issue_date', {
            ascending: false
          }),

        supabase
          .from('user_languages')
          .select('*')
          .eq('user_id', user.id),

        supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('achievement_date', {
            ascending: false
          })
      ]);

      setSkills(skillsRes.data || []);
      setExperience(expRes.data || []);
      setEducation(eduRes.data || []);
      setCertificates(certRes.data || []);
      setLanguages(langRes.data || []);
      setAchievements(achRes.data || []);
    } catch (error) {
      console.error(
        'Error fetching profile data:',
        error
      );

      toast({
        title: 'Error',
        description:
          error?.message ||
          'Failed to load profile data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DIRTY CHECK
  // =========================================================
  useEffect(() => {
    if (!initialProfileRef.current) {
      setIsDirty(false);
      return;
    }

    const hasChanges = PROFILE_FIELDS.some((field) => {
      const originalValue =
        initialProfileRef.current?.[field] ?? '';

      const currentValue =
        profile?.[field] ?? '';

      return (
        String(originalValue).trim() !==
        String(currentValue).trim()
      );
    });

    setIsDirty(hasChanges);
  }, [profile]);

  // =========================================================
  // USERNAME AVAILABILITY
  // =========================================================
  const checkUsernameAvailability = async (
    username
  ) => {
    if (
      !username ||
      username.trim().length < 3
    ) {
      setUsernameAvailable(null);
      return;
    }

    if (
      username.toLowerCase() ===
      originalUsername?.toLowerCase()
    ) {
      setUsernameAvailable(true);
      return;
    }

    setCheckingUsername(true);

    try {
      const {
        data,
        error
      } = await supabase.rpc(
        'is_username_available',
        {
          check_username: username
        }
      );

      if (error) {
        throw error;
      }

      setUsernameAvailable(data);
    } catch (error) {
      console.error(
        'Error checking username:',
        error
      );

      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  useEffect(() => {
    if (originalUsername) {
      setUsernameAvailable(true);
      setCheckingUsername(false);
      return;
    }

    const timer = setTimeout(() => {
      if (profile.username) {
        checkUsernameAvailability(
          profile.username
        );
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    profile.username,
    originalUsername
  ]);

  // =========================================================
  // SAVE PROFILE
  // =========================================================
  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description:
          'You must be logged in to update your profile.',
        variant: 'destructive'
      });
      return;
    }

    if (!isDirty) {
      return;
    }

    const username = originalUsername
      ? originalUsername
      : profile.username
          ?.trim()
          .toLowerCase() || '';

    const currentAuthEmail =
      authEmail ||
      user.email?.trim().toLowerCase() ||
      '';

    const requestedEmail =
      profile.email
        ?.trim()
        .toLowerCase() || '';

    // -------------------------------------------------------
    // USERNAME VALIDATION
    // -------------------------------------------------------
    if (
      username &&
      username !==
        originalUsername?.toLowerCase() &&
      usernameAvailable === false
    ) {
      toast({
        title: 'Username unavailable',
        description:
          'Please choose another username.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);

      // =====================================================
      // EMAIL SECURITY
      // =====================================================

      // -----------------------------------------------------
      // VERIFIED EMAIL
      //
      // NEVER change Auth email.
      // NEVER accept a different profile email.
      // -----------------------------------------------------
      if (emailVerified) {
        if (
          requestedEmail !== currentAuthEmail
        ) {
          setProfile((prev) => ({
            ...prev,
            email: currentAuthEmail
          }));
        }
      }

      // -----------------------------------------------------
      // UNVERIFIED EMAIL
      //
      // If user entered a different email, initiate the
      // Supabase Auth email-change/verification process.
      //
      // IMPORTANT:
      // We do NOT save requestedEmail to profiles.email here.
      // The current Auth email remains the source of truth
      // until verification is completed.
      // -----------------------------------------------------
      else if (
        requestedEmail &&
        requestedEmail !== currentAuthEmail
      ) {
        const {
          error: emailUpdateError
        } = await supabase.auth.updateUser({
          email: requestedEmail
        });

        if (emailUpdateError) {
          console.error(
            'Email update error:',
            emailUpdateError
          );

          toast({
            title: 'Email change failed',
            description:
              emailUpdateError.message ||
              'Unable to start email change.',
            variant: 'destructive'
          });

          return;
        }

        // Keep profile email equal to the current Auth
        // email until the new email is actually confirmed.
        setProfile((prev) => ({
          ...prev,
          email: currentAuthEmail
        }));

        toast({
          title: 'Verification email sent',
          description:
            'Please check your new email and complete verification.'
        });
      }

      // =====================================================
      // PROFILE UPDATE
      // =====================================================

      const profileUpdate = {
        full_name:
          profile.full_name?.trim() || '',

        username,

        profession:
          profile.profession?.trim() || '',

        bio:
          profile.bio?.trim() || '',

        about:
          profile.about?.trim() || '',

        location:
          profile.location?.trim() || '',

        belongs_to:
          profile.belongs_to?.trim() || '',

        // Auth email is ALWAYS the source of truth.
        email: currentAuthEmail,

        // Phone remains fully editable.
        phone:
          profile.phone?.trim() || '',

        website:
          profile.website?.trim() || '',

        linkedin_url:
          profile.linkedin_url?.trim() || '',

        current_position:
          profile.current_position?.trim() || '',

        company_name:
          profile.company_name?.trim() || '',

        industry:
          profile.industry?.trim() || ''
      };

      // =====================================================
      // PROFILE COMPLETION SCORE
      // =====================================================
      const completionFields = [
        ['full_name', 10],
        ['email', 5],
        ['avatar_url', 10],
        ['bio', 15],
        ['current_position', 15],
        ['company_name', 15],
        ['location', 10],
        ['phone', 5],
        ['linkedin_url', 10],
        ['website', 10]
      ];

      let completionScore = 0;

      completionFields.forEach(
        ([field, weight]) => {
          const value =
            field === 'avatar_url'
              ? profile.avatar_url
              : profileUpdate[field];

          if (
            value !== null &&
            value !== undefined &&
            String(value).trim().length > 0
          ) {
            completionScore += weight;
          }
        }
      );

      completionScore = Math.min(
        completionScore,
        100
      );

      profileUpdate.profile_completion_score =
        completionScore;

      // =====================================================
      // SAVE PROFILE
      // =====================================================
      const {
        data: savedProfile,
        error
      } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error(
          'Profile update error:',
          error
        );

        if (
          error.code === '23505' ||
          error.message
            ?.toLowerCase()
            .includes('username')
        ) {
          toast({
            title: 'Username unavailable',
            description:
              'This username is already taken.',
            variant: 'destructive'
          });

          return;
        }

        throw error;
      }

      // =====================================================
      // UPDATE LOCAL STATE
      // =====================================================
      setProfile({
        ...savedProfile,
        email: currentAuthEmail
      });

      setOriginalUsername(
        savedProfile.username || ''
      );

      setUsernameAvailable(true);

      initialProfileRef.current = {
        ...savedProfile,
        email: currentAuthEmail
      };

      setIsDirty(false);

      // =====================================================
      // INFORM PARENT
      // =====================================================
      if (onProfileUpdate) {
        await onProfileUpdate({
          ...savedProfile,
          email: currentAuthEmail
        });
      }

      // If email was changed while unverified, the profile
      // itself was saved with the CURRENT Auth email only.
      const emailWasChanged =
        !emailVerified &&
        requestedEmail &&
        requestedEmail !== currentAuthEmail;

      toast({
        title: emailWasChanged
          ? 'Profile updated'
          : 'Profile updated',

        description: emailWasChanged
          ? 'Your profile was saved. Verify the new email to complete the email change.'
          : 'Your profile has been saved successfully.'
      });

      setOpen(false);
    } catch (error) {
      console.error(
        'Error updating profile:',
        error
      );

      toast({
        title: 'Error',
        description:
          error?.message ||
          'Failed to update your profile.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // ADD SKILL
  // =========================================================
  const handleAddSkill = async () => {
    if (!newSkill.skill_name.trim()) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_skills')
        .insert({
          ...newSkill,
          user_id: user.id
        });

      if (error) {
        throw error;
      }

      await fetchProfileData();

      setNewSkill({
        skill_name: '',
        level: 'Beginner'
      });

      toast({
        title: 'Success',
        description:
          'Skill added successfully'
      });
    } catch (error) {
      console.error(
        'Error adding skill:',
        error
      );

      toast({
        title: 'Error',
        description:
          'Failed to add skill',
        variant: 'destructive'
      });
    }
  };

  // =========================================================
  // DELETE SKILL
  // =========================================================
  const handleDeleteSkill = async (
    skillId
  ) => {
    try {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', skillId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setSkills((prev) =>
        prev.filter(
          (skill) => skill.id !== skillId
        )
      );

      toast({
        title: 'Success',
        description:
          'Skill removed successfully'
      });
    } catch (error) {
      console.error(
        'Error deleting skill:',
        error
      );

      toast({
        title: 'Error',
        description:
          'Failed to remove skill',
        variant: 'destructive'
      });
    }
  };

  // =========================================================
  // ADD EXPERIENCE
  // =========================================================
  const handleAddExperience = async () => {
    if (
      !newExperience.company.trim() ||
      !newExperience.position.trim()
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_experience')
        .insert({
          ...newExperience,
          user_id: user.id
        });

      if (error) {
        throw error;
      }

      await fetchProfileData();

      setNewExperience({
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
        location: ''
      });

      toast({
        title: 'Success',
        description:
          'Experience added successfully'
      });
    } catch (error) {
      console.error(
        'Error adding experience:',
        error
      );

      toast({
        title: 'Error',
        description:
          'Failed to add experience',
        variant: 'destructive'
      });
    }
  };

  // =========================================================
  // ADD EDUCATION
  // =========================================================
  const handleAddEducation = async () => {
    if (
      !newEducation.institution.trim() ||
      !newEducation.degree.trim()
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_education')
        .insert({
          ...newEducation,
          user_id: user.id
        });

      if (error) {
        throw error;
      }

      await fetchProfileData();

      setNewEducation({
        institution: '',
        degree: '',
        field_of_study: '',
        start_year: '',
        end_year: '',
        grade: '',
        description: ''
      });

      toast({
        title: 'Success',
        description:
          'Education added successfully'
      });
    } catch (error) {
      console.error(
        'Error adding education:',
        error
      );

      toast({
        title: 'Error',
        description:
          'Failed to add education',
        variant: 'destructive'
      });
    }
  };

  // =========================================================
  // ADD CERTIFICATE
  // =========================================================
  const handleAddCertificate = async () => {
    if (
      !newCertificate.title.trim() ||
      !newCertificate.issuer.trim()
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_certificates')
        .insert({
          ...newCertificate,
          user_id: user.id
        });

      if (error) {
        throw error;
      }

      await fetchProfileData();

      setNewCertificate({
        title: '',
        issuer: '',
        issue_date: '',
        expiry_date: '',
        credential_id: '',
        credential_url: ''
      });

      toast({
        title: 'Success',
        description:
          'Certificate added successfully'
      });
    } catch (error) {
      console.error(
        'Error adding certificate:',
        error
      );

      toast({
        title: 'Error',
        description:
          'Failed to add certificate',
        variant: 'destructive'
      });
    }
  };

  // =========================================================
  // ADD LANGUAGE
  // =========================================================
  const handleAddLanguage = async () => {
    if (!newLanguage.language.trim()) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_languages')
        .insert({
          ...newLanguage,
          user_id: user.id
        });

      if (error) {
        throw error;
      }

      await fetchProfileData();

      setNewLanguage({
        language: '',
        proficiency: 'Beginner'
      });

      toast({
        title: 'Success',
        description:
          'Language added successfully'
      });
    } catch (error) {
      console.error(
        'Error adding language:',
        error
      );

      toast({
        title: 'Error',
        description:
          'Failed to add language',
        variant: 'destructive'
      });
    }
  };

  // =========================================================
  // ADD ACHIEVEMENT
  // =========================================================
  const handleAddAchievement = async () => {
    if (!newAchievement.title.trim()) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          ...newAchievement,
          user_id: user.id
        });

      if (error) {
        throw error;
      }

      await fetchProfileData();

      setNewAchievement({
        title: '',
        description: '',
        achievement_date: '',
        category: 'General'
      });

      toast({
        title: 'Success',
        description:
          'Achievement added successfully'
      });
    } catch (error) {
      console.error(
        'Error adding achievement:',
        error
      );

      toast({
        title: 'Error',
        description:
          'Failed to add achievement',
        variant: 'destructive'
      });
    }
  };

  // =========================================================
  // DELETE EXPERIENCE
  // =========================================================
  const handleDeleteExperience = async (
    experienceId
  ) => {
    try {
      const { error } = await supabase
        .from('user_experience')
        .delete()
        .eq('id', experienceId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setExperience((prev) =>
        prev.filter(
          (item) =>
            item.id !== experienceId
        )
      );

      toast({
        title: 'Success',
        description:
          'Experience removed successfully'
      });
    } catch (error) {
      console.error(
        'Error deleting experience:',
        error
      );

      toast({
        title: 'Error',
        description:
          'Failed to remove experience',
        variant: 'destructive'
      });
    }
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      {!isControlled &&
        children && (
          <DialogTrigger asChild>
            {children}
          </DialogTrigger>
        )}

      <DialogContent
        className="
          max-w-4xl
          max-h-[90vh]
          overflow-y-auto
          scrollbar-hide
          !outline-none
          !ring-0
          !focus:outline-none
          !focus:ring-0
          !focus-visible:outline-none
          !focus-visible:ring-0
          !focus-visible:ring-offset-0
        "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">
              Basic
            </TabsTrigger>

            <TabsTrigger value="skills">
              Skills
            </TabsTrigger>

            <TabsTrigger value="experience">
              Experience
            </TabsTrigger>

            <TabsTrigger value="education">
              Education
            </TabsTrigger>

            <TabsTrigger value="certificates">
              Certificates
            </TabsTrigger>

            <TabsTrigger value="achievements">
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <TabsContent
            value="basic"
            className="space-y-5"
          >
            {/* Full Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="full_name"
                  className="mb-2 block"
                >
                  Full Name
                </Label>

                <Input
                  id="full_name"
                  value={
                    profile.full_name || ''
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      full_name:
                        e.target.value
                    })
                  }
                  placeholder="Enter full name"
                />
              </div>

              {/* Username */}
              <div>
                <Label
                  htmlFor="username"
                  className="mb-2 block"
                >
                  Username
                </Label>

                <div className="relative">
                  <Input
                    id="username"
                    value={
                      profile.username || ''
                    }
                    readOnly={Boolean(
                      originalUsername
                    )}
                    disabled={Boolean(
                      originalUsername
                    )}
                    onChange={(e) => {
                      if (originalUsername) {
                        return;
                      }

                      setProfile((prev) => ({
                        ...prev,
                        username:
                          e.target.value
                            .toLowerCase()
                            .replace(
                              /[^a-z0-9_]/g,
                              ''
                            )
                      }));
                    }}
                    placeholder="Enter your username"
                    className={`pr-10 ${
                      originalUsername
                        ? 'cursor-not-allowed bg-muted/60 text-muted-foreground opacity-70'
                        : usernameAvailable ===
                          false
                        ? 'border-destructive'
                        : usernameAvailable ===
                          true
                        ? 'border-green-500'
                        : ''
                    }`}
                  />

                  {originalUsername ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checkingUsername && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}

                      {!checkingUsername &&
                        usernameAvailable ===
                          true && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}

                      {!checkingUsername &&
                        usernameAvailable ===
                          false && (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground mt-1">
                  {originalUsername ? (
                    <span>
                      {/* Username cannot be changed later. */}
                    </span>
                  ) : profile.username ? (
                    usernameAvailable ===
                    false ? (
                      <span className="text-destructive">
                        Username not available
                      </span>
                    ) : usernameAvailable ===
                      true ? (
                      <span className="text-green-500">
                        Username available
                      </span>
                    ) : (
                      <span>
                        Checking username availability...
                      </span>
                    )
                  ) : (
                    <span>
                      {/* Choose a unique username. It cannot be changed later. */}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Profession + Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="profession"
                  className="mb-2 block"
                >
                  Profession
                </Label>

                <Input
                  id="profession"
                  value={
                    profile.profession || ''
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      profession:
                        e.target.value
                    })
                  }
                  placeholder="e.g. Senior Product Manager"
                />
              </div>

              <div>
                <Label
                  htmlFor="location"
                  className="mb-2 block"
                >
                  City
                </Label>

                <Input
                  id="location"
                  value={
                    profile.location || ''
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      location:
                        e.target.value
                    })
                  }
                  placeholder="e.g. Delhi"
                />
              </div>
            </div>

            {/* Current Position + Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="current_position"
                  className="mb-2 block"
                >
                  Current Position
                </Label>

                <Input
                  id="current_position"
                  value={
                    profile.current_position ||
                    ''
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      current_position:
                        e.target.value
                    })
                  }
                  placeholder="Current job title"
                />
              </div>

              <div>
                <Label
                  htmlFor="company_name"
                  className="mb-2 block"
                >
                  Company
                </Label>

                <Input
                  id="company_name"
                  value={
                    profile.company_name || ''
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      company_name:
                        e.target.value
                    })
                  }
                  placeholder="Current company"
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* EMAIL */}
              <div>
                <Label
                  htmlFor="email"
                  className="mb-2 block"
                >
                  Email
                </Label>

                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={
                      profile.email ||
                      authEmail ||
                      ''
                    }
                    onChange={(e) => {
                      if (emailVerified) {
                        return;
                      }

                      setProfile((prev) => ({
                        ...prev,
                        email:
                          e.target.value
                      }));
                    }}
                    disabled={emailVerified}
                    readOnly={emailVerified}
                    className={
                      emailVerified
                        ? 'pr-10 cursor-not-allowed bg-muted/60 text-muted-foreground opacity-70'
                        : 'pr-10'
                    }
                    placeholder="your.email@example.com"
                  />

                  {emailVerified && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground mt-1">
                  {emailVerified ? (
                    <span className="text-green-600">
                      Verified
                    </span>
                  ) : (
                    <span>
                      Verify your email address
                    </span>
                  )}
                </p>
              </div>

              {/* PHONE */}
              <div>
                <Label
                  htmlFor="phone"
                  className="mb-2 block"
                >
                  Phone
                </Label>

                <Input
                  id="phone"
                  value={
                    profile.phone || ''
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      phone:
                        e.target.value
                    })
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Website + LinkedIn */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="website"
                  className="mb-2 block"
                >
                  Website
                </Label>

                <Input
                  id="website"
                  value={
                    profile.website || ''
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      website:
                        e.target.value
                    })
                  }
                  placeholder="https://www.example.com/"
                />
              </div>

              <div>
                <Label
                  htmlFor="linkedin_url"
                  className="mb-2 block"
                >
                  LinkedIn URL
                </Label>

                <Input
                  id="linkedin_url"
                  value={
                    profile.linkedin_url ||
                    ''
                  }
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      linkedin_url:
                        e.target.value
                    })
                  }
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label
                htmlFor="bio"
                className="mb-2 block"
              >
                Bio
              </Label>

              <Textarea
                id="bio"
                value={profile.bio || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bio: e.target.value
                  })
                }
                placeholder="Brief description about yourself"
                rows={4}
              />
            </div>

            {/* About */}
            <div>
              <Label
                htmlFor="about"
                className="mb-2 block"
              >
                About
              </Label>

              <Textarea
                id="about"
                value={
                  profile.about || ''
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    about:
                      e.target.value
                  })
                }
                placeholder="Detailed description about your professional background"
                rows={5}
              />
            </div>
          </TabsContent>

          {/* =================================================
              SKILLS
          ================================================= */}

          <TabsContent
            value="skills"
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  Add New Skill
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    value={
                      newSkill.skill_name
                    }
                    onChange={(e) =>
                      setNewSkill({
                        ...newSkill,
                        skill_name:
                          e.target.value
                      })
                    }
                    placeholder="Skill name"
                    className="flex-1"
                  />

                  <Select
                    value={newSkill.level}
                    onValueChange={(value) =>
                      setNewSkill({
                        ...newSkill,
                        level: value
                      })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Beginner">
                        Beginner
                      </SelectItem>

                      <SelectItem value="Intermediate">
                        Intermediate
                      </SelectItem>

                      <SelectItem value="Advanced">
                        Advanced
                      </SelectItem>

                      <SelectItem value="Expert">
                        Expert
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleAddSkill}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-2">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {skill.skill_name}
                    </span>

                    <Badge variant="outline">
                      {skill.level}
                    </Badge>

                    <span className="text-sm text-muted-foreground">
                      {skill.endorsements_count}{' '}
                      endorsements
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDeleteSkill(
                        skill.id
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* =================================================
              EXPERIENCE
          ================================================= */}

          <TabsContent
            value="experience"
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  Add Experience
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={
                      newExperience.position
                    }
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        position:
                          e.target.value
                      })
                    }
                    placeholder="Job title"
                  />

                  <Input
                    value={
                      newExperience.company
                    }
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        company:
                          e.target.value
                      })
                    }
                    placeholder="Company name"
                  />

                  <Input
                    type="date"
                    value={
                      newExperience.start_date
                    }
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        start_date:
                          e.target.value
                      })
                    }
                  />

                  <Input
                    type="date"
                    value={
                      newExperience.end_date
                    }
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        end_date:
                          e.target.value
                      })
                    }
                    disabled={
                      newExperience.is_current
                    }
                  />

                  <Input
                    value={
                      newExperience.location
                    }
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        location:
                          e.target.value
                      })
                    }
                    placeholder="Location"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={
                      newExperience.is_current
                    }
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        is_current:
                          e.target.checked
                      })
                    }
                  />

                  <Label htmlFor="is_current">
                    I currently work here
                  </Label>
                </div>

                <Textarea
                  value={
                    newExperience.description
                  }
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      description:
                        e.target.value
                    })
                  }
                  placeholder="Job description"
                  rows={3}
                />

                <Button
                  onClick={
                    handleAddExperience
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {experience.map((exp) => (
                <Card key={exp.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">
                          {exp.position}
                        </h4>

                        <p className="text-primary font-medium">
                          {exp.company}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {exp.start_date} -{' '}
                          {exp.is_current
                            ? 'Present'
                            : exp.end_date}
                        </p>

                        {exp.location && (
                          <p className="text-sm text-muted-foreground">
                            {exp.location}
                          </p>
                        )}

                        {exp.description && (
                          <p className="text-sm mt-2">
                            {exp.description}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteExperience(
                            exp.id
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* =================================================
              EDUCATION
          ================================================= */}

          <TabsContent
            value="education"
            className="space-y-4"
          >
            <p className="text-muted-foreground">
              Education section coming soon...
            </p>
          </TabsContent>

          {/* =================================================
              CERTIFICATES
          ================================================= */}

          <TabsContent
            value="certificates"
            className="space-y-4"
          >
            <p className="text-muted-foreground">
              Certificates section coming soon...
            </p>
          </TabsContent>

          {/* =================================================
              ACHIEVEMENTS
          ================================================= */}

          <TabsContent
            value="achievements"
            className="space-y-4"
          >
            <p className="text-muted-foreground">
              Achievements section coming soon...
            </p>
          </TabsContent>
        </Tabs>

        {/* ===================================================
            FOOTER BUTTONS
        =================================================== */}

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveProfile}
            disabled={
              !isDirty ||
              saving ||
              checkingUsername ||
              (
                !originalUsername &&
                profile.username &&
                usernameAvailable === false
              )
            }
            className={
              !isDirty ||
              saving ||
              checkingUsername
                ? 'cursor-not-allowed opacity-50'
                : ''
            }
          >
            {saving
              ? 'Saving...'
              : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
