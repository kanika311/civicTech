import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGrievanceDocument extends Document {
  citizenId: string;
  citizenName?: string;
  citizenPhone?: string;
  category: string;
  subcategory: string;
  department: string;
  description: string;
  isAnonymous: boolean;
  location: {
    lat: number;
    lng: number;
    headingDegrees: number;
    pitch?: number;
    roll?: number;
    accuracyMeters?: number;
    address: string;
  };
  capturePhotoUrl?: string | null;
  resolvedPhotoUrl?: string | null;
  status: "submitted" | "acknowledged" | "in_progress" | "resolved" | "escalated";
  slaDeadline: Date;
  slaDays: number;
  escalationLevel: "ward" | "zonal" | "district" | "state";
  escalationHistory?: Array<{
    fromLevel: string;
    toLevel: string;
    escalatedAt: Date;
    reason: string;
    triggeredBy: string;
  }>;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  officialNotes?: string;
  procurementProjectId?: string;
  priority?: string;
  wardNumber?: string;
  zoneName?: string;
  civicPointsAwarded?: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date | null;
}

const GrievanceSchema = new Schema<IGrievanceDocument>(
  {
    citizenId: { type: String, required: true, index: true },
    citizenName: { type: String, default: "Anonymous Citizen" },
    citizenPhone: { type: String },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, required: true },
    department: { type: String, required: true, index: true },
    description: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false, index: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      headingDegrees: { type: Number, default: 0 },
      pitch: { type: Number, default: 0 },
      roll: { type: Number, default: 0 },
      accuracyMeters: { type: Number, default: 5 },
      address: { type: String, required: true },
    },
    capturePhotoUrl: { type: String, default: null },
    resolvedPhotoUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["submitted", "acknowledged", "in_progress", "resolved", "escalated"],
      default: "submitted",
      index: true,
    },
    slaDeadline: { type: Date, required: true, index: true },
    slaDays: { type: Number, required: true, default: 3 },
    escalationLevel: {
      type: String,
      enum: ["ward", "zonal", "district", "state"],
      default: "ward",
      index: true,
    },
    escalationHistory: [
      {
        fromLevel: { type: String },
        toLevel: { type: String },
        escalatedAt: { type: Date, default: Date.now },
        reason: { type: String },
        triggeredBy: { type: String, default: "cron_sla_breach" },
      },
    ],
    assignedWorkerId: { type: String },
    assignedWorkerName: { type: String },
    officialNotes: { type: String },
    procurementProjectId: { type: String, index: true },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    wardNumber: { type: String, default: "Ward 12" },
    zoneName: { type: String, default: "Central Zone" },
    civicPointsAwarded: { type: Number, default: 15 },
    resolvedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Compound index for escalation checking
GrievanceSchema.index({ status: 1, slaDeadline: 1 });

export const GrievanceModel: Model<IGrievanceDocument> =
  mongoose.models.Grievance || mongoose.model<IGrievanceDocument>("Grievance", GrievanceSchema);
