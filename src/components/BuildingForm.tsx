import type { Building } from "@/lib/types";

export function BuildingForm({
  action,
  building,
}: {
  action: (formData: FormData) => void;
  building?: Building;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <div>
        <label className="field-label" htmlFor="name">
          Building name
        </label>
        <input
          className="field-input"
          id="name"
          name="name"
          type="text"
          defaultValue={building?.name}
          required
        />
      </div>

      <div>
        <label className="field-label" htmlFor="address">
          Address
        </label>
        <input
          className="field-input"
          id="address"
          name="address"
          type="text"
          defaultValue={building?.address ?? ""}
        />
      </div>

      <div>
        <label className="field-label" htmlFor="client_contact_email">
          Client contact email
        </label>
        <input
          className="field-input"
          id="client_contact_email"
          name="client_contact_email"
          type="email"
          defaultValue={building?.client_contact_email ?? ""}
        />
      </div>

      <button type="submit" className="btn btn-primary w-fit mt-2">
        {building ? "Save changes" : "Create building"}
      </button>
    </form>
  );
}
