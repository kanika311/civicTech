export type GrievanceCategory =
  | "Sanitation & Waste"
  | "Roads & Infrastructure"
  | "Water & Electricity"
  | "Health Services"
  | "Education"
  | "Law & Order / Safety"
  | "Land, Revenue & Certificates"
  | "Welfare & Social Security"
  | "Environment & Disaster"
  | "Corruption & Accountability";

export type GrievanceStatus =
  | "submitted"
  | "acknowledged"
  | "in_progress"
  | "resolved"
  | "escalated";

export type EscalationLevel = "ward" | "zonal" | "district" | "state";

export type UserRole =
  | "citizen"
  | "field_worker"
  | "department_officer"
  | "zonal_admin"
  | "district_admin"
  | "state_ombudsman"
  | "public_auditor";

export interface GeoLocation {
  lat: number;
  lng: number;
  headingDegrees: number;
  pitch?: number;
  roll?: number;
  accuracyMeters?: number;
  address: string;
}

export interface EscalationRecord {
  fromLevel: EscalationLevel;
  toLevel: EscalationLevel;
  escalatedAt: string;
  reason: string;
  triggeredBy: "cron_sla_breach" | "manual_officer" | "citizen_appeal";
}

export interface Grievance {
  _id: string;
  id?: string;
  citizenId: string;
  citizenName?: string;
  citizenPhone?: string;
  category: GrievanceCategory;
  subcategory: string;
  department: string;
  description: string;
  isAnonymous: boolean;
  location: GeoLocation;
  capturePhotoUrl?: string | null;
  resolvedPhotoUrl?: string | null;
  status: GrievanceStatus;
  slaDeadline: string; // ISO 8601 string
  slaDays: number;
  escalationLevel: EscalationLevel;
  escalationHistory?: EscalationRecord[];
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  officialNotes?: string;
  procurementProjectId?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  wardNumber?: string;
  zoneName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  // Civic points awarded
  civicPointsAwarded?: number;
}

export interface DepartmentConfig {
  category: GrievanceCategory;
  department: string;
  defaultSlaDays: number;
  escalationChain: {
    ward: string;
    zonal: string;
    district: string;
    state: string;
  };
  subcategories: string[];
  isVisualARCategory: boolean; // Visual categories 1-3 & 9
  autoRouteCode: string;
}

export interface ProcurementProject {
  _id: string;
  projectId: string;
  title: string;
  department: string;
  contractorName: string;
  sanctionedBudgetInLakhs: number;
  spendToDateInLakhs: number;
  status: "active" | "completed" | "delayed" | "audited";
  location: {
    lat: number;
    lng: number;
    address: string;
    radiusMeters: number;
  };
  startDate: string;
  expectedCompletionDate: string;
  workOrderNumber: string;
}

export interface TransparencyScore {
  department: string;
  category: GrievanceCategory;
  totalGrievances: number;
  resolvedGrievances: number;
  slaAdherenceRate: number; // Percentage 0-100
  avgResolutionHours: number;
  reComplaintRate: number; // Percentage 0-100
  transparencyIndex: number; // Composite 0-100
  grade: "A+" | "A" | "B" | "C" | "D";
}

export interface ARAnchorData {
  lat: number;
  lng: number;
  headingDegrees: number;
  pitch: number;
  roll: number;
  accuracy: number;
  timestamp: number;
  photoBase64?: string;
}

export interface AICategorySuggestion {
  category: GrievanceCategory;
  subcategory: string;
  department: string;
  confidence: number; // 0 to 1
  reasoning: string[];
  estimatedSlaDays: number;
  isVisual: boolean;
}
