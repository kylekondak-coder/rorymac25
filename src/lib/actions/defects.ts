"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Severity, ItemStatus } from "@/lib/types";

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function createDefect(buildingId: string, formData: FormData) {
  const supabase = await createClient();
  const description = str(formData, "description");
  const severity = str(formData, "severity") as Severity | null;
  if (!description || !severity) throw new Error("Description and severity are required");

  const { error } = await supabase.from("defects").insert({
    building_id: buildingId,
    description,
    severity,
    date_raised: str(formData, "date_raised") ?? new Date().toISOString().slice(0, 10),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function toggleDefectStatus(
  buildingId: string,
  defectId: string,
  nextStatus: ItemStatus,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("defects")
    .update({ status: nextStatus })
    .eq("id", defectId);

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function deleteDefect(buildingId: string, defectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("defects").delete().eq("id", defectId);
  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}
