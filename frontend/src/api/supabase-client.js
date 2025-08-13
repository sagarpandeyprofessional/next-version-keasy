import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.KEASY_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.KEASY_SUPABASE_ANON_KEY
const supabaseUrl = "https://lnbvhkwfhvkinziybkbo.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuYnZoa3dmaHZraW56aXlia2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTkyMTksImV4cCI6MjA3MDY3NTIxOX0.yNzOb9ozrc5cKPXvExqgfVPm0hQBvorQaQmMy3dLClw"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
