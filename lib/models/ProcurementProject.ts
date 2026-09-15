import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProcurementProjectDocument extends Document {
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

const ProcurementProjectSchema = new Schema<IProcurementProjectDocument>(
  {
    projectId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    contractorName: { type: String, required: true },
    sanctionedBudgetInLakhs: { type: Number, required: true },
    spendToDateInLakhs: { type: Number, required: true },
    status: { type: String, enum: ["active", "completed", "delayed", "audited"], default: "active" },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
      radiusMeters: { type: Number, default: 500 },
    },
    startDate: { type: String },
    expectedCompletionDate: { type: String },
    workOrderNumber: { type: String },
  },
  { timestamps: true }
);

export const ProcurementProjectModel: Model<IProcurementProjectDocument> =
  mongoose.models.ProcurementProject ||
  mongoose.model<IProcurementProjectDocument>("ProcurementProject", ProcurementProjectSchema);
