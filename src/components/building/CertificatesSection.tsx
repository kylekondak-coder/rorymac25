import type { Certificate } from "@/lib/types";
import { statusFromDate } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";
import { CERTIFICATE_TYPES } from "@/lib/certificateTypes";
import { createClient } from "@/lib/supabase/server";
import { getCertificateFileUrls } from "@/lib/storage";
import {
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "@/lib/actions/certificates";

export async function CertificatesSection({
  buildingId,
  certificates,
}: {
  buildingId: string;
  certificates: Certificate[];
}) {
  const create = createCertificate.bind(null, buildingId);
  const supabase = await createClient();
  const fileUrls = await getCertificateFileUrls(supabase, certificates);

  return (
    <section className="card p-5">
      <h2 className="font-serif text-xl mb-4">Certificates</h2>

      <datalist id="certificate-types">
        {CERTIFICATE_TYPES.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <div className="flex flex-col gap-3 mb-5">
        {certificates.map((cert) => {
          const update = updateCertificate.bind(null, buildingId, cert.id);
          const remove = deleteCertificate.bind(null, buildingId, cert.id);
          const fileUrl = fileUrls.get(cert.id);
          return (
            <div
              key={cert.id}
              className="flex flex-col gap-2 border border-border rounded-md p-3"
            >
              <form action={update} className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
                <div className="w-full sm:flex-1 sm:min-w-[10rem]">
                  <label className="field-label">Type</label>
                  <input
                    className="field-input"
                    name="type"
                    list="certificate-types"
                    defaultValue={cert.type}
                    required
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <label className="field-label">Issued</label>
                  <input
                    className="field-input"
                    type="date"
                    name="issue_date"
                    defaultValue={cert.issue_date ?? ""}
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <label className="field-label">Expires</label>
                  <input
                    className="field-input"
                    type="date"
                    name="expiry_date"
                    defaultValue={cert.expiry_date ?? ""}
                  />
                </div>
                <div className="w-full sm:flex-1 sm:min-w-[10rem]">
                  <label className="field-label">
                    {cert.file_path ? "Replace file" : "Upload file"}
                  </label>
                  <input
                    className="field-input"
                    type="file"
                    name="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" className="btn btn-secondary">
                    Save
                  </button>
                  <StatusBadge status={statusFromDate(cert.expiry_date)} />
                </div>
              </form>
              <div className="flex items-center gap-3">
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary !text-xs"
                  >
                    View certificate ↗
                  </a>
                )}
                <form action={remove}>
                  <button type="submit" className="btn btn-danger !text-xs">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          );
        })}
        {certificates.length === 0 && (
          <p className="text-sm text-ink-soft">No certificates on file yet.</p>
        )}
      </div>

      <form
        action={create}
        className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 pt-4 border-t border-border"
      >
        <div className="w-full sm:flex-1 sm:min-w-[10rem]">
          <label className="field-label">New certificate type</label>
          <input
            className="field-input"
            name="type"
            list="certificate-types"
            placeholder="Fire Alarm System (BS 5839-1)"
            required
          />
        </div>
        <div className="w-full sm:w-auto">
          <label className="field-label">Issued</label>
          <input className="field-input" type="date" name="issue_date" />
        </div>
        <div className="w-full sm:w-auto">
          <label className="field-label">Expires</label>
          <input className="field-input" type="date" name="expiry_date" />
        </div>
        <div className="w-full sm:flex-1 sm:min-w-[10rem]">
          <label className="field-label">File (optional)</label>
          <input className="field-input" type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" />
        </div>
        <button type="submit" className="btn btn-primary w-full sm:w-auto">
          Add
        </button>
      </form>
    </section>
  );
}
