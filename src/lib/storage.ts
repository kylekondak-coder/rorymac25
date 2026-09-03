import type { SupabaseClient } from "@supabase/supabase-js";

const CERTIFICATES_BUCKET = "certificates";
const SIGNED_URL_TTL_SECONDS = 300;

export async function uploadCertificateFile(
  supabase: SupabaseClient,
  buildingId: string,
  certificateId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const path = `${buildingId}/${certificateId}/certificate.${ext}`;

  const { error } = await supabase.storage
    .from(CERTIFICATES_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined });

  if (error) throw new Error(error.message);
  return path;
}

/** Signed URLs for every certificate that has a file, keyed by certificate id. */
export async function getCertificateFileUrls(
  supabase: SupabaseClient,
  certificates: { id: string; file_path: string | null }[],
): Promise<Map<string, string>> {
  const withFiles = certificates.filter((c) => c.file_path);
  if (withFiles.length === 0) return new Map();

  const entries = await Promise.all(
    withFiles.map(async (c) => {
      const { data } = await supabase.storage
        .from(CERTIFICATES_BUCKET)
        .createSignedUrl(c.file_path!, SIGNED_URL_TTL_SECONDS);
      return [c.id, data?.signedUrl] as const;
    }),
  );

  return new Map(entries.filter((e): e is [string, string] => !!e[1]));
}
