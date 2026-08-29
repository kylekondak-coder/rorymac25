import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { getBuildingByShareToken } from "@/lib/queries";
import {
  buildingStatus,
  currentRiskAssessment,
  statusFromDate,
} from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";
import { RadialDial } from "@/components/RadialDial";

const SEVERITY_CLASS: Record<string, string> = {
  low: "bg-status-ok-bg text-status-ok",
  medium: "bg-status-warning-bg text-status-warning",
  critical: "bg-status-expired-bg text-status-expired",
};

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServiceClient();
  const building = await getBuildingByShareToken(supabase, token);
  if (!building) notFound();

  const overall = buildingStatus(building);
  const current = currentRiskAssessment(building.risk_assessments);
  const openHighPriorityActions = building.risk_assessments
    .flatMap((ra) => ra.actions)
    .filter((a) => a.status === "open" && a.priority === "high").length;
  const openDefects = building.defects
    .filter((d) => d.status === "open")
    .sort((a, b) => b.date_raised.localeCompare(a.date_raised));

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-paper-raised">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-serif text-xl text-green-700">Papertrail</span>
          <span className="text-xs uppercase tracking-wide text-ink-soft">
            Compliance summary
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-3xl">{building.name}</h1>
            {building.address && (
              <p className="text-ink-soft mt-1">{building.address}</p>
            )}
          </div>
          <StatusBadge status={overall} />
        </div>

        <div className="card p-5 flex flex-wrap gap-8">
          <RadialDial date={current?.review_due ?? null} label="FRA review due" />
        </div>

        <section className="card p-5">
          <h2 className="font-serif text-xl mb-4">Certificates</h2>
          {building.certificates.length === 0 ? (
            <p className="text-sm text-ink-soft">No certificates on file yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {building.certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between gap-3 border border-border rounded-md px-3 py-2"
                >
                  <span className="text-sm font-medium">{cert.type}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-ink-soft">
                      {cert.expiry_date ?? "no date set"}
                    </span>
                    <StatusBadge status={statusFromDate(cert.expiry_date)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-serif text-xl mb-4">Fire risk assessment</h2>
          {current ? (
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span>
                Review due:{" "}
                <span className="font-mono">{current.review_due ?? "not set"}</span>
              </span>
              <StatusBadge status={statusFromDate(current.review_due)} />
              <span className="text-ink-soft">
                {openHighPriorityActions} open high-priority action
                {openHighPriorityActions === 1 ? "" : "s"}
              </span>
            </div>
          ) : (
            <p className="text-sm text-status-expired">
              No risk assessment on file.
            </p>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-serif text-xl mb-4">Open defects</h2>
          {openDefects.length === 0 ? (
            <p className="text-sm text-ink-soft">No open defects.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {openDefects.map((defect) => (
                <div
                  key={defect.id}
                  className="flex items-center gap-3 border border-border rounded-md px-3 py-2"
                >
                  <span
                    className={`font-mono text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${SEVERITY_CLASS[defect.severity]}`}
                  >
                    {defect.severity}
                  </span>
                  <span className="flex-1 text-sm">{defect.description}</span>
                  <span className="text-xs text-ink-soft">{defect.date_raised}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-center text-xs text-ink-soft pt-4">
          This is a read-only summary shared by your fire &amp; security provider.
        </p>
      </main>
    </div>
  );
}
