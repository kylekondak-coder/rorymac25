import { headers } from "next/headers";
import { regenerateShareLink } from "@/lib/actions/buildings";

export async function ClientLinkSection({
  buildingId,
  shareToken,
}: {
  buildingId: string;
  shareToken: string;
}) {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const shareUrl = `${protocol}://${host}/share/${shareToken}`;

  const regenerate = regenerateShareLink.bind(null, buildingId);

  return (
    <section className="card p-5">
      <h2 className="font-serif text-xl mb-2">Client link</h2>
      <p className="text-sm text-ink-soft mb-4">
        Share this read-only link with the building&apos;s client — they can see
        compliance status but can&apos;t make changes.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="field-input flex-1 min-w-[16rem] font-mono text-xs"
          readOnly
          value={shareUrl}
        />
        <form action={regenerate}>
          <button type="submit" className="btn btn-secondary">
            Regenerate link
          </button>
        </form>
      </div>
    </section>
  );
}
