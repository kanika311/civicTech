"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../component/Navbar";
import { Grievance, GrievanceStatus, TransparencyScore, ProcurementProject } from "@/types/grievance";
import { civicApi } from "@/lib/civicApi";
import VRCommandCenter from "@/components/vr/VRCommandCenter";
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HardHat,
  Compass,
  Navigation,
  Box,
  Layers,
  Sparkles,
  Search,
  Filter,
  Users,
  Eye,
  Camera,
  FileText,
  Landmark,
  Gavel,
  CheckCircle,
} from "lucide-react";

export default function GovernmentPortalPage() {
  const router = useRouter();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [transparencyScores, setTransparencyScores] = useState<TransparencyScore[]>([]);
  const [procurements, setProcurements] = useState<ProcurementProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"queue" | "vr" | "field_assist" | "escalations" | "transparency">("queue");

  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);

  // Ticket edit fields
  const [statusToSet, setStatusToSet] = useState<GrievanceStatus>("in_progress");
  const [assignedWorker, setAssignedWorker] = useState<string>("PWD Rapid Response Crew #1");
  const [officialNotes, setOfficialNotes] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  // Field assist radar state
  const [currentHeading, setCurrentHeading] = useState<number>(140);
  const [officerName, setOfficerName] = useState<string>("Dr. S. K. Verma");
  const [officerDept, setOfficerDept] = useState<string>("Public Works Department");

  const loadData = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("civic_role");

      // Strict role isolation: Citizens cannot access government control portal
      if (role === "citizen") {
        router.replace("/citizen/dashboard");
        return;
      }

      if (!token) {
        router.replace("/login?role=government");
        return;
      }

      const userStr = localStorage.getItem("civic_user");
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          if (parsed.name) setOfficerName(parsed.name);
          if (parsed.department) setOfficerDept(parsed.department);
        } catch {
          // ignore
        }
      }
    }

    Promise.all([
      civicApi.getGrievances(),
      civicApi.getTransparencyScores(),
      civicApi.getProcurementProjects(),
    ])
      .then(([gList, tList, pList]) => {
        setGrievances(gList);
        setTransparencyScores(tList);
        setProcurements(pList);
        if (gList.length > 0 && !selectedGrievance) {
          setSelectedGrievance(gList[0]);
          setStatusToSet(gList[0].status);
          setAssignedWorker(gList[0].assignedWorkerName || "PWD Rapid Response Crew #1");
          setOfficialNotes(gList[0].officialNotes || "");
          setProofUrl(gList[0].resolvedPhotoUrl || "");
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectGrievance = (g: Grievance) => {
    setSelectedGrievance(g);
    setStatusToSet(g.status);
    setAssignedWorker(g.assignedWorkerName || "PWD Rapid Response Crew #1");
    setOfficialNotes(g.officialNotes || "");
    setProofUrl(g.resolvedPhotoUrl || "");
  };

  const handleUpdateTicket = async () => {
    if (!selectedGrievance) return;
    setIsUpdating(true);
    try {
      await civicApi.updateGrievance(selectedGrievance._id, {
        status: statusToSet,
        assignedWorkerName: assignedWorker,
        officialNotes,
        resolvedPhotoUrl: proofUrl || undefined,
      });
      setUpdateMsg("Departmental record successfully updated.");
      setTimeout(() => setUpdateMsg(null), 3500);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBatchAssign = async (ids: string[], workerName: string) => {
    for (const id of ids) {
      await civicApi.updateGrievance(id, {
        assignedWorkerName: workerName,
        status: "in_progress",
        officialNotes: `Batch-assigned to "${workerName}" via Government 3D/VR Command Center.`,
      });
    }
    setUpdateMsg(`Batch of ${ids.length} ticket(s) assigned to ${workerName}.`);
    setTimeout(() => setUpdateMsg(null), 4000);
    loadData();
  };

  // Filtered grievances for Queue tab
  const filteredGrievances = grievances.filter((g) => {
    if (departmentFilter !== "ALL" && g.department !== departmentFilter) return false;
    if (statusFilter !== "ALL" && g.status !== statusFilter) return false;
    return true;
  });

  const escalatedGrievances = grievances.filter((g) => g.status === "escalated" || g.escalationLevel !== "ward");

  // Summary Metrics
  const totalCount = grievances.length;
  const inProgressCount = grievances.filter((g) => g.status === "in_progress" || g.status === "acknowledged").length;
  const resolvedCount = grievances.filter((g) => g.status === "resolved").length;
  const escalatedCount = escalatedGrievances.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Government Portal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 flex items-center gap-1">
                <Building2 size={12} /> Government Administration &amp; Operations Portal
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Officer: <strong className="text-slate-900 dark:text-white">{officerName}</strong> ({officerDept})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Government Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Department queue management, AR field inspection assist, 3D VR command scene, and statutory SLA escalation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
              Role: Government Official ({officerDept.split(" ")[0]})
            </span>
          </div>
        </div>

        {/* Global KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Grievances</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{totalCount}</div>
            <div className="text-[11px] text-slate-500">All 10 departments</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Active / In-Progress</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{inProgressCount}</div>
            <div className="text-[11px] text-slate-500">Assigned to field crews</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resolved to Grade</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{resolvedCount}</div>
            <div className="text-[11px] text-slate-500">AR proof verified</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">SLA Breaches (Escalated)</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">{escalatedCount}</div>
            <div className="text-[11px] text-slate-500">Zonal / District / State level</div>
          </div>
        </div>

        {/* Update Notification */}
        {updateMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span>{updateMsg}</span>
          </div>
        )}

        {/* GOVERNMENT TABS NAVIGATION */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "queue"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Building2 size={14} />
            <span>Department Queue &amp; Tickets</span>
          </button>

          <button
            onClick={() => setActiveTab("vr")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "vr"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Box size={14} />
            <span>3D / VR Spatial Command Center</span>
          </button>

          <button
            onClick={() => setActiveTab("field_assist")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "field_assist"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <HardHat size={14} />
            <span>AR Field-Assist (On-Site Verification)</span>
          </button>

          <button
            onClick={() => setActiveTab("escalations")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "escalations"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Clock size={14} />
            <span>SLA Escalations &amp; Ombudsman ({escalatedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("transparency")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "transparency"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Eye size={14} />
            <span>Transparency Audit &amp; Procurement</span>
          </button>
        </div>

        {/* TAB 1: DEPARTMENT QUEUE & TICKETS */}
        {activeTab === "queue" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Queue List */}
            <div className="lg:col-span-7 space-y-4">
              {/* Filter controls */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">Department:</span>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-1.5 font-medium outline-none border border-slate-200 dark:border-slate-700"
                  >
                    <option value="ALL">All Departments (10 Taxonomies)</option>
                    <option value="Public Works Department">Public Works Department</option>
                    <option value="Municipal Corporation">Municipal Corporation</option>
                    <option value="Water Board / Electricity Board">Water Board / Electricity Board</option>
                    <option value="Health Department">Health Department</option>
                    <option value="Education Department">Education Department</option>
                    <option value="Police / Traffic Department">Police / Traffic Department</option>
                    <option value="Revenue Department">Revenue Department</option>
                    <option value="Social Welfare Department">Social Welfare Department</option>
                    <option value="Pollution Control Board / Disaster Management">Pollution Control Board</option>
                    <option value="Anti-Corruption Bureau">Anti-Corruption Bureau</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  {["ALL", "submitted", "in_progress", "escalated", "resolved"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium capitalize transition ${
                        statusFilter === st
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets List */}
              {loading ? (
                <div className="py-20 text-center text-slate-400">Loading department queue...</div>
              ) : filteredGrievances.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
                  No tickets match the selected department filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGrievances.map((g) => {
                    const isSelected = selectedGrievance?._id === g._id;
                    return (
                      <div
                        key={g._id}
                        onClick={() => handleSelectGrievance(g)}
                        className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                          isSelected
                            ? "bg-indigo-50/50 dark:bg-slate-900 border-indigo-500 dark:border-indigo-500 ring-1 ring-indigo-500/30"
                            : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-cyan-400 uppercase">
                              {g.department} • {g.subcategory}
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                              {g.location.address}
                            </h4>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                              g.status === "resolved"
                                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                                : g.status === "escalated"
                                ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30"
                                : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30"
                            }`}
                          >
                            {g.status.replace("_", " ")}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                          {g.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                          <span>SLA Deadline: {new Date(g.slaDeadline).toLocaleString()}</span>
                          <span>Escalation: <strong className="font-mono uppercase text-slate-800 dark:text-cyan-300">{g.escalationLevel}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Ticket Action Drawer */}
            <div className="lg:col-span-5">
              {selectedGrievance ? (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <span className="text-[11px] font-mono text-indigo-600 dark:text-cyan-400 uppercase font-bold">
                      Official Ticket Inspector
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {selectedGrievance.subcategory}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Citizen: {selectedGrievance.citizenName} • {selectedGrievance.location.address}
                    </p>
                  </div>

                  {selectedGrievance.capturePhotoUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative max-h-48">
                      <img
                        src={selectedGrievance.capturePhotoUrl}
                        alt="Citizen Report Evidence"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                        Citizen AR Spatial Evidence
                      </span>
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                        Update Status
                      </label>
                      <select
                        value={statusToSet}
                        onChange={(e) => setStatusToSet(e.target.value as GrievanceStatus)}
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="escalated">Escalated</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                        Assign to Response Crew / Worker
                      </label>
                      <input
                        type="text"
                        value={assignedWorker}
                        onChange={(e) => setAssignedWorker(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                        Official Action Notes
                      </label>
                      <textarea
                        rows={3}
                        value={officialNotes}
                        onChange={(e) => setOfficialNotes(e.target.value)}
                        placeholder="Detail materials used, team dispatched, resolution report..."
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                        Resolution Proof Photo URL
                      </label>
                      <input
                        type="text"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder="https://... or snapshot"
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={handleUpdateTicket}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                    >
                      {isUpdating ? "Saving..." : "Save Ticket Updates"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                  Select a ticket on the left to inspect details or assign crews.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 3D / VR SPATIAL COMMAND CENTER */}
        {activeTab === "vr" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  3D Jurisdictional Command-Center Overview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Visual density heat-columns across all 10 departments. Click any column to inspect the cluster and execute 1-click batch assignment.
                </p>
              </div>
            </div>

            <VRCommandCenter
              grievances={grievances}
              onBatchAssign={handleBatchAssign}
            />
          </div>
        )}

        {/* TAB 3: AR FIELD-ASSIST */}
        {activeTab === "field_assist" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Select Grievance for AR Field Inspection
              </h3>
              <div className="space-y-2 max-h-[550px] overflow-y-auto">
                {grievances.map((g) => (
                  <div
                    key={g._id}
                    onClick={() => setSelectedGrievance(g)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedGrievance?._id === g._id
                        ? "bg-amber-50 dark:bg-slate-900 border-amber-500 dark:border-amber-500"
                        : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{g.subcategory}</div>
                    <div className="text-[11px] text-slate-500">{g.location.address}</div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-1">
                      Bearing: {g.location.headingDegrees || 142}° • Status: {g.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              {selectedGrievance ? (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        AR Field-Assist Viewport
                      </h4>
                      <p className="text-xs text-slate-500">
                        {selectedGrievance.subcategory} • {selectedGrievance.location.address}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      TARGET: {selectedGrievance.location.headingDegrees || 142}°
                    </span>
                  </div>

                  <div className="relative h-72 rounded-xl overflow-hidden bg-black">
                    <img
                      src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80"
                      alt="Live field camera"
                      className="w-full h-full object-cover"
                    />
                    {selectedGrievance.capturePhotoUrl && (
                      <img
                        src={selectedGrievance.capturePhotoUrl}
                        alt="Ghost overlay"
                        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen pointer-events-none"
                      />
                    )}

                    <div className="absolute top-3 left-3 bg-black/75 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300">
                      DISTANCE: ~14m away • HEADING: {selectedGrievance.location.headingDegrees || 142}°
                    </div>

                    <div className="absolute bottom-3 inset-x-3 bg-black/80 p-2 rounded-lg text-xs text-slate-200 flex justify-between">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Optical Ghost Anchor Aligned
                      </span>
                      <span className="font-mono text-[11px]">
                        GPS: {selectedGrievance.location.lat}°, {selectedGrievance.location.lng}°
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setStatusToSet("resolved");
                      handleUpdateTicket();
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    Confirm On-Site Inspection &amp; Resolve Ticket
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">Select a grievance to test AR Field-Assist.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SLA ESCALATIONS & OMBUDSMAN */}
        {activeTab === "escalations" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                  Statutory SLA Breach &amp; Ombudsman Escalation Docket
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Tickets that exceeded their department legal resolution window and advanced from Ward → Zonal → District → State.
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold font-mono">
                {escalatedGrievances.length} Breached
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {escalatedGrievances.map((g) => (
                <div
                  key={g._id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 uppercase font-bold">
                        {g.department}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{g.subcategory}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 uppercase">
                      LEVEL: {g.escalationLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{g.description}</p>

                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="font-semibold text-rose-700 dark:text-rose-400">Automated Breach Log:</div>
                    <div className="italic">
                      {g.escalationHistory && g.escalationHistory.length > 0
                        ? g.escalationHistory[g.escalationHistory.length - 1].reason
                        : "SLA deadline expired without resolution."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: TRANSPARENCY AUDIT & PROCUREMENT */}
        {activeTab === "transparency" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
                Department Transparency Scores &amp; SLA Adherence Index
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase tracking-wider font-mono">
                    <tr>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-center">Complaints</th>
                      <th className="p-3 text-center">Resolved</th>
                      <th className="p-3 text-center">SLA Adherence</th>
                      <th className="p-3 text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {transparencyScores.map((row) => (
                      <tr key={row.category} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{row.department}</td>
                        <td className="p-3 text-center font-mono">{row.totalGrievances}</td>
                        <td className="p-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-bold">{row.resolvedGrievances}</td>
                        <td className="p-3 text-center font-mono">{row.slaAdherenceRate}%</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full font-bold font-mono bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            {row.transparencyIndex}/100 ({row.grade})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
