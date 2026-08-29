import type { Defect } from "@/lib/types";
import { createDefect, toggleDefectStatus, deleteDefect } from "@/lib/actions/defects";

const SEVERITY_CLASS: Record<Defect["severity"], string> = {
  low: "bg-status-ok-bg text-status-ok",
  medium: "bg-status-warning-bg text-status-warning",
  critical: "bg-status-expired-bg text-status-expired",
};

export function DefectsSection({
  buildingId,
  defects,
}: {
  buildingId: string;
  defects: Defect[];
}) {
  const create = createDefect.bind(null, buildingId);
  const sorted = [...defects].sort((a, b) => b.date_raised.localeCompare(a.date_raised));

  return (
    <section className="card p-5">
      <h2 className="font-serif text-xl mb-4">Defects</h2>

      <div className="flex flex-col gap-2 mb-5">
        {sorted.map((defect) => {
          const toggle = toggleDefectStatus.bind(
            null,
            buildingId,
            defect.id,
            defect.status === "open" ? "closed" : "open",
          );
          const remove = deleteDefect.bind(null, buildingId, defect.id);
          return (
            <div
              key={defect.id}
              className="flex flex-wrap items-center gap-3 border border-border rounded-md px-3 py-2"
            >
              <span
                className={`font-mono text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${SEVERITY_CLASS[defect.severity]}`}
              >
                {defect.severity}
              </span>
              <span className={`flex-1 text-sm ${defect.status === "closed" ? "line-through text-ink-soft" : ""}`}>
                {defect.description}
              </span>
              <span className="text-xs text-ink-soft">{defect.date_raised}</span>
              <form action={toggle}>
                <button type="submit" className="btn btn-secondary !py-1 !px-2 !text-xs">
                  {defect.status === "open" ? "Close" : "Reopen"}
                </button>
              </form>
              <form action={remove}>
                <button type="submit" className="btn btn-danger !py-1 !px-2 !text-xs">
                  Delete
                </button>
              </form>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-sm text-ink-soft">No defects raised.</p>
        )}
      </div>

      <form action={create} className="flex flex-wrap items-end gap-3 pt-4 border-t border-border">
        <div className="flex-1 min-w-[10rem]">
          <label className="field-label">New defect</label>
          <input className="field-input" name="description" placeholder="Describe the defect" required />
        </div>
        <div>
          <label className="field-label">Severity</label>
          <select className="field-input" name="severity" defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="field-label">Date raised</label>
          <input
            className="field-input"
            type="date"
            name="date_raised"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>
    </section>
  );
}
