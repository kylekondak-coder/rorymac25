import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client for the building share page: it looks up a building by
 * an unguessable token before anyone is authenticated, so it bypasses RLS
 * entirely rather than needing a permissive anon policy on buildings.
 * Server-only — never import this from a Client Component.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
