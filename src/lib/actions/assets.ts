"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function createAsset(buildingId: string, formData: FormData) {
  const supabase = await createClient();
  const type = str(formData, "type");
  if (!type) throw new Error("Asset type is required");

  const { error } = await supabase.from("assets").insert({
    building_id: buildingId,
    type,
    location: str(formData, "location"),
    installed_date: str(formData, "installed_date"),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function updateAsset(buildingId: string, assetId: string, formData: FormData) {
  const supabase = await createClient();
  const type = str(formData, "type");
  if (!type) throw new Error("Asset type is required");

  const { error } = await supabase
    .from("assets")
    .update({
      type,
      location: str(formData, "location"),
      installed_date: str(formData, "installed_date"),
    })
    .eq("id", assetId);

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function deleteAsset(buildingId: string, assetId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("assets").delete().eq("id", assetId);
  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}
