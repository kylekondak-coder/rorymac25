"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadCertificateFile } from "@/lib/storage";

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

function file(formData: FormData, key: string): File | null {
  const f = formData.get(key);
  return f instanceof File && f.size > 0 ? f : null;
}

export async function createCertificate(buildingId: string, formData: FormData) {
  const supabase = await createClient();
  const type = str(formData, "type");
  if (!type) throw new Error("Certificate type is required");

  const { data, error } = await supabase
    .from("certificates")
    .insert({
      building_id: buildingId,
      type,
      issue_date: str(formData, "issue_date"),
      expiry_date: str(formData, "expiry_date"),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const uploaded = file(formData, "file");
  if (uploaded) {
    const filePath = await uploadCertificateFile(supabase, buildingId, data.id, uploaded);
    const { error: fileError } = await supabase
      .from("certificates")
      .update({ file_path: filePath })
      .eq("id", data.id);
    if (fileError) throw new Error(fileError.message);
  }

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

  const updates: Record<string, unknown> = {
    type,
    issue_date: str(formData, "issue_date"),
    expiry_date: str(formData, "expiry_date"),
  };

  const uploaded = file(formData, "file");
  if (uploaded) {
    updates.file_path = await uploadCertificateFile(supabase, buildingId, certificateId, uploaded);
  }

  const { error } = await supabase.from("certificates").update(updates).eq("id", certificateId);

  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}

export async function deleteCertificate(buildingId: string, certificateId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("certificates").delete().eq("id", certificateId);
  if (error) throw new Error(error.message);
  revalidatePath(`/buildings/${buildingId}`);
}
