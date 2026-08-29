import { STATUS_LABEL, type Status } from "@/lib/status";

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`stamp stamp-${status}`}>{STATUS_LABEL[status]}</span>;
}
