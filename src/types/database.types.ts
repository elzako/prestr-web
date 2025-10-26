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
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      access_tokens: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          organization_id: string | null
          presentation_id: string | null
          slide_id: string | null
          token_id: string
          viewer: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          organization_id?: string | null
          presentation_id?: string | null
          slide_id?: string | null
          token_id?: string
          viewer?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          organization_id?: string | null
          presentation_id?: string | null
          slide_id?: string | null
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
            foreignKeyName: 'access_tokens_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'access_tokens_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations_with_presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'access_tokens_presentation_id_fkey'
            columns: ['presentation_id']
            isOneToOne: false
            referencedRelation: 'presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'access_tokens_slide_id_fkey'
            columns: ['slide_id']
            isOneToOne: false
            referencedRelation: 'slides'
            referencedColumns: ['id']
          },
        ]
      }
      file_locks: {
        Row: {
          created_at: string
          expires_at: string
          lock_id: string
          resource_id: string
          resource_type: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          lock_id: string
          resource_id: string
          resource_type: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          lock_id?: string
          resource_id?: string
          resource_type?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          object_id: string
          parent_id: string | null
          updated_at: string
          updated_by: string
          version: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          object_id: string
          parent_id?: string | null
          updated_at?: string
          updated_by: string
          version?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          object_id?: string
          parent_id?: string | null
          updated_at?: string
          updated_by?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'files_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'files_deleted_by_fkey'
            columns: ['deleted_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'files_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'folders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'files_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
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
          metadata: Json | null
          organization_id: string
          parent_id: string | null
          parent_path: unknown
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
          metadata?: {
            description?: string
          } | null
          organization_id: string
          parent_id?: string | null
          parent_path?: unknown
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
          metadata?: Json | null
          organization_id?: string
          parent_id?: string | null
          parent_path?: unknown
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
          content: Json
          created_at: string
          id: string
          notification_type: string | null
          organization_id: string | null
          read: boolean | null
          user_id: string | null
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          notification_type?: string | null
          organization_id?: string | null
          read?: boolean | null
          user_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          notification_type?: string | null
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
          similar_slides: Json | null
          user_id: string | null
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
          similar_slides?: Json | null
          user_id?: string | null
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
          similar_slides?: Json | null
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
          user_role?: Database['public']['Enums']['organization_role'] | null
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
            profilePicture?: string | null
            displayMembers?: boolean
          }
          organization_name: string
          settings: Json | null
          tags: string[]
          updated_at: string
          updated_by: string
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
            profilePicture?: string | null
            displayMembers?: boolean
          }
          organization_name: string
          settings?: Json | null
          tags?: string[]
          updated_at?: string
          updated_by: string
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
            profilePicture?: string | null
            displayMembers?: boolean
          }
          organization_name?: string
          settings?: Json | null
          tags?: string[]
          updated_at?: string
          updated_by?: string
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
          stripe_customer: Json | null
          upload_limit: number | null
        }
        Insert: {
          id?: string
          organization_id?: string | null
          price_plan?: string | null
          prompt_limit?: number | null
          stripe_customer?: Json | null
          upload_limit?: number | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          price_plan?: string | null
          prompt_limit?: number | null
          stripe_customer?: Json | null
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
      presentation_upload_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          file_name: string | null
          folder_id: string | null
          id: string
          organization_id: string | null
          processed_at: string | null
          settings: Json | null
          status: string | null
          upload_file_name: string | null
          upload_type: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          file_name?: string | null
          folder_id?: string | null
          id?: string
          organization_id?: string | null
          processed_at?: string | null
          settings?: Json | null
          status?: string | null
          upload_file_name?: string | null
          upload_type?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          file_name?: string | null
          folder_id?: string | null
          id?: string
          organization_id?: string | null
          processed_at?: string | null
          settings?: Json | null
          status?: string | null
          upload_file_name?: string | null
          upload_type?: string | null
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
      presentations: {
        Row: {
          change_description: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          file_name: string
          id: string
          metadata: Json | null
          object_id: string
          parent_id: string
          regen_at: string | null
          regen_status: Database['public']['Enums']['regen_status'] | null
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
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          file_name: string
          id?: string
          metadata?: Json | null
          object_id?: string
          parent_id?: string | null
          regen_at?: string | null
          regen_status?: Database['public']['Enums']['regen_status'] | null
          settings?: Json | null
          slides?: Json | null
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
          file_name?: string
          id?: string
          metadata?: Json | null
          object_id?: string
          parent_id?: string | null
          regen_at?: string | null
          regen_status?: Database['public']['Enums']['regen_status'] | null
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
        }
        Insert: {
          embedding?: string | null
          id: string
        }
        Update: {
          embedding?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'presentations_embedding_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'presentations'
            referencedColumns: ['id']
          },
        ]
      }
      presentations_history: {
        Row: {
          change_description: string | null
          file_name: string
          id: string
          metadata: Json | null
          object_id: string
          parent_id: string | null
          settings: Json | null
          slides: Json | null
          sys_period: unknown
          tags: string[]
          updated_by: string
          version: number | null
          visibility: Database['public']['Enums']['visibility_options'] | null
        }
        Insert: {
          change_description?: string | null
          file_name: string
          id: string
          metadata?: Json | null
          object_id: string
          parent_id?: string | null
          settings?: Json | null
          slides?: Json | null
          sys_period: unknown
          tags: string[]
          updated_by: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Update: {
          change_description?: string | null
          file_name?: string
          id?: string
          metadata?: Json | null
          object_id?: string
          parent_id?: string | null
          settings?: Json | null
          slides?: Json | null
          sys_period?: unknown
          tags?: string[]
          updated_by?: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Relationships: []
      }
      presentations_workflow: {
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
            foreignKeyName: 'presentations_workflow_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'presentations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'presentations_workflow_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      presentations_workflow_history: {
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
      slides: {
        Row: {
          change_description: string | null
          content_hash: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          draft_content_hash: string | null
          draft_object_id: string | null
          file_name: string | null
          id: string
          metadata: {
            links?: string[]
            file_size?: number
            has_audio?: boolean
            has_chart?: boolean
            has_image?: boolean
            has_links?: boolean
            has_table?: boolean
            has_video?: boolean
            has_bullet?: boolean
            has_diagram?: boolean
            notes_text?: string[]
            slide_text?: string[]
            theme_name?: string
            layout_name?: string
          }
          object_id: string
          parent_id: string
          settings: Json | null
          sys_period: unknown
          tags: string[]
          updated_at: string
          updated_by: string
          version: number | null
          visibility: Database['public']['Enums']['visibility_options'] | null
        }
        Insert: {
          change_description?: string | null
          content_hash?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          draft_content_hash?: string | null
          draft_object_id?: string | null
          file_name?: string | null
          id?: string
          metadata?: Json | null
          object_id: string
          parent_id?: string | null
          settings?: Json | null
          sys_period?: unknown
          tags?: string[]
          updated_at?: string
          updated_by: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Update: {
          change_description?: string | null
          content_hash?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          draft_content_hash?: string | null
          draft_object_id?: string | null
          file_name?: string | null
          id?: string
          metadata?: Json | null
          object_id?: string
          parent_id?: string | null
          settings?: Json | null
          sys_period?: unknown
          tags?: string[]
          updated_at?: string
          updated_by?: string
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
        }
        Insert: {
          embedding?: string | null
          id: string
        }
        Update: {
          embedding?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'slides_embedding_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'slides'
            referencedColumns: ['id']
          },
        ]
      }
      slides_history: {
        Row: {
          change_description: string | null
          description: string | null
          file_name: string | null
          id: string
          metadata: Json | null
          object_id: string
          parent_id: string | null
          settings: Json | null
          sys_period: unknown
          tags: string[]
          updated_by: string
          version: number | null
          visibility: Database['public']['Enums']['visibility_options'] | null
        }
        Insert: {
          change_description?: string | null
          description?: string | null
          file_name?: string | null
          id?: string
          metadata?: Json | null
          object_id: string
          parent_id?: string | null
          settings?: Json | null
          sys_period?: unknown
          tags?: string[]
          updated_by: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Update: {
          change_description?: string | null
          description?: string | null
          file_name?: string | null
          id?: string
          metadata?: Json | null
          object_id?: string
          parent_id?: string | null
          settings?: Json | null
          sys_period?: unknown
          tags?: string[]
          updated_by?: string
          version?: number | null
          visibility?: Database['public']['Enums']['visibility_options'] | null
        }
        Relationships: []
      }
      slides_workflow: {
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
            foreignKeyName: 'slides_workflow_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'slides'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'slides_workflow_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      slides_workflow_history: {
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
            profilePicture?: string | null
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
            profilePicture?: string | null
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
            profilePicture?: string | null
          }
        }
        Relationships: []
      }
    }
    Views: {
      organizations_with_presentations: {
        Row: {
          id: string | null
          metadata: Json | null
          organization_name: string | null
          presentation_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      acquire_file_lock: {
        Args: {
          p_client_id: string
          p_file_id: string
          p_lock_token: string
          p_ttl_minutes?: number
          p_user_id: string
        }
        Returns: {
          error_message: string
          expires_at: string
          lock_token: string
          locked_by: string
          success: boolean
        }[]
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      get_effective_visibility: {
        Args: { folder_id: string }
        Returns: Database['public']['Enums']['visibility_options']
      }
      get_file_lock_status: {
        Args: { p_file_id: string }
        Returns: {
          client_id: string
          expires_at: string
          is_locked: boolean
          lock_token: string
          locked_by: string
        }[]
      }
      get_folder_id_by_full_path: {
        Args: { current_path: string; org_id: string }
        Returns: string
      }
      get_folder_organization_id: {
        Args: { folder_id: string }
        Returns: string
      }
      get_folder_path: { Args: { folder_id: string }; Returns: string }
      get_folder_role: {
        Args: { folder_id: string }
        Returns: Database['public']['Enums']['folder_role']
      }
      get_organization_id: {
        Args: { slide_or_presentation_parent_id: string }
        Returns: string
      }
      get_organization_role: {
        Args: { organization_id: string }
        Returns: Database['public']['Enums']['organization_role']
      }
      get_presentation: {
        Args: { folder_path: string; org_name: string; p_name: string }
        Returns: {
          metadata: Json
          oid: string
          pid: string
          slides: Json
        }[]
      }
      get_presentation_effective_visibility: {
        Args: { presentation_id: string }
        Returns: Database['public']['Enums']['visibility_options']
      }
      get_presentation_parent_id: {
        Args: { presentation_id: string }
        Returns: string
      }
      get_presentation_path: {
        Args: { presentation_id: string }
        Returns: string
      }
      get_root_folder_id: { Args: { folder_id: string }; Returns: string }
      get_slide: {
        Args: { folder_path: string; org_name: string; s_name: string }
        Returns: {
          metadata: Json
          object_id: string
          oid: string
          sid: string
        }[]
      }
      get_slide_effective_visibility: {
        Args: { slide_id: string }
        Returns: Database['public']['Enums']['visibility_options']
      }
      get_slide_parent_id: { Args: { slide_id: string }; Returns: string }
      get_subfolder_ids_including_self: {
        Args: { p_folder_id: string }
        Returns: string[]
      }
      get_user_notifications: {
        Args: { uid: string }
        Returns: {
          content: Json
          created_at: string
          id: string
          path: string
          read: boolean
        }[]
      }
      is_token_or_email_valid: {
        Args: {
          presentation_id?: string
          slide_id?: string
          token_id: string
          user_email: string
        }
        Returns: boolean
      }
      refresh_file_lock: {
        Args: {
          p_file_id: string
          p_lock_token: string
          p_ttl_minutes?: number
          p_user_id: string
        }
        Returns: {
          error_message: string
          expires_at: string
          success: boolean
        }[]
      }
      release_file_lock: {
        Args: {
          p_file_id: string
          p_is_admin?: boolean
          p_lock_token: string
          p_user_id: string
        }
        Returns: {
          error_message: string
          success: boolean
        }[]
      }
      text2ltree: { Args: { '': string }; Returns: unknown }
      uuid_generate_v7: { Args: never; Returns: string }
    }
    Enums: {
      download_role:
        | 'project-admin'
        | 'project-contributor'
        | 'project-member'
        | 'organization-member'
        | 'public'
      folder_role: 'admin' | 'contributor' | 'member'
      invitation_status: 'pending' | 'accepted' | 'expired' | 'failed'
      organization_role: 'owner' | 'admin' | 'member'
      presentation_role:
        | 'project-admin'
        | 'project-contributor'
        | 'project-member'
        | 'organization-member'
        | 'public'
      regen_status: 'pending' | 'processing' | 'completed' | 'failed'
      visibility_options: 'public' | 'internal' | 'restricted'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      download_role: [
        'project-admin',
        'project-contributor',
        'project-member',
        'organization-member',
        'public',
      ],
      folder_role: ['admin', 'contributor', 'member'],
      invitation_status: ['pending', 'accepted', 'expired', 'failed'],
      organization_role: ['owner', 'admin', 'member'],
      presentation_role: [
        'project-admin',
        'project-contributor',
        'project-member',
        'organization-member',
        'public',
      ],
      regen_status: ['pending', 'processing', 'completed', 'failed'],
      visibility_options: ['public', 'internal', 'restricted'],
    },
  },
} as const
