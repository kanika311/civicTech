import { Grievance, DepartmentConfig, ProcurementProject, TransparencyScore } from "@/types/grievance";

export const civicApi = {
  async getGrievances(params?: Record<string, string>): Promise<Grievance[]> {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await fetch(`/api/grievances${qs}`, { cache: "no-store" });
    const json = await res.json();
    return json.ok ? json.data : [];
  },

  async getGrievanceById(id: string): Promise<Grievance | null> {
    const res = await fetch(`/api/grievances/${id}`, { cache: "no-store" });
    const json = await res.json();
    return json.ok ? json.data : null;
  },

  async submitGrievance(data: Partial<Grievance>): Promise<{ ok: boolean; data?: Grievance; error?: string }> {
    try {
      const res = await fetch("/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json;
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Submission failed" };
    }
  },

  async updateGrievance(id: string, updates: Partial<Grievance>): Promise<{ ok: boolean; data?: Grievance; error?: string }> {
    try {
      const res = await fetch(`/api/grievances/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      return json;
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Update failed" };
    }
  },

  async runSlaEscalation(): Promise<{ ok: boolean; message: string; data?: { checkedCount: number; escalatedCount: number; escalatedIds: string[] } }> {
    const res = await fetch("/api/escalate", { method: "POST" });
    return res.json();
  },

  async getDepartments(): Promise<DepartmentConfig[]> {
    const res = await fetch("/api/departments", { cache: "no-store" });
    const json = await res.json();
    return json.ok ? json.data : [];
  },

  async getProcurementProjects(): Promise<ProcurementProject[]> {
    const res = await fetch("/api/procurement", { cache: "no-store" });
    const json = await res.json();
    return json.ok ? json.data : [];
  },

  async getTransparencyScores(): Promise<TransparencyScore[]> {
    const res = await fetch("/api/transparency", { cache: "no-store" });
    const json = await res.json();
    return json.ok ? json.data : [];
  },

  async resetSeed(): Promise<void> {
    await fetch("/api/seed", { method: "POST" });
  },
};
