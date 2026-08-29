import { createBuilding } from "@/lib/actions/buildings";
import { BuildingForm } from "@/components/BuildingForm";

export default function NewBuildingPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Add building</h1>
      <BuildingForm action={createBuilding} />
    </div>
  );
}
