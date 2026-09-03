import type { RiskAssessment, RiskAction } from "@/lib/types";
import { statusFromDate, currentRiskAssessment } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";
import {
  createRiskAssessment,
  updateRiskAssessment,
  deleteRiskAssessment,
} from "@/lib/actions/riskAssessments";
import {
  createRiskAction,
  toggleRiskActionStatus,
  deleteRiskAction,
} from "@/lib/actions/riskActions";

type RA = RiskAssessment & { actions: RiskAction[] };

export function RiskAssessmentsSection({
  buildingId,
  riskAssessments,
}: {
  buildingId: string;
  riskAssessments: RA[];
}) {
  const create = createRiskAssessment.bind(null, buildingId);
  const current = currentRiskAssessment(riskAssessments);
  const sorted = [...riskAssessments].sort((a, b) =>
    b.date_conducted.localeCompare(a.date_conducted),
  );

  return (
    <section className="card p-5">
      <h2 className="font-serif text-xl mb-4">Fire Risk Assessments</h2>

      <div className="flex flex-col gap-4 mb-5">
        {sorted.map((ra) => {
          const update = updateRiskAssessment.bind(null, buildingId, ra.id);
          const remove = deleteRiskAssessment.bind(null, buildingId, ra.id);
          const addAction = createRiskAction.bind(null, buildingId, ra.id);
          const isCurrent = current?.id === ra.id;

          return (
            <div key={ra.id} className="border border-border rounded-md p-3">
              <form
                action={update}
                className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3"
              >
                <div className="w-full sm:flex-1 sm:min-w-[10rem]">
                  <label className="field-label">Assessor</label>
                  <input
                    className="field-input"
                    name="assessor"
                    defaultValue={ra.assessor ?? ""}
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <label className="field-label">Date conducted</label>
                  <input
                    className="field-input"
                    type="date"
                    name="date_conducted"
                    defaultValue={ra.date_conducted}
                    required
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <label className="field-label">Review due</label>
                  <input
                    className="field-input"
                    type="date"
                    name="review_due"
                    defaultValue={ra.review_due ?? ""}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" className="btn btn-secondary w-full sm:w-auto">
                    Save
                  </button>
                  {isCurrent && <StatusBadge status={statusFromDate(ra.review_due)} />}
                </div>
              </form>

              <div className="mt-3 pl-1 border-l-2 border-green-100">
                <p className="field-label !mb-2">Actions</p>
                <div className="flex flex-col gap-2 mb-2">
                  {ra.actions.map((action) => {
                    const toggle = toggleRiskActionStatus.bind(
                      null,
                      buildingId,
                      action.id,
                      action.status === "open" ? "closed" : "open",
                    );
                    const removeAction = deleteRiskAction.bind(null, buildingId, action.id);
                    return (
                      <div
                        key={action.id}
                        className="flex flex-wrap items-center gap-3 text-sm bg-paper rounded px-3 py-2"
                      >
                        <span
                          className={`font-mono text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                            action.priority === "high"
                              ? "bg-status-expired-bg text-status-expired"
                              : action.priority === "medium"
                                ? "bg-status-warning-bg text-status-warning"
                                : "bg-status-ok-bg text-status-ok"
                          }`}
                        >
                          {action.priority}
                        </span>
                        <span className={`flex-1 min-w-[8rem] ${action.status === "closed" ? "line-through text-ink-soft" : ""}`}>
                          {action.description}
                        </span>
                        <form action={toggle}>
                          <button type="submit" className="btn btn-secondary !py-1 !px-2 !text-xs">
                            {action.status === "open" ? "Close" : "Reopen"}
                          </button>
                        </form>
                        <form action={removeAction}>
                          <button type="submit" className="btn btn-danger !py-1 !px-2 !text-xs">
                            Delete
                          </button>
                        </form>
                      </div>
                    );
                  })}
                  {ra.actions.length === 0 && (
                    <p className="text-xs text-ink-soft">No actions raised.</p>
                  )}
                </div>
                <form
                  action={addAction}
                  className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-2"
                >
                  <input
                    className="field-input w-full sm:flex-1 sm:min-w-[10rem]"
                    name="description"
                    placeholder="Action description"
                    required
                  />
                  <select
                    className="field-input w-full sm:w-auto"
                    name="priority"
                    defaultValue="medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <button type="submit" className="btn btn-secondary !text-xs w-full sm:w-auto">
                    Add action
                  </button>
                </form>
              </div>

              <form action={remove} className="mt-3">
                <button type="submit" className="btn btn-danger !text-xs">
                  Delete assessment
                </button>
              </form>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-sm text-ink-soft">
            No risk assessment on file — this building is flagged overdue.
          </p>
        )}
      </div>

      <form
        action={create}
        className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 pt-4 border-t border-border"
      >
        <div className="w-full sm:flex-1 sm:min-w-[10rem]">
          <label className="field-label">Assessor</label>
          <input className="field-input" name="assessor" />
        </div>
        <div className="w-full sm:w-auto">
          <label className="field-label">Date conducted</label>
          <input
            className="field-input"
            type="date"
            name="date_conducted"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div className="w-full sm:w-auto">
          <label className="field-label">Review due</label>
          <input className="field-input" type="date" name="review_due" />
        </div>
        <button type="submit" className="btn btn-primary w-full sm:w-auto">
          Add assessment
        </button>
      </form>
    </section>
  );
}
