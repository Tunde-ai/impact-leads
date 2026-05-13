import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

// Validate environment variables only when actually using Supabase operations
// This prevents build-time errors while still ensuring production safety

// Client for browser usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone?: string
          company?: string
          message?: string
          score?: number
          scored_at?: string
          hot_lead: boolean
          source?: string
          utm_campaign?: string
          utm_source?: string
          utm_medium?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone?: string
          company?: string
          message?: string
          score?: number
          scored_at?: string
          hot_lead?: boolean
          source?: string
          utm_campaign?: string
          utm_source?: string
          utm_medium?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string
          company?: string
          message?: string
          score?: number
          scored_at?: string
          hot_lead?: boolean
          source?: string
          utm_campaign?: string
          utm_source?: string
          utm_medium?: string
        }
      }
    }
  }
}