import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBuildingWithRelations } from "@/lib/queries";
import { buildingStatus, currentRiskAssessment } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";
import { RadialDial } from "@/components/RadialDial";
import { CertificatesSection } from "@/components/building/CertificatesSection";
import { AssetsSection } from "@/components/building/AssetsSection";
import { RiskAssessmentsSection } from "@/components/building/RiskAssessmentsSection";
import { DefectsSection } from "@/components/building/DefectsSection";

export default async function BuildingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const building = await getBuildingWithRelations(supabase, id);
  if (!building) notFound();

  const overall = buildingStatus(building);
  const current = currentRiskAssessment(building.risk_assessments);
  const soonestCertificate = [...building.certificates]
    .filter((c) => c.expiry_date)
    .sort((a, b) => (a.expiry_date! < b.expiry_date! ? -1 : 1))[0];

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-sm mb-1">
            <Link href="/buildings" className="text-green-700 font-semibold">
              ← Buildings
            </Link>
          </p>
          <h1 className="font-serif text-3xl">{building.name}</h1>
          {building.address && <p className="text-ink-soft mt-1">{building.address}</p>}
          {building.client_contact_email && (
            <p className="text-ink-soft text-sm">{building.client_contact_email}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={overall} />
          <Link href={`/buildings/${building.id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
        </div>
      </div>

      <div className="card p-5 mb-6 flex flex-wrap gap-8">
        <RadialDial date={current?.review_due ?? null} label="FRA review due" />
        {soonestCertificate && (
          <RadialDial
            date={soonestCertificate.expiry_date}
            label={`${soonestCertificate.type} expiry`}
          />
        )}
      </div>

      <div className="flex flex-col gap-6">
        <CertificatesSection buildingId={building.id} certificates={building.certificates} />
        <RiskAssessmentsSection
          buildingId={building.id}
          riskAssessments={building.risk_assessments}
        />
        <DefectsSection buildingId={building.id} defects={building.defects} />
        <AssetsSection buildingId={building.id} assets={building.assets} />
      </div>
    </div>
  );
}
