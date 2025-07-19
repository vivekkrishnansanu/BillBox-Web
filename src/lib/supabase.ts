import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pseqwluvgsicyrozacpf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZXF3bHV2Z3NpY3lyb3phY3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODA5MTgsImV4cCI6MjA2NzU1NjkxOH0.zvxwk6MjfnFfbW4jDHKVG4m-tT-1eGQHAhAS2lRoVSs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})