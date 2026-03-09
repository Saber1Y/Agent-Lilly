import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/env/server";

let supabaseAdmin: SupabaseClient | null | undefined;

export function getSupabaseAdminClient() {
  if (supabaseAdmin !== undefined) {
    return supabaseAdmin;
  }

  const url = serverEnv.supabaseUrl;
  const serviceRoleKey = serverEnv.supabaseServiceRoleKey;

  if (!url || !serviceRoleKey) {
    supabaseAdmin = null;
    return supabaseAdmin;
  }

  supabaseAdmin = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}
