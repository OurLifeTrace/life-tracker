import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client without strict typing for now
// This allows for more flexible queries while developing
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
