import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listBuildingsWithRelations } from "@/lib/queries";
import { buildingStatus } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";

export default async function BuildingsPage() {
  const supabase = await createClient();
  const buildings = await listBuildingsWithRelations(supabase);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">Buildings</h1>
        <Link href="/buildings/new" className="btn btn-primary">
          + Add building
        </Link>
      </div>

      {buildings.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft">
          No buildings yet.{" "}
          <Link href="/buildings/new" className="text-green-700 font-semibold">
            Add your first one
          </Link>
          .
        </div>
      ) : (
        <div className="card divide-y divide-border">
          {buildings.map((b) => (
            <Link
              key={b.id}
              href={`/buildings/${b.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-paper transition-colors"
            >
              <div>
                <p className="font-semibold">{b.name}</p>
                {b.address && <p className="text-sm text-ink-soft">{b.address}</p>}
              </div>
              <StatusBadge status={buildingStatus(b)} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
