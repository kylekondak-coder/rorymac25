export type Priority = "low" | "medium" | "high";
export type ItemStatus = "open" | "closed";
export type Severity = "low" | "medium" | "critical";

export interface Organisation {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  organisation_id: string;
  full_name: string | null;
  created_at: string;
}

export interface Building {
  id: string;
  organisation_id: string;
  name: string;
  address: string | null;
  client_contact_email: string | null;
  created_at: string;
}

export interface Asset {
  id: string;
  building_id: string;
  type: string;
  location: string | null;
  installed_date: string | null;
  created_at: string;
}

export interface Certificate {
  id: string;
  building_id: string;
  type: string;
  issue_date: string | null;
  expiry_date: string | null;
  created_at: string;
}

export interface RiskAssessment {
  id: string;
  building_id: string;
  assessor: string | null;
  date_conducted: string;
  review_due: string | null;
  created_at: string;
}

export interface RiskAction {
  id: string;
  risk_assessment_id: string;
  description: string;
  priority: Priority;
  status: ItemStatus;
  created_at: string;
}

export interface Defect {
  id: string;
  building_id: string;
  description: string;
  severity: Severity;
  status: ItemStatus;
  date_raised: string;
  created_at: string;
}

/** Everything needed to compute a building's overall compliance status. */
export interface BuildingWithRelations extends Building {
  certificates: Certificate[];
  risk_assessments: (RiskAssessment & { actions: RiskAction[] })[];
  defects: Defect[];
  assets: Asset[];
}
