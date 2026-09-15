"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../component/Navbar";
import { civicApi } from "@/lib/civicApi";
import { Grievance, ProcurementProject } from "@/types/grievance";
import ARGhostPreview from "@/components/ar/ARGhostPreview";
import ARPublicSpendingOverlay from "@/components/ar/ARPublicSpendingOverlay";
import Citizen3DWardMap from "@/components/vr/Citizen3DWardMap";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MapPin,
  Award,
  Landmark,
  Eye,
  Plus,
  Box,
  Camera,
  Compass,
} from "lucide-react";

export default function CitizenDashboardPage() {
  const router = useRouter();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [procurementProjects, setProcurementProjects] = useState<ProcurementProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [citizenName, setCitizenName] = useState<string>("Aarav Sharma");

  // AR/VR Modals
  const [ghostGrievance, setGhostGrievance] = useState<Grievance | null>(null);
  const [spendingProject, setSpendingProject] = useState<ProcurementProject | null>(null);
  const [show3DWardMap, setShow3DWardMap] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("civic_role");

      // Strict role isolation: Government officials must be on the Government Portal
      if (role === "government") {
        router.replace("/government");
        return;
      }

      if (!token) {
        router.replace("/login?role=citizen");
        return;
      }

      const userStr = localStorage.getItem("civic_user");
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          if (parsed.name) setCitizenName(parsed.name);
        } catch {
          // ignore
        }
      }
    }

    Promise.all([
      civicApi.getGrievances(),
      civicApi.getProcurementProjects(),
    ])
      .then(([gList, pList]) => {
        setGrievances(gList);
        setProcurementProjects(pList);
      })
      .catch((err) => console.error("Error loading citizen data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filtered list
  const filteredList = grievances.filter((g) => {
    if (statusFilter === "ALL") return true;
    return g.status === statusFilter;
  });

  // Calculate stats
  const totalReported = grievances.length;
  const totalResolved = grievances.filter((g) => g.status === "resolved").length;
  const totalEscalated = grievances.filter((g) => g.status === "escalated").length;
  const totalCivicPoints = grievances.reduce((acc, g) => acc + (g.civicPointsAwarded || 15), 45);

  // Helper for SLA Countdown
  const getSlaBadge = (deadlineStr: string, status: string, escalationLevel: string) => {
    if (status === "resolved") {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
          <CheckCircle2 size={13} /> SLA Met (Resolved)
        </span>
      );
    }

    const diffMs = new Date(deadlineStr).getTime() - Date.now();
    const hours = Math.round(diffMs / (1000 * 3600));

    if (hours < 0 || status === "escalated") {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1 animate-pulse">
          <AlertTriangle size={13} /> SLA Breached • Escalated to {escalationLevel.toUpperCase()}
        </span>
      );
    }

    if (hours <= 24) {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 flex items-center gap-1">
          <Clock size={13} /> {hours}h remaining (Critical)
        </span>
      );
    }

    const days = Math.round(hours / 24);
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 flex items-center gap-1">
        <Clock size={13} /> {days} days left in SLA
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Citizen Redressal Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Welcome back, <strong className="text-slate-900 dark:text-white">{citizenName}</strong> (Ward 12, Central Zone)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShow3DWardMap(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Box size={15} /> 3D Ward Digital Twin
            </button>

            <Link
              href="/transparency"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Eye size={15} /> Department Transparency
            </Link>

            <Link
              href="/citizen/submit-universal"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
            >
              <Plus size={16} /> Report Grievance
            </Link>
          </div>
        </div>

        {/* Stats & Civic Points Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Civic Points Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-200 dark:border-indigo-500/30 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">Your Civic Points</span>
              <Award size={18} className="text-amber-500 dark:text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-950 dark:text-white font-mono">{totalCivicPoints}</div>
            <div className="text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1 font-medium">
              <Sparkles size={11} /> Badge: <strong>Civic Sentinel</strong>
            </div>
          </div>

          {/* Total Complaints */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Reported</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{totalReported}</div>
            <div className="text-[11px] text-slate-500">Across all 10 departments</div>
          </div>

          {/* Resolved */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resolved to Date</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{totalResolved}</div>
            <div className="text-[11px] text-slate-500">AR Ghost Verified</div>
          </div>

          {/* Escalated */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Escalated (SLA Breaches)</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">{totalEscalated}</div>
            <div className="text-[11px] text-slate-500">Under Ombudsman Oversight</div>
          </div>
        </div>

        {/* CITIZEN AR & 3D SPATIAL TOOL SUITE */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-blue-200 dark:border-indigo-500/30 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-600 text-white uppercase tracking-wider">
                  Spatial Tech
                </span>
                <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Citizen AR &amp; 3D Spatial Oversight Suite
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Explore real-time spatial tools: 3D interactive neighborhood digital twin, AR camera evidence, and optical ghost before/after inspection.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              onClick={() => setShow3DWardMap(true)}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-blue-200 dark:border-indigo-500/40 hover:border-blue-400 dark:hover:border-indigo-400 shadow-sm hover:shadow-md transition text-left flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                <Box size={20} />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                  3D Ward Digital Twin
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Launch interactive 3D spatial map of complaints &amp; resolution status in Ward 12.
                </div>
              </div>
            </button>

            <Link
              href="/citizen/submit-universal"
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-500/40 hover:border-blue-400 dark:hover:border-blue-400 shadow-sm hover:shadow-md transition text-left flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                <Camera size={20} />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  AR Spatial Evidence Camera
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Capture problems with live compass bearing, leveling reticle, and GPS telemetry.
                </div>
              </div>
            </Link>

            {procurementProjects.length > 0 ? (
              <button
                onClick={() => setSpendingProject(procurementProjects[0])}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-cyan-200 dark:border-cyan-500/40 hover:border-cyan-400 dark:hover:border-cyan-400 shadow-sm hover:shadow-md transition text-left flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                  <Landmark size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                    AR Public Spending Scanner
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Inspect sanctioned taxpayer budgets, contractor spend, and defect warranty periods.
                  </div>
                </div>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    AR Ghost Verification
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Verify resolved tickets with optical ghost before/after overlay comparison.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["ALL", "submitted", "in_progress", "escalated", "resolved"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap capitalize ${
                  statusFilter === status
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredList.length} of {grievances.length} grievances
          </span>
        </div>

        {/* Grievances List */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading civic grievances...</div>
        ) : filteredList.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <ShieldAlert size={36} className="mx-auto text-slate-400 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No grievances match the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((g) => {
              const linkedProc = procurementProjects.find(
                (p) => p._id === g.procurementProjectId || p.projectId === g.procurementProjectId
              );

              return (
                <div
                  key={g._id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Category & Status Bar */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-mono text-blue-600 dark:text-cyan-400 uppercase tracking-wider block font-bold">
                          {g.department}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                          {g.subcategory}
                        </h3>
                      </div>
                      {getSlaBadge(g.slaDeadline, g.status, g.escalationLevel)}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {g.description}
                    </p>

                    {/* Spatial Anchor Data */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                      <div className="flex items-center gap-1 text-slate-800 dark:text-slate-300">
                        <MapPin size={12} className="text-rose-500 dark:text-rose-400" />
                        <span className="truncate">{g.location.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 font-mono text-[10px]">
                        <span>COORDS: {g.location.lat}°, {g.location.lng}°</span>
                        <span>BEARING: {g.location.headingDegrees || 0}°</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & AR Launchers */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="text-slate-500 text-[11px]">
                      Reported: {new Date(g.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* AR Public Spending Overlay Launcher if linked */}
                      {linkedProc && (
                        <button
                          onClick={() => setSpendingProject(linkedProc)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-[11px] font-medium flex items-center gap-1 transition"
                          title="View sanctioned budget and contractor spend for this site"
                        >
                          <Landmark size={12} /> Project Budget (AR)
                        </button>
                      )}

                      {/* AR Ghost Preview Launcher for resolved grievances */}
                      {g.status === "resolved" && (
                        <button
                          onClick={() => setGhostGrievance(g)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-md shadow-emerald-600/30 transition"
                        >
                          <Sparkles size={12} /> AR Ghost Verify
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* AR Ghost Preview Modal */}
      {ghostGrievance && (
        <ARGhostPreview
          grievance={ghostGrievance}
          isOpen={Boolean(ghostGrievance)}
          onClose={() => setGhostGrievance(null)}
        />
      )}

      {/* AR Public Spending Overlay Modal */}
      {spendingProject && (
        <ARPublicSpendingOverlay
          project={spendingProject}
          isOpen={Boolean(spendingProject)}
          onClose={() => setSpendingProject(null)}
        />
      )}

      {/* 3D Citizen Ward Digital Twin Modal */}
      {show3DWardMap && (
        <Citizen3DWardMap
          grievances={grievances}
          isOpen={show3DWardMap}
          onClose={() => setShow3DWardMap(false)}
          onSelectGrievance={(g) => {
            if (g.status === "resolved") setGhostGrievance(g);
          }}
        />
      )}
    </div>
  );
}
