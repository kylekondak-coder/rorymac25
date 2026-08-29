"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function createCertificate(buildingId: string, formData: FormData) {
  const supabase = await createClient();
  const type = str(formData, "type");
  if (!type) throw new Error("Certificate type is required");

  const { error } = await supabase.from("certificates").insert({
    building_id: buildingId,
    type,
    issue_date: str(formData, "issue_date"),
    expiry_date: str(formData, "expiry_date"),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function updateCertificate(
  buildingId: string,
  certificateId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const type = str(formData, "type");
  if (!type) throw new Error("Certificate type is required");

  const { error } = await supabase
    .from("certificates")
    .update({
      type,
      issue_date: str(formData, "issue_date"),
      expiry_date: str(formData, "expiry_date"),
    })
    .eq("id", certificateId);

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function deleteCertificate(buildingId: string, certificateId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("certificates").delete().eq("id", certificateId);
  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}
