import type { BuildingWithRelations, RiskAssessment } from "./types";

export type Status = "ok" | "warning" | "expired" | "missing";

const WARNING_WINDOW_DAYS = 30;

/** Higher = worse. Used to pick the "worst" status across several dated items. */
const SEVERITY: Record<Status, number> = {
  ok: 0,
  warning: 1,
  missing: 2,
  expired: 3,
};

export function daysUntil(dateStr: string, today: Date = new Date()): number {
  const target = new Date(dateStr + "T00:00:00");
  const start = new Date(today.toISOString().slice(0, 10) + "T00:00:00");
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

/** Status of a single dated item (certificate expiry, FRA review_due, ...). */
export function statusFromDate(
  dateStr: string | null,
  today: Date = new Date(),
): Status {
  if (!dateStr) return "missing";
  const days = daysUntil(dateStr, today);
  if (days < 0) return "expired";
  if (days <= WARNING_WINDOW_DAYS) return "warning";
  return "ok";
}

export function worstStatus(statuses: Status[]): Status {
  return statuses.reduce<Status>(
    (worst, s) => (SEVERITY[s] > SEVERITY[worst] ? s : worst),
    "ok",
  );
}

/** The risk assessment that governs a building's current FRA status: most recently conducted. */
export function currentRiskAssessment(
  assessments: RiskAssessment[],
): RiskAssessment | null {
  if (assessments.length === 0) return null;
  return [...assessments].sort((a, b) =>
    b.date_conducted.localeCompare(a.date_conducted),
  )[0];
}

/**
 * Building-level status per the brief:
 * - worst of certificate statuses and the current FRA's status
 * - no FRA on file at all forces "expired" (never-assessed is a red flag, not a null state)
 * - any open high-priority action, or open critical defect, forces "expired"
 */
export function buildingStatus(
  building: Pick<BuildingWithRelations, "certificates" | "risk_assessments" | "defects">,
  today: Date = new Date(),
): Status {
  const certStatuses = building.certificates.map((c) =>
    statusFromDate(c.expiry_date, today),
  );

  const current = currentRiskAssessment(building.risk_assessments);
  const raStatus: Status = current
    ? statusFromDate(current.review_due, today)
    : "expired";

  const hasOpenHighPriorityAction = building.risk_assessments.some((ra) =>
    ra.actions.some((a) => a.status === "open" && a.priority === "high"),
  );
  const hasOpenCriticalDefect = building.defects.some(
    (d) => d.status === "open" && d.severity === "critical",
  );

  if (hasOpenHighPriorityAction || hasOpenCriticalDefect) return "expired";

  return worstStatus([...certStatuses, raStatus]);
}

export const STATUS_LABEL: Record<Status, string> = {
  ok: "Compliant",
  warning: "Due Soon",
  expired: "Overdue",
  missing: "Missing",
};
