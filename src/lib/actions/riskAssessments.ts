"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function createRiskAssessment(buildingId: string, formData: FormData) {
  const supabase = await createClient();
  const dateConducted = str(formData, "date_conducted");
  if (!dateConducted) throw new Error("Date conducted is required");

  const { error } = await supabase.from("risk_assessments").insert({
    building_id: buildingId,
    assessor: str(formData, "assessor"),
    date_conducted: dateConducted,
    review_due: str(formData, "review_due"),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function updateRiskAssessment(
  buildingId: string,
  riskAssessmentId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const dateConducted = str(formData, "date_conducted");
  if (!dateConducted) throw new Error("Date conducted is required");

  const { error } = await supabase
    .from("risk_assessments")
    .update({
      assessor: str(formData, "assessor"),
      date_conducted: dateConducted,
      review_due: str(formData, "review_due"),
    })
    .eq("id", riskAssessmentId);

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function deleteRiskAssessment(buildingId: string, riskAssessmentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("risk_assessments")
    .delete()
    .eq("id", riskAssessmentId);
  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}
