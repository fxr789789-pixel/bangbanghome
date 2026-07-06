const env = {
  nextPublicSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  nextPublicSupabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export const config = {
  supabase: {
    url: env.nextPublicSupabaseUrl,
    anonKey: env.nextPublicSupabaseAnonKey,
  },
};
