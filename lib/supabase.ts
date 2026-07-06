import { createClient } from "@supabase/supabase-js";
import { config } from "@/lib/env";

export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
