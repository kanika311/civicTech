import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepartmentConfigDocument extends Document {
  category: string;
  department: string;
  defaultSlaDays: number;
  escalationChain: {
    ward: string;
    zonal: string;
    district: string;
    state: string;
  };
  subcategories: string[];
  isVisualARCategory: boolean;
  autoRouteCode: string;
}

const DepartmentConfigSchema = new Schema<IDepartmentConfigDocument>(
  {
    category: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    defaultSlaDays: { type: Number, required: true, default: 3 },
    escalationChain: {
      ward: { type: String, required: true },
      zonal: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, required: true },
    },
    subcategories: [{ type: String }],
    isVisualARCategory: { type: Boolean, default: false },
    autoRouteCode: { type: String, required: true },
  },
  { timestamps: true }
);

export const DepartmentConfigModel: Model<IDepartmentConfigDocument> =
  mongoose.models.DepartmentConfig ||
  mongoose.model<IDepartmentConfigDocument>("DepartmentConfig", DepartmentConfigSchema);
