import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_KEASY_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_KEASY_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  // Warn rather than crash so local builds still run without envs.
  // Supabase calls will fail until these are set.
  // eslint-disable-next-line no-console
  console.warn("Missing Supabase env vars: NEXT_PUBLIC_KEASY_SUPABASE_URL / NEXT_PUBLIC_KEASY_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
