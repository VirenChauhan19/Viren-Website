// ============================================================
// Analytics configuration.
//
// 1. Create a free project at https://supabase.com
// 2. Run supabase/setup.sql in its SQL Editor
// 3. Project Settings -> API: copy the two values below
//    (the anon/public key is DESIGNED to ship in client code;
//    row-level security in setup.sql is what protects the data)
// 4. Authentication -> Users -> Add user: create yourself a
//    login (use the same email as in setup.sql), then sign in
//    at virenchauhan.com/#/analytics
//
// Until both values are filled in, tracking is silently off and
// the /analytics page shows these setup steps.
// ============================================================

export const SUPABASE_URL = 'https://tfvbvhuisrnhihkrthhj.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_0zMAziwz8R4A15UIFWfbQA_JcFKsjIS'

export function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}
