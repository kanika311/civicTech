"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../component/Navbar";
import VRCommandCenter from "@/components/vr/VRCommandCenter";
import { Grievance } from "@/types/grievance";
import { civicApi } from "@/lib/civicApi";
import { Crown, Layers, Box, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";

export default function AdminVRCommandPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = () => {
    civicApi.getGrievances()
      .then((res) => setGrievances(res))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBatchAssign = async (ids: string[], workerName: string) => {
    for (const id of ids) {
      await civicApi.updateGrievance(id, {
        assignedWorkerName: workerName,
        status: "in_progress",
        officialNotes: `Batch-assigned to "${workerName}" via District 3D VR Command Center.`,
      });
    }
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Crown size={12} /> Zonal &amp; District Magistrate Command View
              </span>
              <span className="text-xs text-slate-400">
                Administrator: <strong>Ananya Roy, IAS (District Collector)</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Spatial VR/3D Command-Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Interactive 3D jurisdictional district terrain, cross-department density heatmaps, and batch cluster assignment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono">
              WebXR / Three.js 3D Session Ready
            </span>
          </div>
        </div>

        {/* 3D Scene Component */}
        {loading ? (
          <div className="py-32 text-center text-slate-400">Initializing Three.js 3D Spatial Canvas...</div>
        ) : (
          <VRCommandCenter
            grievances={grievances}
            onBatchAssign={handleBatchAssign}
          />
        )}
      </main>
    </div>
  );
}
