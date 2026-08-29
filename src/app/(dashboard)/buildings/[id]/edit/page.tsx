import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBuildingWithRelations } from "@/lib/queries";
import { updateBuilding, deleteBuilding } from "@/lib/actions/buildings";
import { BuildingForm } from "@/components/BuildingForm";

export default async function EditBuildingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const building = await getBuildingWithRelations(supabase, id);
  if (!building) notFound();

  const update = updateBuilding.bind(null, id);
  const remove = deleteBuilding.bind(null, id);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Edit {building.name}</h1>
      <BuildingForm action={update} building={building} />

      <form action={remove} className="mt-8 max-w-lg border-t border-border pt-6">
        <p className="text-sm text-ink-soft mb-2">
          Deleting a building also deletes all of its certificates, assets, risk
          assessments and defects. This cannot be undone.
        </p>
        <button type="submit" className="btn btn-danger">
          Delete building
        </button>
      </form>
    </div>
  );
}
