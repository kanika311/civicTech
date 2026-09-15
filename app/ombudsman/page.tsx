"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../component/Navbar";
import { Grievance } from "@/types/grievance";
import { civicApi } from "@/lib/civicApi";
import {
  Scale,
  AlertTriangle,
  Clock,
  Building,
  Gavel,
  CheckCircle2,
  FileText,
  UserX,
  Sparkles,
} from "lucide-react";

export default function StateOmbudsmanPage() {
  const [escalatedList, setEscalatedList] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [directiveText, setDirectiveText] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = () => {
    civicApi.getGrievances({ onlyEscalated: "true" })
      .then((res) => {
        setEscalatedList(res);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueDirective = async () => {
    if (!selectedGrievance) return;
    try {
      await civicApi.updateGrievance(selectedGrievance._id, {
        officialNotes: `[STATE OMBUDSMAN STATUTORY DIRECTIVE]: ${directiveText || "Summons issued to Department Head for immediate redressal within 24 hours under Section 14 of Public Redressal Act."}`,
        priority: "urgent",
      });
      setActionSuccess("Statutory Directive issued. Summons dispatched to Principal Secretary.");
      setTimeout(() => setActionSuccess(null), 4000);
      setDirectiveText("");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <Scale size={12} /> State Grievance Ombudsman
              </span>
              <span className="text-xs text-slate-400">
                High Authority: <strong>Justice (Retd.) K. N. Rao</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              State-Wide Escalation &amp; SLA Breach Docket
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Statutory oversight reserved exclusively for grievances that breached departmental SLA legal windows.
            </p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs font-mono">
            Breached Tickets: <strong>{escalatedList.length} Active Escapes</strong>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Escalated Queue */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Statutory Escalation Docket ({escalatedList.length})
            </h2>

            {loading ? (
              <div className="py-20 text-center text-slate-500">Loading escalated tickets...</div>
            ) : escalatedList.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                No escalated grievances currently on the state docket. All departments operating within legal SLA.
              </div>
            ) : (
              escalatedList.map((g) => {
                const isSelected = selectedGrievance?._id === g._id;
                return (
                  <div
                    key={g._id}
                    onClick={() => setSelectedGrievance(g)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? "bg-slate-900 border-rose-500 ring-1 ring-rose-500/40"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[11px] font-mono text-rose-400 uppercase font-semibold">
                          {g.department} • {g.subcategory}
                        </span>
                        <h4 className="text-white font-bold text-sm">{g.location.address}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                        LEVEL: {g.escalationLevel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-3">{g.description}</p>

                    {/* Escalation History Chain */}
                    <div className="p-2.5 rounded-lg bg-slate-950 text-[11px] text-slate-400 space-y-1">
                      <div className="text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle size={12} /> SLA Breach Reason:
                      </div>
                      <div className="italic text-slate-300">
                        {g.escalationHistory && g.escalationHistory.length > 0
                          ? g.escalationHistory[g.escalationHistory.length - 1].reason
                          : "Statutory deadline exceeded without departmental response."}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Ombudsman Action Panel */}
          <div className="lg:col-span-5">
            {selectedGrievance ? (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[11px] font-mono text-rose-400 uppercase font-semibold">
                    Statutory Case Review
                  </span>
                  <h3 className="text-white font-bold text-base">{selectedGrievance.subcategory}</h3>
                  <p className="text-xs text-slate-400">Reported by: {selectedGrievance.citizenName}</p>
                </div>

                {/* Audit trail */}
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-medium">Department Responsible:</div>
                    <div className="text-white font-bold text-sm">{selectedGrievance.department}</div>
                    <div className="text-slate-500 text-[11px]">
                      Original SLA: {selectedGrievance.slaDays} Days • Breached on:{" "}
                      {new Date(selectedGrievance.slaDeadline).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Gavel size={14} className="text-rose-400" />
                      Issue Statutory Ombudsman Directive
                    </label>
                    <textarea
                      rows={4}
                      value={directiveText}
                      onChange={(e) => setDirectiveText(e.target.value)}
                      placeholder="Summons issued to Department Head for immediate redressal within 24 hours under penalty of Section 14..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleIssueDirective}
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Gavel size={14} /> Dispatch Statutory Directive &amp; Summon Head
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500">
                Select an escalated ticket to review the breach audit trail and issue statutory orders.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
