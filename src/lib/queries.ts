import type { SupabaseClient } from "@supabase/supabase-js";
import type { BuildingWithRelations } from "./types";

const BUILDING_WITH_RELATIONS_SELECT =
  "*, certificates(*), risk_assessments(*, actions(*)), defects(*), assets(*)";

export async function listBuildingsWithRelations(
  supabase: SupabaseClient,
): Promise<BuildingWithRelations[]> {
  const { data, error } = await supabase
    .from("buildings")
    .select(BUILDING_WITH_RELATIONS_SELECT)
    .order("name");

  if (error) throw new Error(error.message);
  return data as unknown as BuildingWithRelations[];
}

export async function getBuildingWithRelations(
  supabase: SupabaseClient,
  id: string,
): Promise<BuildingWithRelations | null> {
  const { data, error } = await supabase
    .from("buildings")
    .select(BUILDING_WITH_RELATIONS_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as BuildingWithRelations | null;
}

/** For the public client share page — looked up by the unguessable share token. */
export async function getBuildingByShareToken(
  supabase: SupabaseClient,
  token: string,
): Promise<BuildingWithRelations | null> {
  const { data, error } = await supabase
    .from("buildings")
    .select(BUILDING_WITH_RELATIONS_SELECT)
    .eq("share_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as BuildingWithRelations | null;
}
