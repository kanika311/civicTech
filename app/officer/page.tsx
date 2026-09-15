"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../component/Navbar";
import { Grievance, GrievanceStatus } from "@/types/grievance";
import { civicApi } from "@/lib/civicApi";
import {
  Building,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  FileEdit,
  Filter,
  Search,
  Upload,
} from "lucide-react";

export default function DepartmentOfficerPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [department, setDepartment] = useState<string>("Public Works Department");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);

  // Edit fields
  const [statusToSet, setStatusToSet] = useState<GrievanceStatus>("in_progress");
  const [assignedWorker, setAssignedWorker] = useState<string>("Ramesh Kumar (Junior Engineer)");
  const [officialNotes, setOfficialNotes] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const loadData = () => {
    civicApi.getGrievances({ department })
      .then((res) => {
        setGrievances(res);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [department]);

  const handleSelect = (g: Grievance) => {
    setSelectedGrievance(g);
    setStatusToSet(g.status);
    setAssignedWorker(g.assignedWorkerName || "Ramesh Kumar (Junior Engineer)");
    setOfficialNotes(g.officialNotes || "");
    setProofUrl(g.resolvedPhotoUrl || "");
  };

  const handleUpdate = async () => {
    if (!selectedGrievance) return;
    setIsUpdating(true);
    try {
      await civicApi.updateGrievance(selectedGrievance._id, {
        status: statusToSet,
        assignedWorkerName: assignedWorker,
        officialNotes,
        resolvedPhotoUrl: proofUrl || undefined,
      });
      setUpdateMsg("Grievance record updated successfully.");
      setTimeout(() => setUpdateMsg(null), 3500);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = grievances.filter((g) => {
    if (statusFilter === "ALL") return true;
    return g.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Building size={12} /> Department Officer Queue
              </span>
              <span className="text-xs text-slate-400">
                Officer: <strong>Dr. S. K. Verma (Executive Engineer)</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Department Operations &amp; Queue Management
            </h1>
          </div>

          {/* Department Switcher */}
          <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Dept:</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-transparent text-white font-semibold outline-none cursor-pointer"
            >
              <option value="Public Works Department" className="bg-slate-900">Public Works Department</option>
              <option value="Municipal Corporation" className="bg-slate-900">Municipal Corporation</option>
              <option value="Water Board / Electricity Board" className="bg-slate-900">Water Board / Electricity Board</option>
              <option value="Health Department" className="bg-slate-900">Health Department</option>
              <option value="Education Department" className="bg-slate-900">Education Department</option>
              <option value="Police / Traffic Department" className="bg-slate-900">Police / Traffic Department</option>
              <option value="Revenue Department" className="bg-slate-900">Revenue Department</option>
              <option value="Social Welfare Department" className="bg-slate-900">Social Welfare Department</option>
              <option value="Pollution Control Board / Disaster Management" className="bg-slate-900">Pollution Control Board</option>
              <option value="Anti-Corruption Bureau" className="bg-slate-900">Anti-Corruption Bureau</option>
            </select>
          </div>
        </div>

        {updateMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} /> {updateMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Table / List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                {["ALL", "submitted", "acknowledged", "in_progress", "escalated", "resolved"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition ${
                      statusFilter === st ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500">{filtered.length} items</span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-500">Loading department grievances...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                No tickets currently matching this filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((g) => {
                  const isSelected = selectedGrievance?._id === g._id;
                  return (
                    <div
                      key={g._id}
                      onClick={() => handleSelect(g)}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? "bg-slate-900 border-blue-500 ring-1 ring-blue-500/40"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <span className="text-[11px] font-mono text-cyan-400 uppercase">
                            {g.subcategory}
                          </span>
                          <h4 className="text-white font-bold text-sm">{g.location.address}</h4>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                            g.status === "resolved"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : g.status === "escalated"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {g.status.replace("_", " ")}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 mb-2">{g.description}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>SLA Deadline: {new Date(g.slaDeadline).toLocaleString()}</span>
                        <span>Level: <strong className="text-cyan-300 font-mono uppercase">{g.escalationLevel}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Action & Verification Drawer */}
          <div className="lg:col-span-5">
            {selectedGrievance ? (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[11px] font-mono text-cyan-400 uppercase">Ticket Actions</span>
                  <h3 className="text-white font-bold text-base">{selectedGrievance.subcategory}</h3>
                  <p className="text-xs text-slate-400">{selectedGrievance.location.address}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Update Status</label>
                    <select
                      value={statusToSet}
                      onChange={(e) => setStatusToSet(e.target.value as GrievanceStatus)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="escalated">Escalated</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Assign to Field Crew</label>
                    <input
                      type="text"
                      value={assignedWorker}
                      onChange={(e) => setAssignedWorker(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Official Inspection Notes</label>
                    <textarea
                      rows={3}
                      value={officialNotes}
                      onChange={(e) => setOfficialNotes(e.target.value)}
                      placeholder="Add official departmental notes, action taken, materials used..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Resolution Proof Photo URL</label>
                    <input
                      type="text"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="https://... or snapshot"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleUpdate}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                  >
                    {isUpdating ? "Saving Updates..." : "Save Departmental Updates"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500">
                Select a grievance on the left to inspect, re-assign, or update status.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
