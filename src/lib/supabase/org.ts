import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCurrentOrganisationId(
  supabase: SupabaseClient,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (error || !data) throw new Error("No organisation found for this user");
  return data.organisation_id as string;
}
