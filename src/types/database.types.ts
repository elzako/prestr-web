// import Stripe from 'stripe';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      access_tokens: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          presentation_id: string | null
          token_id: string
          viewer: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          presentation_id?: string | null
          token_id?: string
          viewer?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          presentation_id?: string | null
          token_id?: string
          viewer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'access_tokens_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'access_tokens_presentation_id_fkey'
            columns: ['presentation_id']
            isOneToOne: false
            referencedRelation: 'presentations'
            referencedColumns: ['id']
          },
        ]
      }
      flyway_schema_history: {
        Row: {
          checksum: number | null
          description: string
          execution_time: number
          installed_by: string
          installed_on: string
          installed_rank: number
          script: string
          success: boolean
          type: string
          version: string | null
        }
        Insert: {
          checksum?: number | null
          description: string
          execution_time: number
          installed_by: string
          installed_on?: string
          installed_rank: number
          script: string
          success: boolean
          type: string
          version?: string | null
        }
        Update: {
          checksum?: number | null
          description?: string
          execution_time?: number
          installed_by?: string
          installed_on?: string
          installed_rank?: number
          script?: string
          success?: boolean
          type?: string
          version?: string | null
        }
        Relationships: []
      }
      folders: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          folder_name: string
          full_path: string | null
          id: string
          locked: boolean
          locked_by: string | null
          metadata?: { description?: string }
          organization_id: string
          parent_id: string | null
          parent_path: unknown | null
          tags: string[]
          updated_at: string
          updated_by: string
          visibility: Database['public']['Enums']['visibility_options'] | null
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          folder_name: string
          full_path?: string | null
          id?: string
          locked?: boolean
          locked_by?: string | null
          metadata?: { description?: string }
          organization_id: string
          parent_id?: string | null
          parent_path?: unknown | null
          tags?: string[]
          updated_at?: string
          updated_by: string
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          folder_name?: string
          full_path?: string | null
          id?: string
          locked?: boolean
          locked_by?: string | null
          metadata?: { description?: string }
          organization_id?: string
          parent_id?: string | null
          parent_path?: unknown | null
          tags?: string[]
          updated_at?: string
          updated_by?: string
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'folders_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'folders_deleted_by_fkey'
            columns: ['deleted_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'folders_locked_by_fkey'
            columns: ['locked_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'folders_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'folders_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations_with_presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'folders_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'folders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'folders_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          content: { message: string }
          created_at: string
          id: string
          organization_id: string | null
          read: boolean | null
          user_id: string | null
        }
        Insert: {
          content: { message: string }
          created_at?: string
          id?: string
          organization_id?: string | null
          read?: boolean | null
          user_id?: string | null
        }
        Update: {
          content?: { message: string }
          created_at?: string
          id?: string
          organization_id?: string | null
          read?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations_with_presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      organization_chat_history: {
        Row: {
          created_at: string
          folder_id: string | null
          guest_id: string | null
          id: string
          message: string | null
          message_type: string | null
          organization_id: string
          presentation_id: string | null
          similar_slides?: Partial<Tables<'slides'>>[] | null
          user_id: string | null
          slide_paths?: { path: string; url: string }[] | null
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          guest_id?: string | null
          id?: string
          message?: string | null
          message_type?: string | null
          organization_id: string
          presentation_id?: string | null
          similar_slides?: Partial<Tables<'slides'>>[] | null
          user_id?: string | null
          slide_paths?: { path: string; url: string }[] | null
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          guest_id?: string | null
          id?: string
          message?: string | null
          message_type?: string | null
          organization_id?: string
          presentation_id?: string | null
          similar_slides?: Partial<Tables<'slides'>>[] | null
          user_id?: string | null
          slide_paths?: { path: string; url: string }[] | null
        }
        Relationships: [
          {
            foreignKeyName: 'organization_chat_history_folder_id_fkey'
            columns: ['folder_id']
            isOneToOne: false
            referencedRelation: 'folders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_chat_history_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_chat_history_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations_with_presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_chat_history_presentation_id_fkey'
            columns: ['presentation_id']
            isOneToOne: false
            referencedRelation: 'presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_chat_history_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          organization_id: string
          status: Database['public']['Enums']['invitation_status'] | null
          user_id: string | null
          user_role: Database['public']['Enums']['organization_role'] | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          organization_id: string
          status?: Database['public']['Enums']['invitation_status'] | null
          user_id?: string | null
          user_role: Database['public']['Enums']['organization_role'] | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          organization_id?: string
          status?: Database['public']['Enums']['invitation_status'] | null
          user_id?: string | null
          user_role?: Database['public']['Enums']['organization_role'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'organization_invitations_invited_by_fkey'
            columns: ['invited_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_invitations_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_invitations_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations_with_presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_invitations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      organization_uploads: {
        Row: {
          file_name: string
          id: string
          organization_id: string
          slide_count: number
          upload_date: string
          uploader: string
        }
        Insert: {
          file_name: string
          id?: string
          organization_id: string
          slide_count: number
          upload_date?: string
          uploader: string
        }
        Update: {
          file_name?: string
          id?: string
          organization_id?: string
          slide_count?: number
          upload_date?: string
          uploader?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organization_uploads_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_uploads_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations_with_presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_uploads_uploader_fkey'
            columns: ['uploader']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          metadata?: {
            name?: string
            about?: string
            website?: string
            location?: string
            profilePicture?: string
            displayMembers?: boolean
          }
          organization_name: string
          settings: Json | null
          sys_period: unknown
          tags: string[]
          updated_at: string
          updated_by: string
          version: number | null
          presentation_count?: number
          organizations_billing?: Partial<
            Tables<'organizations_billing'>
          > | null
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          metadata?: {
            name?: string
            about?: string
            website?: string
            location?: string
            profilePicture?: string
            displayMembers?: boolean
          }
          organization_name: string
          settings?: Json | null
          sys_period?: unknown
          tags?: string[]
          updated_at?: string
          updated_by: string
          version?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          metadata?: {
            name?: string
            about?: string
            website?: string
            location?: string
            profilePicture?: string
            displayMembers?: boolean
          }
          organization_name?: string
          settings?: Json | null
          sys_period?: unknown
          tags?: string[]
          updated_at?: string
          updated_by?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'organizations_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organizations_deleted_by_fkey'
            columns: ['deleted_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organizations_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      organizations_billing: {
        Row: {
          id: string
          organization_id: string | null
          price_plan: string | null
          prompt_limit: number | null
          stripe_customer?: any // Stripe.Response<Stripe.Customer>;
          stripe_subscription: Json | null
          upload_limit: number | null
        }
        Insert: {
          id?: string
          organization_id?: string | null
          price_plan?: string | null
          prompt_limit?: number | null
          stripe_customer?: any // Stripe.Response<Stripe.Customer>;
          stripe_subscription?: Json | null
          upload_limit?: number | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          price_plan?: string | null
          prompt_limit?: number | null
          stripe_customer?: any // Stripe.Response<Stripe.Customer>;
          stripe_subscription?: Json | null
          upload_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'organizations_billing_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: true
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organizations_billing_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: true
            referencedRelation: 'organizations_with_presentations'
            referencedColumns: ['id']
          },
        ]
      }
      organizations_history: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          metadata: Json | null
          organization_name: string
          settings: Json | null
          sys_period: unknown
          tags: string[]
          updated_at: string
          updated_by: string
          version: number | null
        }
        Insert: {
          created_at: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          id: string
          metadata?: Json | null
          organization_name: string
          settings?: Json | null
          sys_period: unknown
          tags: string[]
          updated_at: string
          updated_by: string
          version?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          metadata?: Json | null
          organization_name?: string
          settings?: Json | null
          sys_period?: unknown
          tags?: string[]
          updated_at?: string
          updated_by?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_created_by'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_deleted_by'
            columns: ['deleted_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_updated_by'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      presentation_workflow: {
        Row: {
          comments: string | null
          id: string
          status: string | null
          sys_period: unknown
          updated_at: string
          updated_by: string
        }
        Insert: {
          comments?: string | null
          id: string
          status?: string | null
          sys_period?: unknown
          updated_at?: string
          updated_by: string
        }
        Update: {
          comments?: string | null
          id?: string
          status?: string | null
          sys_period?: unknown
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'presentation_workflow_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      presentation_workflow_history: {
        Row: {
          comments: string | null
          id: string
          status: string | null
          sys_period: unknown
          updated_at: string
          updated_by: string
        }
        Insert: {
          comments?: string | null
          id: string
          status?: string | null
          sys_period: unknown
          updated_at: string
          updated_by: string
        }
        Update: {
          comments?: string | null
          id?: string
          status?: string | null
          sys_period?: unknown
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_updated_by'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      presentations: {
        Row: {
          change_description: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          locked: boolean
          locked_by: string | null
          metadata?: { url?: string; description?: string }
          parent_id: string | null
          presentation_name: string
          settings: {
            pptxDownloadRole: Enums<'presentation_role'>
            pdfDownloadRole: Enums<'presentation_role'>
            chatRole: Enums<'presentation_role'>
          }
          slides?: {
            order: number
            slide_id: string
            object_id: string
            url?: string
          }[]
          sys_period: unknown
          tags: string[]
          updated_at: string
          updated_by: string
          version: number | null
        }
        Insert: {
          change_description?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          locked?: boolean
          locked_by?: string | null
          metadata?: { url?: string; description?: string }
          parent_id?: string | null
          presentation_name?: string | null
          settings?: {
            pptxDownloadRole: Enums<'presentation_role'>
            pdfDownloadRole: Enums<'presentation_role'>
            chatRole: Enums<'presentation_role'>
          }
          slides?: {
            order: number
            slide_id: string
            object_id: string
            url?: string
          }[]
          sys_period?: unknown
          tags?: string[]
          updated_at?: string
          updated_by: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Update: {
          change_description?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          locked?: boolean
          locked_by?: string | null
          metadata?: { url?: string; description?: string }
          parent_id?: string | null
          presentation_name?: string | null
          settings?: {
            pptxDownloadRole: Enums<'presentation_role'>
            pdfDownloadRole: Enums<'presentation_role'>
            chatRole: Enums<'presentation_role'>
          }
          slides?: {
            order: number
            slide_id: string
            object_id: string
            url?: string
          }[]
          sys_period?: unknown
          tags?: string[]
          updated_at?: string
          updated_by?: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'presentations_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'presentations_deleted_by_fkey'
            columns: ['deleted_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'presentations_locked_by_fkey'
            columns: ['locked_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'presentations_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'folders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'presentations_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      presentations_embedding: {
        Row: {
          embedding: string | null
          id: string
          presentation_id: string | null
        }
        Insert: {
          embedding?: string | null
          id?: string
          presentation_id?: string | null
        }
        Update: {
          embedding?: string | null
          id?: string
          presentation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'presentations_embedding_presentation_id_fkey'
            columns: ['presentation_id']
            isOneToOne: true
            referencedRelation: 'presentations'
            referencedColumns: ['id']
          },
        ]
      }
      presentations_history: {
        Row: {
          change_description: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          locked: boolean
          locked_by: string | null
          metadata: Json | null
          parent_id: string | null
          presentation_name: string | null
          settings: Json | null
          slides: Json | null
          sys_period: unknown
          tags: string[]
          updated_at: string
          updated_by: string
          version: number | null
          visibility: Database['public']['Enums']['visibility_options'] | null
        }
        Insert: {
          change_description?: string | null
          created_at: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          id: string
          locked: boolean
          locked_by?: string | null
          metadata?: Json | null
          parent_id?: string | null
          presentation_name?: string | null
          settings?: Json | null
          slides?: Json | null
          sys_period: unknown
          tags: string[]
          updated_at: string
          updated_by: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Update: {
          change_description?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          locked?: boolean
          locked_by?: string | null
          metadata?: Json | null
          parent_id?: string | null
          presentation_name?: string | null
          settings?: Json | null
          slides?: Json | null
          sys_period?: unknown
          tags?: string[]
          updated_at?: string
          updated_by?: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_created_by'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_deleted_by'
            columns: ['deleted_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_updated_by'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      slide_views: {
        Row: {
          fingerprint: string
          id: number
          slide_id: string
          viewed_at: string
        }
        Insert: {
          fingerprint: string
          id?: never
          slide_id: string
          viewed_at?: string
        }
        Update: {
          fingerprint?: string
          id?: never
          slide_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'slide_views_slide_id_fkey'
            columns: ['slide_id']
            isOneToOne: false
            referencedRelation: 'slides'
            referencedColumns: ['id']
          },
        ]
      }
      slide_workflow: {
        Row: {
          comments: string | null
          id: string
          status: string | null
          sys_period: unknown
          updated_at: string
          updated_by: string
        }
        Insert: {
          comments?: string | null
          id: string
          status?: string | null
          sys_period?: unknown
          updated_at?: string
          updated_by: string
        }
        Update: {
          comments?: string | null
          id?: string
          status?: string | null
          sys_period?: unknown
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'slide_workflow_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      slide_workflow_history: {
        Row: {
          comments: string | null
          id: string
          status: string | null
          sys_period: unknown
          updated_at: string
          updated_by: string
        }
        Insert: {
          comments?: string | null
          id: string
          status?: string | null
          sys_period: unknown
          updated_at: string
          updated_by: string
        }
        Update: {
          comments?: string | null
          id?: string
          status?: string | null
          sys_period?: unknown
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_updated_by'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      slides: {
        Row: {
          change_description: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          locked: boolean
          locked_by: string | null
          metadata?: {
            orgId?: string
            presentationTitle?: string
            presentationFileName?: string
            createdBy?: string
            created?: string
            lastModified?: string
            lastModifiedBy?: string
            slideId?: number
            slideNumber?: number
            textContent?: string[]
            slideFileSize?: number
            slideSizeType?: string
            url?: string
            path?: string
          }
          object_id: string
          parent_id: string
          settings: Json | null
          slide_name: string | null
          sys_period: unknown
          description?: string
          tags: string[]
          updated_at: string
          updated_by: string
          metadata_updated_at?: string
          metadata_updated_by?: string
          version: number | null
          visibility: Database['public']['Enums']['visibility_options'] | null
        }
        Insert: {
          change_description?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          locked?: boolean
          locked_by?: string | null
          metadata?: {
            orgId?: string
            presentationTitle?: string
            presentationFileName?: string
            createdBy?: string
            created?: string
            lastModified?: string
            slideId?: number
            slideNumber?: number
            textContent?: string[]
            slideFileSize?: number
            slideSizeType?: string
            url?: string
          }
          object_id: string
          parent_id: string
          settings?: Json | null
          slide_name?: string | null
          sys_period?: unknown
          description?: string
          tags?: string[]
          updated_at?: string
          updated_by: string
          metadata_updated_at?: string
          metadata_updated_by?: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Update: {
          change_description?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          locked?: boolean
          locked_by?: string | null
          metadata?: {
            orgId?: string
            presentationTitle?: string
            presentationFileName?: string
            createdBy?: string
            created?: string
            lastModified?: string
            slideId?: number
            slideNumber?: number
            textContent?: string[]
            slideFileSize?: number
            slideSizeType?: string
            url?: string
          }
          object_id?: string
          parent_id?: string
          settings?: Json | null
          slide_name?: string | null
          sys_period?: unknown
          description?: string
          tags?: string[] | string
          updated_at?: string
          updated_by?: string
          metadata_updated_at?: string
          metadata_updated_by?: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'slides_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'slides_deleted_by_fkey'
            columns: ['deleted_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'slides_locked_by_fkey'
            columns: ['locked_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'slides_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'folders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'slides_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      slides_embedding: {
        Row: {
          embedding: string | null
          id: string
          slide_id: string | null
        }
        Insert: {
          embedding?: string | null
          id?: string
          slide_id?: string | null
        }
        Update: {
          embedding?: string | null
          id?: string
          slide_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'slides_embedding_slide_id_fkey'
            columns: ['slide_id']
            isOneToOne: true
            referencedRelation: 'slides'
            referencedColumns: ['id']
          },
        ]
      }
      slides_history: {
        Row: {
          change_description: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          locked: boolean
          locked_by: string | null
          metadata?: {
            objectId?: string
            orgId?: string
            presentationTitle?: string
            presentationFileName?: string
            createdBy?: string
            created?: string
            lastModified?: string
            lastModifiedBy?: string
            slideId?: number
            slideNumber?: number
            textContent?: string[]
            slideFileSize?: number
            slideSizeType?: string
            url?: string
            path?: string
          }
          object_id: string
          parent_id: string
          settings: Json | null
          slide_name: string | null
          sys_period: unknown
          description?: string
          tags: string[]
          updated_at: string
          updated_by: string
          version: number | null
          visibility: Database['public']['Enums']['visibility_options'] | null
        }
        Insert: {
          change_description?: string | null
          created_at: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          id: string
          locked: boolean
          locked_by?: string | null
          metadata?: Json | null
          object_id: string
          parent_id: string
          settings?: Json | null
          slide_name?: string | null
          sys_period: unknown
          description?: string
          tags: string[]
          updated_at: string
          updated_by: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Update: {
          change_description?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          locked?: boolean
          locked_by?: string | null
          metadata?: Json | null
          object_id?: string
          parent_id: string
          settings?: Json | null
          slide_name?: string | null
          sys_period?: unknown
          description?: string
          tags?: string[]
          updated_at?: string
          updated_by?: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_created_by'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_deleted_by'
            columns: ['deleted_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_updated_by'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      slide_views_temp: {
        Row: {
          fingerprint: string
          id: number
          slide_id: string
          viewed_at: string
        }
        Insert: {
          fingerprint: string
          id?: never
          slide_id: string
          viewed_at?: string
        }
        Update: {
          fingerprint?: string
          id?: never
          slide_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
      presentation_upload_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          folder_id: string | null
          id: string
          organization_id: string | null
          presentation_name: string | null
          processed_at: string | null
          settings: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          organization_id?: string | null
          presentation_name?: string | null
          processed_at?: string | null
          settings?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          organization_id?: string | null
          presentation_name?: string | null
          processed_at?: string | null
          settings?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'presentation_upload_queue_folder_id_fkey'
            columns: ['folder_id']
            isOneToOne: false
            referencedRelation: 'folders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'presentation_upload_queue_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'presentation_upload_queue_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations_with_presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'presentation_upload_queue_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      user_folder_roles: {
        Row: {
          folder_id: string
          user_id: string
          user_role: Database['public']['Enums']['folder_role'] | null
        }
        Insert: {
          folder_id: string
          user_id: string
          user_role?: Database['public']['Enums']['folder_role'] | null
        }
        Update: {
          folder_id?: string
          user_id?: string
          user_role?: Database['public']['Enums']['folder_role'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_user_id'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'folder_id'
            columns: ['folder_id']
            isOneToOne: false
            referencedRelation: 'folders'
            referencedColumns: ['id']
          },
        ]
      }
      user_organization_roles: {
        Row: {
          organization_id: string
          user_id: string
          user_role: Database['public']['Enums']['organization_role'] | null
        }
        Insert: {
          organization_id: string
          user_id: string
          user_role?: Database['public']['Enums']['organization_role'] | null
        }
        Update: {
          organization_id?: string
          user_id?: string
          user_role?: Database['public']['Enums']['organization_role'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_organization_roles_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_organization_roles_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations_with_presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_organization_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      user_profiles: {
        Row: {
          deleted_at: string | null
          deleted_by: string | null
          id: string
          metadata?: {
            email?: string
            firstName?: string
            lastName?: string
            position?: string
            organization?: string
            about?: string
            profilePicture?: string
          }
        }
        Insert: {
          deleted_at?: string | null
          deleted_by?: string | null
          id: string
          metadata?: {
            email?: string
            firstName?: string
            lastName?: string
            position?: string
            organization?: string
            about?: string
            profilePicture?: string
          }
        }
        Update: {
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          metadata?: {
            email?: string
            firstName?: string
            lastName?: string
            position?: string
            organization?: string
            about?: string
            profilePicture?: string
          }
        }
        Relationships: []
      }
    }
    Views: {
      organizations_with_presentations: {
        Row: {
          id: string
          metadata?: {
            name?: string
            about?: string
            website?: string
            location?: string
            profilePicture?: string
            displayMembers?: boolean
          }
          organization_name: string
          presentation_count: number
        }
        Relationships: []
      }
      view_organization_chat_history: {
        Row: {
          created_at: string
          folder_id: string | null
          guest_id: string | null
          id: string
          message: string | null
          message_type: string | null
          organization_id: string
          presentation_id: string | null
          similar_slides?: Partial<Tables<'slides'>>[] | null
          slide_paths?: { path: string; url: string }[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          folder_id?: string | null
          guest_id?: string | null
          id?: string | null
          message?: string | null
          message_type?: string | null
          organization_id?: string | null
          presentation_id?: string | null
          similar_slides?: Partial<Tables<'slides'>>[] | null
          slide_paths?: { path: string; url: string }[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          folder_id?: string | null
          guest_id?: string | null
          id?: string | null
          message?: string | null
          message_type?: string | null
          organization_id?: string | null
          presentation_id?: string | null
          similar_slides?: Partial<Tables<'slides'>>[] | null
          slide_paths?: { path: string; url: string }[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'organization_chat_history_folder_id_fkey'
            columns: ['folder_id']
            isOneToOne: false
            referencedRelation: 'folders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_chat_history_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_chat_history_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations_with_presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_chat_history_presentation_id_fkey'
            columns: ['presentation_id']
            isOneToOne: false
            referencedRelation: 'presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_chat_history_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Functions: {
      _ltree_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      _ltree_gist_options: {
        Args: {
          '': unknown
        }
        Returns: undefined
      }
      binary_quantize:
        | {
            Args: {
              '': string
            }
            Returns: unknown
          }
        | {
            Args: {
              '': unknown
            }
            Returns: unknown
          }
      bytea_to_text: {
        Args: {
          data: string
        }
        Returns: string
      }
      get_effective_visibility: {
        Args: {
          folder_id: string
        }
        Returns: Database['public']['Enums']['visibility_options']
      }
      get_folder_id_by_full_path: {
        Args: {
          org_id: string
          current_path: string
        }
        Returns: string
      }
      get_presentation: {
        Args: {
          org_name: string
          folder_path: string
          p_name: string
        }
        Returns: {
          oid: string
          pid: string
          slides: { object_id: string; slide_key: string }[]
          metadata: Json
        }[]
      }
      get_presentation_effective_visibility: {
        Args: {
          presentation_id: string
        }
        Returns: Database['public']['Enums']['visibility_options']
      }
      get_presentation_path: {
        Args: {
          presentation_id: string
        }
        Returns: string
      }
      get_presentation_paths_by_slide: {
        Args: {
          slide_id: string
        }
        Returns: Json
      }
      get_root_folder_id: {
        Args: {
          folder_id: string
        }
        Returns: string
      }
      get_slide: {
        Args: {
          org_name: string
          folder_path: string
          s_name: string
        }
        Returns: {
          oid: string
          sid: string
          object_id: string
          metadata?: {
            orgId?: string
            presentationTitle?: string
            presentationFileName?: string
            createdBy?: string
            created?: string
            lastModified?: string
            lastModifiedBy?: string
            slideId?: number
            slideNumber?: number
            textContent?: string[]
            slideFileSize?: number
            slideSizeType?: string
            url?: string
            path?: string
            description: string
          }
        }[]
      }
      get_slide_effective_visibility: {
        Args: {
          slide_id: string
        }
        Returns: Database['public']['Enums']['visibility_options']
      }
      get_slide_id_from_path: {
        Args: {
          path_tokens: string[]
        }
        Returns: string
      }
      get_slide_order: {
        Args: {
          presentation_id: string
          slide_id: string
        }
        Returns: number
      }
      get_slide_path: {
        Args: {
          org_id: string
          slide_id: string
        }
        Returns: string
      }
      get_slide_paths:
        | {
            Args: {
              presentation_id: string | null
              slide_ids: string[]
            }
            Returns: { id: string; path: string; url: string }[]
          }
        | {
            Args: {
              slide_ids: string[]
            }
            Returns: { id: string; path: string; url: string }[]
          }
      get_slides_for_folder: {
        Args: {
          folder_id: string
        }
        Returns: Partial<Tables<'slides'>>[]
      }
      get_subfolder_ids_including_self: {
        Args: {
          p_folder_id: string
        }
        Returns: string[]
      }
      get_user_notifications: {
        Args: {
          uid: string
        }
        Returns: {
          id: string
          content: { message: string }
          read: boolean
          created_at: string
          path: string
        }[]
      }
      halfvec_avg: {
        Args: {
          '': number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          '': unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          '': unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      http: {
        Args: {
          request: Database['public']['CompositeTypes']['http_request']
        }
        Returns: Database['public']['CompositeTypes']['http_response']
      }
      http_delete:
        | {
            Args: {
              uri: string
            }
            Returns: Database['public']['CompositeTypes']['http_response']
          }
        | {
            Args: {
              uri: string
              content: string
              content_type: string
            }
            Returns: Database['public']['CompositeTypes']['http_response']
          }
      http_get:
        | {
            Args: {
              uri: string
            }
            Returns: Database['public']['CompositeTypes']['http_response']
          }
        | {
            Args: {
              uri: string
              data: Json
            }
            Returns: Database['public']['CompositeTypes']['http_response']
          }
      http_head: {
        Args: {
          uri: string
        }
        Returns: Database['public']['CompositeTypes']['http_response']
      }
      http_header: {
        Args: {
          field: string
          value: string
        }
        Returns: Database['public']['CompositeTypes']['http_header']
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: {
          uri: string
          content: string
          content_type: string
        }
        Returns: Database['public']['CompositeTypes']['http_response']
      }
      http_post:
        | {
            Args: {
              uri: string
              content: string
              content_type: string
            }
            Returns: Database['public']['CompositeTypes']['http_response']
          }
        | {
            Args: {
              uri: string
              data: Json
            }
            Returns: Database['public']['CompositeTypes']['http_response']
          }
      http_put: {
        Args: {
          uri: string
          content: string
          content_type: string
        }
        Returns: Database['public']['CompositeTypes']['http_response']
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: {
          curlopt: string
          value: string
        }
        Returns: boolean
      }
      is_email_valid: {
        Args: {
          auth_email: string
          request_presentation_id: string
          request_slide_id: string
        }
        Returns: boolean
      }
      is_token_valid: {
        Args: {
          request_token_id: string
          request_presentation_id: string
          request_slide_id: string
        }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              '': unknown
            }
            Returns: number
          }
        | {
            Args: {
              '': unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              '': string
            }
            Returns: string
          }
        | {
            Args: {
              '': unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              '': unknown
            }
            Returns: unknown
          }
      lca: {
        Args: {
          '': unknown[]
        }
        Returns: unknown
      }
      lquery_in: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      lquery_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      lquery_recv: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      lquery_send: {
        Args: {
          '': unknown
        }
        Returns: string
      }
      ltree_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ltree_decompress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ltree_gist_in: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ltree_gist_options: {
        Args: {
          '': unknown
        }
        Returns: undefined
      }
      ltree_gist_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ltree_in: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ltree_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ltree_recv: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ltree_send: {
        Args: {
          '': unknown
        }
        Returns: string
      }
      ltree2text: {
        Args: {
          '': unknown
        }
        Returns: string
      }
      ltxtq_in: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ltxtq_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ltxtq_recv: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      ltxtq_send: {
        Args: {
          '': unknown
        }
        Returns: string
      }
      match_slides_for_organization: {
        Args: {
          query_embedding: string
          org_id: string
          match_count?: number
        }
        Returns: {
          id: string
          object_id: string
          content: string
          organization_id: string
          similarity: number
        }[]
      }
      match_slides_for_presentation: {
        Args: {
          query_embedding: string
          slide_ids: string[]
          match_count?: number
        }
        Returns: {
          id: string
          object_id: string
          content: string
          organization_id: string
          similarity: number
        }[]
      }
      nlevel: {
        Args: {
          '': unknown
        }
        Returns: number
      }
      sparsevec_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          '': unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          '': unknown[]
        }
        Returns: number
      }
      text_to_bytea: {
        Args: {
          data: string
        }
        Returns: string
      }
      text2ltree: {
        Args: {
          '': string
        }
        Returns: unknown
      }
      urlencode:
        | {
            Args: {
              data: Json
            }
            Returns: string
          }
        | {
            Args: {
              string: string
            }
            Returns: string
          }
        | {
            Args: {
              string: string
            }
            Returns: string
          }
      uuid_generate_v7: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      vector_avg: {
        Args: {
          '': number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              '': string
            }
            Returns: number
          }
        | {
            Args: {
              '': unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          '': string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          '': string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          '': string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          '': unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      download_role:
        | 'project-admin'
        | 'project-contributor'
        | 'project-member'
        | 'organization-member'
        | 'public'
      presentation_role:
        | 'project-admin'
        | 'project-contributor'
        | 'project-member'
        | 'organization-member'
        | 'public'
      folder_role: 'admin' | 'contributor' | 'member'
      invitation_status: 'pending' | 'accepted' | 'expired' | 'failed'
      organization_role: 'owner' | 'admin' | 'member'
      visibility_options: 'public' | 'internal' | 'restricted'
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database['public']['CompositeTypes']['http_header'][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database['public']['CompositeTypes']['http_header'][] | null
        content: string | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
