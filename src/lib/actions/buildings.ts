"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganisationId } from "@/lib/supabase/org";

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function createBuilding(formData: FormData) {
  const supabase = await createClient();
  const organisation_id = await getCurrentOrganisationId(supabase);
  const name = str(formData, "name");
  if (!name) throw new Error("Building name is required");

  const { data, error } = await supabase
    .from("buildings")
    .insert({
      organisation_id,
      name,
      address: str(formData, "address"),
      client_contact_email: str(formData, "client_contact_email"),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/buildings");
  redirect(`/buildings/${data.id}`);
}

export async function updateBuilding(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = str(formData, "name");
  if (!name) throw new Error("Building name is required");

  const { error } = await supabase
    .from("buildings")
    .update({
      name,
      address: str(formData, "address"),
      client_contact_email: str(formData, "client_contact_email"),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/buildings");
  revalidatePath(`/buildings/${id}`);
  redirect(`/buildings/${id}`);
}

export async function deleteBuilding(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("buildings").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/buildings");
  redirect("/buildings");
}
