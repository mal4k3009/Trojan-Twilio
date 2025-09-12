import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tvmuzvxrfxuwmdrtzrch.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2bXV6dnhyZnh1d21kcnR6cmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NzMxMTMsImV4cCI6MjA3MzI0OTExM30.Sn2Wwt2Z1qpg5ZqJLFH-GHrOrIA-_FmxmZXKxx7l8wY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your schema
export interface ConversationalMemory {
  id: number
  created_at: string
  'sender message'?: string
  recipient: string
  sender: string
  'recipient message'?: string
  message?: string // New field for direct message storage
}

export interface ChatHistory {
  id: number
  session_id: string
  message: Record<string, unknown> // JSON object
}
