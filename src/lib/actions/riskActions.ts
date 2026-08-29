"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Priority, ItemStatus } from "@/lib/types";

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function createRiskAction(
  buildingId: string,
  riskAssessmentId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const description = str(formData, "description");
  const priority = str(formData, "priority") as Priority | null;
  if (!description || !priority) throw new Error("Description and priority are required");

  const { error } = await supabase.from("actions").insert({
    risk_assessment_id: riskAssessmentId,
    description,
    priority,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function toggleRiskActionStatus(
  buildingId: string,
  actionId: string,
  nextStatus: ItemStatus,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("actions")
    .update({ status: nextStatus })
    .eq("id", actionId);

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function deleteRiskAction(buildingId: string, actionId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("actions").delete().eq("id", actionId);
  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}
