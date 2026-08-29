import type { Certificate } from "@/lib/types";
import { statusFromDate } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";
import { CERTIFICATE_TYPES } from "@/lib/certificateTypes";
import {
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "@/lib/actions/certificates";

export function CertificatesSection({
  buildingId,
  certificates,
}: {
  buildingId: string;
  certificates: Certificate[];
}) {
  const create = createCertificate.bind(null, buildingId);

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
          return (
            <div
              key={cert.id}
              className="flex flex-wrap items-end gap-3 border border-border rounded-md p-3"
            >
              <form action={update} className="flex flex-wrap items-end gap-3 flex-1">
                <div className="flex-1 min-w-[10rem]">
                  <label className="field-label">Type</label>
                  <input
                    className="field-input"
                    name="type"
                    list="certificate-types"
                    defaultValue={cert.type}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Issued</label>
                  <input
                    className="field-input"
                    type="date"
                    name="issue_date"
                    defaultValue={cert.issue_date ?? ""}
                  />
                </div>
                <div>
                  <label className="field-label">Expires</label>
                  <input
                    className="field-input"
                    type="date"
                    name="expiry_date"
                    defaultValue={cert.expiry_date ?? ""}
                  />
                </div>
                <button type="submit" className="btn btn-secondary">
                  Save
                </button>
              </form>
              <StatusBadge status={statusFromDate(cert.expiry_date)} />
              <form action={remove}>
                <button type="submit" className="btn btn-danger">
                  Delete
                </button>
              </form>
            </div>
          );
        })}
        {certificates.length === 0 && (
          <p className="text-sm text-ink-soft">No certificates on file yet.</p>
        )}
      </div>

      <form action={create} className="flex flex-wrap items-end gap-3 pt-4 border-t border-border">
        <div className="flex-1 min-w-[10rem]">
          <label className="field-label">New certificate type</label>
          <input
            className="field-input"
            name="type"
            list="certificate-types"
            placeholder="Fire Alarm System (BS 5839-1)"
            required
          />
        </div>
        <div>
          <label className="field-label">Issued</label>
          <input className="field-input" type="date" name="issue_date" />
        </div>
        <div>
          <label className="field-label">Expires</label>
          <input className="field-input" type="date" name="expiry_date" />
        </div>
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>
    </section>
  );
}
