import type { Asset } from "@/lib/types";
import { createAsset, updateAsset, deleteAsset } from "@/lib/actions/assets";

export function AssetsSection({
  buildingId,
  assets,
}: {
  buildingId: string;
  assets: Asset[];
}) {
  const create = createAsset.bind(null, buildingId);

  return (
    <section className="card p-5">
      <h2 className="font-serif text-xl mb-4">Assets</h2>

      <div className="flex flex-col gap-3 mb-5">
        {assets.map((asset) => {
          const update = updateAsset.bind(null, buildingId, asset.id);
          const remove = deleteAsset.bind(null, buildingId, asset.id);
          return (
            <div
              key={asset.id}
              className="flex flex-wrap items-end gap-3 border border-border rounded-md p-3"
            >
              <form action={update} className="flex flex-wrap items-end gap-3 flex-1">
                <div className="flex-1 min-w-[10rem]">
                  <label className="field-label">Type</label>
                  <input
                    className="field-input"
                    name="type"
                    defaultValue={asset.type}
                    required
                  />
                </div>
                <div className="flex-1 min-w-[10rem]">
                  <label className="field-label">Location</label>
                  <input
                    className="field-input"
                    name="location"
                    defaultValue={asset.location ?? ""}
                  />
                </div>
                <div>
                  <label className="field-label">Installed</label>
                  <input
                    className="field-input"
                    type="date"
                    name="installed_date"
                    defaultValue={asset.installed_date ?? ""}
                  />
                </div>
                <button type="submit" className="btn btn-secondary">
                  Save
                </button>
              </form>
              <form action={remove}>
                <button type="submit" className="btn btn-danger">
                  Delete
                </button>
              </form>
            </div>
          );
        })}
        {assets.length === 0 && (
          <p className="text-sm text-ink-soft">No assets on the register yet.</p>
        )}
      </div>

      <form action={create} className="flex flex-wrap items-end gap-3 pt-4 border-t border-border">
        <div className="flex-1 min-w-[10rem]">
          <label className="field-label">New asset type</label>
          <input className="field-input" name="type" placeholder="Fire Extinguisher" required />
        </div>
        <div className="flex-1 min-w-[10rem]">
          <label className="field-label">Location</label>
          <input className="field-input" name="location" placeholder="Ground floor corridor" />
        </div>
        <div>
          <label className="field-label">Installed</label>
          <input className="field-input" type="date" name="installed_date" />
        </div>
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>
    </section>
  );
}
