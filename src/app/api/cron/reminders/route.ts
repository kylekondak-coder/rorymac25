import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { currentRiskAssessment, daysUntil } from "@/lib/status";
import { sendEngineerReminder, sendClientReminder } from "@/lib/email";
import type { BuildingWithRelations } from "@/lib/types";

const THRESHOLDS = [30, 14, 7] as const;
const SITE_URL = process.env.SITE_URL ?? "https://papertrail-kylekondak.vercel.app";

interface DueItem {
  itemType: "certificate" | "risk_assessment";
  itemId: string;
  buildingName: string;
  itemLabel: string;
  dueDate: string;
  daysRemaining: number;
}

interface RawBuilding extends BuildingWithRelations {
  organisation: { profiles: { email: string | null }[] } | null;
}

/** Records this item+threshold as sent, returning true only the first time (idempotent per day). */
async function claimReminder(
  supabase: ReturnType<typeof createServiceClient>,
  itemType: DueItem["itemType"],
  itemId: string,
  thresholdDays: number,
) {
  const { error } = await supabase
    .from("reminder_log")
    .insert({ item_type: itemType, item_id: itemId, threshold_days: thresholdDays });

  if (!error) return true;
  if (error.code === "23505") return false; // already sent for this threshold
  throw new Error(error.message);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("buildings")
    .select(
      "*, certificates(*), risk_assessments(*, actions(*)), defects(*), assets(*), organisation:organisations(profiles(email))",
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const buildings = data as unknown as RawBuilding[];

  const engineerBatches = new Map<string, { email: string; items: DueItem[] }>();
  const clientBatches = new Map<
    string,
    { email: string; shareToken: string; items: DueItem[] }
  >();

  for (const building of buildings) {
    const engineerEmail = building.organisation?.profiles?.[0]?.email;

    const dueCandidates: { itemType: DueItem["itemType"]; itemId: string; label: string; date: string }[] =
      [];

    for (const cert of building.certificates) {
      if (cert.expiry_date) {
        dueCandidates.push({
          itemType: "certificate",
          itemId: cert.id,
          label: cert.type,
          date: cert.expiry_date,
        });
      }
    }

    const current = currentRiskAssessment(building.risk_assessments);
    if (current?.review_due) {
      dueCandidates.push({
        itemType: "risk_assessment",
        itemId: current.id,
        label: "Fire risk assessment review",
        date: current.review_due,
      });
    }

    for (const candidate of dueCandidates) {
      const days = daysUntil(candidate.date);
      if (!THRESHOLDS.includes(days as (typeof THRESHOLDS)[number])) continue;

      const claimed = await claimReminder(supabase, candidate.itemType, candidate.itemId, days);
      if (!claimed) continue;

      const dueItem: DueItem = {
        itemType: candidate.itemType,
        itemId: candidate.itemId,
        buildingName: building.name,
        itemLabel: candidate.label,
        dueDate: candidate.date,
        daysRemaining: days,
      };

      if (engineerEmail) {
        const batch = engineerBatches.get(engineerEmail) ?? { email: engineerEmail, items: [] };
        batch.items.push(dueItem);
        engineerBatches.set(engineerEmail, batch);
      }

      if (building.client_contact_email) {
        const batch =
          clientBatches.get(building.id) ??
          {
            email: building.client_contact_email,
            shareToken: building.share_token,
            items: [],
          };
        batch.items.push(dueItem);
        clientBatches.set(building.id, batch);
      }
    }
  }

  for (const batch of engineerBatches.values()) {
    await sendEngineerReminder(batch.email, batch.items, `${SITE_URL}/schedule`);
  }
  for (const batch of clientBatches.values()) {
    await sendClientReminder(batch.email, batch.items, `${SITE_URL}/share/${batch.shareToken}`);
  }

  return NextResponse.json({
    engineerEmails: engineerBatches.size,
    clientEmails: clientBatches.size,
  });
}
