import { connectToDatabase } from "./mongodb";
import { GrievanceModel } from "./models/Grievance";
import { DepartmentConfigModel } from "./models/DepartmentConfig";
import { ProcurementProjectModel } from "./models/ProcurementProject";
import {
  CATEGORY_CONFIGS,
  SEED_GRIEVANCES,
  SEED_PROCUREMENT_PROJECTS,
  SEED_TRANSPARENCY_SCORES,
} from "./seedData";
import { Grievance, DepartmentConfig, ProcurementProject, TransparencyScore } from "@/types/grievance";

// In-memory store fallback
let memGrievances: Grievance[] = JSON.parse(JSON.stringify(SEED_GRIEVANCES));
let memConfigs: DepartmentConfig[] = JSON.parse(JSON.stringify(CATEGORY_CONFIGS));
let memProcurements: ProcurementProject[] = JSON.parse(JSON.stringify(SEED_PROCUREMENT_PROJECTS));

export const dataRepo = {
  async resetToSeed(): Promise<void> {
    memGrievances = JSON.parse(JSON.stringify(SEED_GRIEVANCES));
    memConfigs = JSON.parse(JSON.stringify(CATEGORY_CONFIGS));
    memProcurements = JSON.parse(JSON.stringify(SEED_PROCUREMENT_PROJECTS));

    const mongoose = await connectToDatabase();
    if (mongoose) {
      try {
        await GrievanceModel.deleteMany({});
        await DepartmentConfigModel.deleteMany({});
        await ProcurementProjectModel.deleteMany({});

        await GrievanceModel.insertMany(memGrievances.map((g) => ({
          ...g,
          slaDeadline: new Date(g.slaDeadline),
          createdAt: new Date(g.createdAt),
          updatedAt: new Date(g.updatedAt),
          resolvedAt: g.resolvedAt ? new Date(g.resolvedAt) : null,
        })));
        await DepartmentConfigModel.insertMany(memConfigs);
        await ProcurementProjectModel.insertMany(memProcurements);
      } catch (e) {
        console.warn("DB reset error, using memory:", e);
      }
    }
  },

  async getDepartmentConfigs(): Promise<DepartmentConfig[]> {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      try {
        const docs = await DepartmentConfigModel.find({}).lean();
        if (docs.length > 0) return docs as unknown as DepartmentConfig[];
      } catch (e) {
        console.warn("Falling back to memConfigs:", e);
      }
    }
    return memConfigs;
  },

  async getProcurementProjects(): Promise<ProcurementProject[]> {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      try {
        const docs = await ProcurementProjectModel.find({}).lean();
        if (docs.length > 0) return docs as unknown as ProcurementProject[];
      } catch (e) {
        console.warn("Falling back to memProcurements:", e);
      }
    }
    return memProcurements;
  },

  async getGrievances(filter: {
    citizenId?: string;
    department?: string;
    status?: string;
    category?: string;
    escalationLevel?: string;
    onlyEscalated?: boolean;
    excludeAnonymousForPublic?: boolean;
    search?: string;
  } = {}): Promise<Grievance[]> {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};
        if (filter.citizenId) query.citizenId = filter.citizenId;
        if (filter.department) query.department = filter.department;
        if (filter.status) query.status = filter.status;
        if (filter.category) query.category = filter.category;
        if (filter.escalationLevel) query.escalationLevel = filter.escalationLevel;
        if (filter.onlyEscalated) query.status = "escalated";
        if (filter.excludeAnonymousForPublic) {
          query.category = { $ne: "Corruption & Accountability" };
          query.isAnonymous = false;
        }
        if (filter.search) {
          query.$or = [
            { description: { $regex: filter.search, $options: "i" } },
            { subcategory: { $regex: filter.search, $options: "i" } },
            { "location.address": { $regex: filter.search, $options: "i" } },
          ];
        }

        const docs = await GrievanceModel.find(query).sort({ createdAt: -1 }).lean();
        if (docs.length > 0) {
          return docs.map((d) => ({
            ...d,
            _id: d._id.toString(),
            slaDeadline: new Date(d.slaDeadline).toISOString(),
            createdAt: new Date(d.createdAt).toISOString(),
            updatedAt: new Date(d.updatedAt).toISOString(),
            resolvedAt: d.resolvedAt ? new Date(d.resolvedAt).toISOString() : null,
          })) as unknown as Grievance[];
        }
      } catch (e) {
        console.warn("Falling back to memGrievances:", e);
      }
    }

    // In-memory filter
    let list = [...memGrievances];
    if (filter.citizenId) list = list.filter((g) => g.citizenId === filter.citizenId);
    if (filter.department) list = list.filter((g) => g.department.toLowerCase() === filter.department?.toLowerCase());
    if (filter.status) list = list.filter((g) => g.status === filter.status);
    if (filter.category) list = list.filter((g) => g.category.toLowerCase() === filter.category?.toLowerCase());
    if (filter.escalationLevel) list = list.filter((g) => g.escalationLevel === filter.escalationLevel);
    if (filter.onlyEscalated) list = list.filter((g) => g.status === "escalated" || g.escalationLevel !== "ward");
    if (filter.excludeAnonymousForPublic) {
      list = list.filter((g) => g.category !== "Corruption & Accountability" && !g.isAnonymous);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (g) =>
          g.description.toLowerCase().includes(q) ||
          g.subcategory.toLowerCase().includes(q) ||
          g.location.address.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getGrievanceById(id: string): Promise<Grievance | null> {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      try {
        const doc = await GrievanceModel.findOne({
          $or: [{ _id: id }, { id: id }],
        }).lean();
        if (doc) {
          return {
            ...doc,
            _id: doc._id.toString(),
            slaDeadline: new Date(doc.slaDeadline).toISOString(),
            createdAt: new Date(doc.createdAt).toISOString(),
            updatedAt: new Date(doc.updatedAt).toISOString(),
            resolvedAt: doc.resolvedAt ? new Date(doc.resolvedAt).toISOString() : null,
          } as unknown as Grievance;
        }
      } catch (e) {
        console.warn("Falling back to memGrievances for id:", id, e);
      }
    }
    return memGrievances.find((g) => g._id === id || g.id === id) || null;
  },

  async createGrievance(data: Partial<Grievance>): Promise<Grievance> {
    const config = memConfigs.find((c) => c.category === data.category);
    const slaDays = data.slaDays || config?.defaultSlaDays || 3;
    const now = new Date();
    const slaDeadline = new Date(now.getTime() + slaDays * 86400 * 1000).toISOString();

    const newGrievance: Grievance = {
      _id: "grv-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      citizenId: data.citizenId || "cit-guest",
      citizenName: data.isAnonymous ? "Anonymous Citizen" : data.citizenName || "Concerned Citizen",
      citizenPhone: data.isAnonymous ? undefined : data.citizenPhone,
      category: data.category || "Sanitation & Waste",
      subcategory: data.subcategory || "General Grievance",
      department: data.department || config?.department || "Municipal Corporation",
      description: data.description || "",
      isAnonymous: Boolean(data.isAnonymous),
      location: data.location || {
        lat: 12.9716,
        lng: 77.5946,
        headingDegrees: 0,
        address: "Bengaluru Central, Karnataka",
      },
      capturePhotoUrl: data.capturePhotoUrl || null,
      resolvedPhotoUrl: null,
      status: "submitted",
      slaDays,
      slaDeadline,
      escalationLevel: "ward",
      escalationHistory: [],
      priority: data.priority || "medium",
      wardNumber: data.wardNumber || "Ward 12",
      zoneName: data.zoneName || "Central Zone",
      civicPointsAwarded: data.category === "Corruption & Accountability" ? 50 : 20,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      resolvedAt: null,
    };

    memGrievances.unshift(newGrievance);

    const mongoose = await connectToDatabase();
    if (mongoose) {
      try {
        await GrievanceModel.create({
          ...newGrievance,
          slaDeadline: new Date(newGrievance.slaDeadline),
          createdAt: new Date(newGrievance.createdAt),
          updatedAt: new Date(newGrievance.updatedAt),
        });
      } catch (e) {
        console.warn("DB save failed, saved to memory:", e);
      }
    }

    return newGrievance;
  },

  async updateGrievance(id: string, updates: Partial<Grievance>): Promise<Grievance | null> {
    const index = memGrievances.findIndex((g) => g._id === id || g.id === id);
    if (index === -1) return null;

    const existing = memGrievances[index];
    const updated: Grievance = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.status === "resolved" && !existing.resolvedAt) {
      updated.resolvedAt = new Date().toISOString();
    }

    memGrievances[index] = updated;

    const mongoose = await connectToDatabase();
    if (mongoose) {
      try {
        await GrievanceModel.updateOne(
          { $or: [{ _id: id }, { id: id }] },
          {
            $set: {
              ...updates,
              updatedAt: new Date(),
              resolvedAt: updated.resolvedAt ? new Date(updated.resolvedAt) : null,
            },
          }
        );
      } catch (e) {
        console.warn("DB update failed, updated in memory:", e);
      }
    }

    return updated;
  },

  async runSlaEscalationCheck(): Promise<{
    checkedCount: number;
    escalatedCount: number;
    escalatedIds: string[];
  }> {
    const now = new Date();
    const escalatedIds: string[] = [];

    const levelChain: Record<string, "zonal" | "district" | "state"> = {
      ward: "zonal",
      zonal: "district",
      district: "state",
    };

    for (let i = 0; i < memGrievances.length; i++) {
      const g = memGrievances[i];
      if (g.status === "resolved") continue;

      const deadline = new Date(g.slaDeadline);
      if (now > deadline && g.escalationLevel !== "state") {
        const nextLevel = levelChain[g.escalationLevel] || "state";
        const reason = `Automated SLA Engine: Resolution window expired on ${deadline.toLocaleString()}. Escalated from ${g.escalationLevel} to ${nextLevel}.`;

        const newHistory = [
          ...(g.escalationHistory || []),
          {
            fromLevel: g.escalationLevel,
            toLevel: nextLevel,
            escalatedAt: now.toISOString(),
            reason,
            triggeredBy: "cron_sla_breach" as const,
          },
        ];

        memGrievances[i] = {
          ...g,
          status: "escalated",
          escalationLevel: nextLevel,
          escalationHistory: newHistory,
          updatedAt: now.toISOString(),
        };

        escalatedIds.push(g._id);
      }
    }

    return {
      checkedCount: memGrievances.length,
      escalatedCount: escalatedIds.length,
      escalatedIds,
    };
  },

  async getTransparencyScores(): Promise<TransparencyScore[]> {
    return SEED_TRANSPARENCY_SCORES;
  },
};
