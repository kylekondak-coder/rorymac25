import { daysUntil, statusFromDate, type Status } from "@/lib/status";

const STATUS_COLOR: Record<Status, string> = {
  ok: "var(--status-ok)",
  warning: "var(--status-warning)",
  expired: "var(--status-expired)",
  missing: "var(--status-missing)",
};

const FULL_CIRCLE_DAYS = 90;

/** Radial "days remaining" dial for a single dated item (certificate expiry, FRA review due). */
export function RadialDial({
  date,
  label,
  size = 96,
}: {
  date: string | null;
  label?: string;
  size?: number;
}) {
  const status = statusFromDate(date);
  const days = date ? daysUntil(date) : null;

  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const fraction =
    days === null ? 0 : days < 0 ? 1 : Math.min(1, days / FULL_CIRCLE_DAYS);
  const dashOffset = circumference * (1 - fraction);
  const color = STATUS_COLOR[status];

  return (
    <div
      className="inline-flex flex-col items-center gap-1.5"
      role="img"
      aria-label={
        date
          ? `${label ?? "Days remaining"}: ${days} days, status ${status}`
          : `${label ?? "Days remaining"}: no date set`
      }
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={6}
          />
          {days !== null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 300ms ease" }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono font-bold leading-none"
            style={{ color, fontSize: size * 0.22 }}
          >
            {days === null ? "—" : Math.abs(days)}
          </span>
          <span
            className="font-mono uppercase tracking-wide text-[9px] mt-1"
            style={{ color: "var(--ink-soft)" }}
          >
            {days === null ? "no date" : days < 0 ? "days over" : "days left"}
          </span>
        </div>
      </div>
      {label && (
        <span className="font-sans text-xs text-ink-soft">{label}</span>
      )}
    </div>
  );
}
