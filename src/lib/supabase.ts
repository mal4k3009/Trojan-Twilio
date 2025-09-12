import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cjcjvlcvcgklmuikvnkr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqY2p2bGN2Y2drbG11aWt2bmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNzM3MTAsImV4cCI6MjA3MTk0OTcxMH0.TVppcKYIlz1mtENvdk-0QQ390mUOWTZYkqMbHabvGWU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your schema
export interface ConversationMemory {
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
