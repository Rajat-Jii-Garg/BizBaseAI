export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean | null
          slug: string
          tags: Json | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_id: string
          category?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          tags?: Json | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_id?: string
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          tags?: Json | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      business_leads: {
        Row: {
          assigned_to: string | null
          business_id: string
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          business_id: string
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          business_id?: string
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_projects: {
        Row: {
          budget: number | null
          business_id: string
          client_name: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          name: string
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          business_id: string
          client_name?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          business_id?: string
          client_name?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_projects_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_services: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_team_members: {
        Row: {
          business_id: string
          created_at: string
          department: string | null
          email: string | null
          id: string
          joined_at: string | null
          name: string
          permissions: Json | null
          role: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          joined_at?: string | null
          name: string
          permissions?: Json | null
          role: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          joined_at?: string | null
          name?: string
          permissions?: Json | null
          role?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_team_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_transactions: {
        Row: {
          amount: number
          business_id: string
          category: string | null
          created_at: string
          date: string | null
          description: string | null
          id: string
          invoice_number: string | null
          payment_method: string | null
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          business_id: string
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          invoice_number?: string | null
          payment_method?: string | null
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          business_id?: string
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          invoice_number?: string | null
          payment_method?: string | null
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string
          banner_url: string | null
          business_type: string
          category: string
          city: string | null
          country: string | null
          created_at: string
          description: string
          email: string
          followers_count: number | null
          id: string
          industry: string
          is_verified: boolean | null
          logo_url: string | null
          name: string
          owner_id: string
          phone: string
          status: string
          updated_at: string
          username: string | null
          views_count: number | null
          website: string | null
        }
        Insert: {
          address: string
          banner_url?: string | null
          business_type: string
          category: string
          city?: string | null
          country?: string | null
          created_at?: string
          description: string
          email: string
          followers_count?: number | null
          id?: string
          industry: string
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          owner_id: string
          phone: string
          status?: string
          updated_at?: string
          username?: string | null
          views_count?: number | null
          website?: string | null
        }
        Update: {
          address?: string
          banner_url?: string | null
          business_type?: string
          category?: string
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string
          email?: string
          followers_count?: number | null
          id?: string
          industry?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string
          status?: string
          updated_at?: string
          username?: string | null
          views_count?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_signals: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          receiver_id: string | null
          sender_id: string | null
          signal_type: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
          signal_type?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
          signal_type?: string | null
        }
        Relationships: []
      }
      communities: {
        Row: {
          activity_level: string | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_private: boolean
          members_count: number | null
          name: string
          rules: string | null
          tags: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_private?: boolean
          members_count?: number | null
          name: string
          rules?: string | null
          tags?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_level?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_private?: boolean
          members_count?: number | null
          name?: string
          rules?: string | null
          tags?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          participant1_id: string
          participant2_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          participant1_id: string
          participant2_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          participant1_id?: string
          participant2_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant1_id_fkey"
            columns: ["participant1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant2_id_fkey"
            columns: ["participant2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      endorsements: {
        Row: {
          created_at: string
          endorsed_user_id: string
          endorser_id: string
          id: string
          skill: string
        }
        Insert: {
          created_at?: string
          endorsed_user_id: string
          endorser_id: string
          id?: string
          skill: string
        }
        Update: {
          created_at?: string
          endorsed_user_id?: string
          endorser_id?: string
          id?: string
          skill?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          created_at: string
          date: string
          description: string | null
          featured: boolean | null
          id: string
          location: string
          max_attendees: number | null
          price: string | null
          tags: Json | null
          time: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          date: string
          description?: string | null
          featured?: boolean | null
          id?: string
          location: string
          max_attendees?: number | null
          price?: string | null
          tags?: Json | null
          time: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          location?: string
          max_attendees?: number | null
          price?: string | null
          tags?: Json | null
          time?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      hashtags: {
        Row: {
          created_at: string
          id: string
          name: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          usage_count?: number
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          applied_at: string
          cover_letter: string | null
          id: string
          job_id: string
          resume_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id: string
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id?: string
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          application_deadline: string | null
          applications_count: number
          benefits: string[] | null
          company_name: string
          created_at: string
          description: string
          employer_id: string
          experience_level: string
          id: string
          industry: string
          is_active: boolean
          is_featured: boolean
          job_type: string
          location: string
          requirements: string[] | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          title: string
          updated_at: string
          views_count: number
          work_mode: string
        }
        Insert: {
          application_deadline?: string | null
          applications_count?: number
          benefits?: string[] | null
          company_name: string
          created_at?: string
          description: string
          employer_id: string
          experience_level?: string
          id?: string
          industry: string
          is_active?: boolean
          is_featured?: boolean
          job_type?: string
          location: string
          requirements?: string[] | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          title: string
          updated_at?: string
          views_count?: number
          work_mode?: string
        }
        Update: {
          application_deadline?: string | null
          applications_count?: number
          benefits?: string[] | null
          company_name?: string
          created_at?: string
          description?: string
          employer_id?: string
          experience_level?: string
          id?: string
          industry?: string
          is_active?: boolean
          is_featured?: boolean
          job_type?: string
          location?: string
          requirements?: string[] | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number
          work_mode?: string
        }
        Relationships: []
      }
      LEADS: {
        Row: {
          ai_summary: string | null
          audience: string | null
          business: string | null
          created_at: string
          email: string | null
          id: string
          leads_csv: string | null
          name: string | null
          website: string | null
        }
        Insert: {
          ai_summary?: string | null
          audience?: string | null
          business?: string | null
          created_at?: string
          email?: string | null
          id?: string
          leads_csv?: string | null
          name?: string | null
          website?: string | null
        }
        Update: {
          ai_summary?: string | null
          audience?: string | null
          business?: string | null
          created_at?: string
          email?: string | null
          id?: string
          leads_csv?: string | null
          name?: string | null
          website?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          id: string
          read: boolean
          related_id: string | null
          related_user_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          read?: boolean
          related_id?: string | null
          related_user_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          read?: boolean
          related_id?: string | null
          related_user_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_verifications: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          otp_code: string
          purpose: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          otp_code: string
          purpose: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          purpose?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_hashtags: {
        Row: {
          created_at: string
          hashtag_id: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          hashtag_id: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          hashtag_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_mentions: {
        Row: {
          created_at: string
          id: string
          mentioned_user_id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentioned_user_id: string
          post_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mentioned_user_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_mentions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_polls: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          options: Json
          post_id: string
          question: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          options?: Json
          post_id: string
          question: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          options?: Json
          post_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reposts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reposts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number | null
          repost_of_post_id: string | null
          repost_of_user_id: string | null
          reposts_count: number | null
          shares_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          repost_of_post_id?: string | null
          repost_of_user_id?: string | null
          reposts_count?: number | null
          shares_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          repost_of_post_id?: string | null
          repost_of_user_id?: string | null
          reposts_count?: number | null
          shares_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_repost_of_post_id_fkey"
            columns: ["repost_of_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          profile_user_id: string
          viewed_at: string
          viewer_user_id: string | null
        }
        Insert: {
          id?: string
          profile_user_id: string
          viewed_at?: string
          viewer_user_id?: string | null
        }
        Update: {
          id?: string
          profile_user_id?: string
          viewed_at?: string
          viewer_user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string | null
          achievements: Json | null
          actively_looking_for_work: boolean | null
          avatar_url: string | null
          banner_url: string | null
          belongs_to: string | null
          bio: string | null
          bizcoins: number | null
          business_type: string | null
          company_name: string | null
          created_at: string | null
          current_position: string | null
          education: string | null
          email: string | null
          email_verified: boolean | null
          experience_years: number | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          github_url: string | null
          id: string
          industry: string | null
          is_verified: boolean | null
          linkedin_url: string | null
          location: string | null
          nickname: string | null
          personal_branding_score: number | null
          phone: string | null
          portfolio_url: string | null
          posts_count: number | null
          power_score: number | null
          profession: string | null
          profile_completed: boolean | null
          profile_completion_score: number | null
          referral_code: string | null
          referred_by: string | null
          resume_url: string | null
          skills: Json | null
          subscription_plan: string | null
          this_month_views: number | null
          total_profile_views: number | null
          twitter_url: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          about?: string | null
          achievements?: Json | null
          actively_looking_for_work?: boolean | null
          avatar_url?: string | null
          banner_url?: string | null
          belongs_to?: string | null
          bio?: string | null
          bizcoins?: number | null
          business_type?: string | null
          company_name?: string | null
          created_at?: string | null
          current_position?: string | null
          education?: string | null
          email?: string | null
          email_verified?: boolean | null
          experience_years?: number | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          github_url?: string | null
          id: string
          industry?: string | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          nickname?: string | null
          personal_branding_score?: number | null
          phone?: string | null
          portfolio_url?: string | null
          posts_count?: number | null
          power_score?: number | null
          profession?: string | null
          profile_completed?: boolean | null
          profile_completion_score?: number | null
          referral_code?: string | null
          referred_by?: string | null
          resume_url?: string | null
          skills?: Json | null
          subscription_plan?: string | null
          this_month_views?: number | null
          total_profile_views?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          about?: string | null
          achievements?: Json | null
          actively_looking_for_work?: boolean | null
          avatar_url?: string | null
          banner_url?: string | null
          belongs_to?: string | null
          bio?: string | null
          bizcoins?: number | null
          business_type?: string | null
          company_name?: string | null
          created_at?: string | null
          current_position?: string | null
          education?: string | null
          email?: string | null
          email_verified?: boolean | null
          experience_years?: number | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          nickname?: string | null
          personal_branding_score?: number | null
          phone?: string | null
          portfolio_url?: string | null
          posts_count?: number | null
          power_score?: number | null
          profession?: string | null
          profile_completed?: boolean | null
          profile_completion_score?: number | null
          referral_code?: string | null
          referred_by?: string | null
          resume_url?: string | null
          skills?: Json | null
          subscription_plan?: string | null
          this_month_views?: number | null
          total_profile_views?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          coins_awarded: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          coins_awarded?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          coins_awarded?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      saved_events: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          id: string
          job_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          job_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          job_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_date: string
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          achievement_date: string
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          achievement_date?: string
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_certificates: {
        Row: {
          created_at: string
          credential_id: string | null
          credential_url: string | null
          expiry_date: string | null
          id: string
          is_verified: boolean
          issue_date: string | null
          issuer: string
          logo_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          is_verified?: boolean
          issue_date?: string | null
          issuer: string
          logo_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          is_verified?: boolean
          issue_date?: string | null
          issuer?: string
          logo_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_content_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          post_id: string
          user_id: string
          view_duration_seconds: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          post_id: string
          user_id: string
          view_duration_seconds?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          post_id?: string
          user_id?: string
          view_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_content_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_creator_affinity: {
        Row: {
          affinity_score: number | null
          created_at: string
          creator_id: string
          id: string
          last_interaction_at: string
          total_interactions: number | null
          user_id: string
        }
        Insert: {
          affinity_score?: number | null
          created_at?: string
          creator_id: string
          id?: string
          last_interaction_at?: string
          total_interactions?: number | null
          user_id: string
        }
        Update: {
          affinity_score?: number | null
          created_at?: string
          creator_id?: string
          id?: string
          last_interaction_at?: string
          total_interactions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_creator_affinity_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_education: {
        Row: {
          created_at: string
          degree: string
          description: string | null
          end_year: number | null
          field_of_study: string | null
          grade: string | null
          id: string
          institution: string
          start_year: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          degree: string
          description?: string | null
          end_year?: number | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution: string
          start_year?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          degree?: string
          description?: string | null
          end_year?: number | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution?: string
          start_year?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_experience: {
        Row: {
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean
          location: string | null
          position: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          position: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          position?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_feed_preferences: {
        Row: {
          created_at: string
          discovery_ratio: number | null
          id: string
          last_feed_refresh_at: string | null
          preferred_content_types: Json | null
          preferred_post_length: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discovery_ratio?: number | null
          id?: string
          last_feed_refresh_at?: string | null
          preferred_content_types?: Json | null
          preferred_post_length?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discovery_ratio?: number | null
          id?: string
          last_feed_refresh_at?: string | null
          preferred_content_types?: Json | null
          preferred_post_length?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string
          id: string
          interaction_count: number | null
          interest_type: string
          interest_value: string
          last_updated_at: string
          score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_count?: number | null
          interest_type: string
          interest_value: string
          last_updated_at?: string
          score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_count?: number | null
          interest_type?: string
          interest_value?: string
          last_updated_at?: string
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_languages: {
        Row: {
          created_at: string
          id: string
          language: string
          proficiency: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          proficiency?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          proficiency?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string
          endorsements_count: number
          id: string
          level: string
          skill_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endorsements_count?: number
          id?: string
          level?: string
          skill_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          endorsements_count?: number
          id?: string
          level?: string
          skill_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_bizcoins:
        | {
            Args: { _amount: number; _reason?: string; _user_id: string }
            Returns: undefined
          }
        | {
            Args: { _amount: number; _reason?: string; _user_id: string }
            Returns: undefined
          }
      calculate_profile_completion: {
        Args: { profile_id: string }
        Returns: number
      }
      create_notification: {
        Args: {
          notification_content: string
          notification_title: string
          notification_type: string
          recipient_id: string
          related_post_id?: string
          related_user_id?: string
        }
        Returns: string
      }
      decay_user_interests: { Args: never; Returns: undefined }
      generate_otp: { Args: never; Returns: string }
      get_entity_by_username: {
        Args: { search_username: string }
        Returns: {
          avatar_url: string
          entity_data: Json
          entity_id: string
          entity_name: string
          entity_type: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_job_views: { Args: { job_id: string }; Returns: undefined }
      is_username_available: {
        Args: { check_username: string }
        Returns: boolean
      }
      process_post_hashtags: {
        Args: { content: string; post_id: string }
        Returns: undefined
      }
      process_post_mentions: {
        Args: { content: string; post_id: string }
        Returns: undefined
      }
      send_otp_email: {
        Args: { otp_purpose: string; user_email: string }
        Returns: string
      }
      verify_otp: {
        Args: { otp_purpose: string; provided_otp: string; user_email: string }
        Returns: boolean
      }
      verify_otp_email: {
        Args: { otp_purpose: string; provided_otp: string; user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
