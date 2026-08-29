import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listBuildingsWithRelations } from "@/lib/queries";
import { currentRiskAssessment, daysUntil, statusFromDate } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";

interface ScheduleRow {
  buildingId: string;
  buildingName: string;
  kind: string;
  label: string;
  date: string | null;
}

export default async function SchedulePage() {
  const supabase = await createClient();
  const buildings = await listBuildingsWithRelations(supabase);

  const rows: ScheduleRow[] = [];

  for (const building of buildings) {
    for (const cert of building.certificates) {
      rows.push({
        buildingId: building.id,
        buildingName: building.name,
        kind: "Certificate",
        label: cert.type,
        date: cert.expiry_date,
      });
    }

    const current = currentRiskAssessment(building.risk_assessments);
    rows.push({
      buildingId: building.id,
      buildingName: building.name,
      kind: "Fire Risk Assessment",
      label: current ? "Review due" : "Never assessed",
      date: current?.review_due ?? null,
    });
  }

  const sorted = rows.sort((a, b) => {
    const da = a.date ? daysUntil(a.date) : -Infinity;
    const db = b.date ? daysUntil(b.date) : -Infinity;
    return da - db;
  });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Schedule</h1>

      {sorted.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft">
          Nothing to schedule yet —{" "}
          <Link href="/buildings/new" className="text-green-700 font-semibold">
            add a building
          </Link>{" "}
          to get started.
        </div>
      ) : (
        <div className="card divide-y divide-border">
          {sorted.map((row, i) => {
            const status = statusFromDate(row.date);
            const days = row.date ? daysUntil(row.date) : null;
            return (
              <Link
                key={i}
                href={`/buildings/${row.buildingId}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-paper transition-colors"
              >
                <StatusBadge status={status} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{row.buildingName}</p>
                  <p className="text-sm text-ink-soft truncate">
                    {row.kind} — {row.label}
                  </p>
                </div>
                <div className="text-right font-mono text-sm shrink-0">
                  {row.date ? (
                    <>
                      <div>{row.date}</div>
                      <div className="text-ink-soft text-xs">
                        {days! < 0 ? `${Math.abs(days!)}d overdue` : `${days}d left`}
                      </div>
                    </>
                  ) : (
                    <div className="text-ink-soft text-xs">no date set</div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
