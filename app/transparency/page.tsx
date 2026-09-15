"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../component/Navbar";
import { TransparencyScore, ProcurementProject } from "@/types/grievance";
import { civicApi } from "@/lib/civicApi";
import {
  Eye,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Landmark,
  Award,
  Search,
  Lock,
} from "lucide-react";

export default function PublicTransparencyPage() {
  const [scores, setScores] = useState<TransparencyScore[]>([]);
  const [procurements, setProcurements] = useState<ProcurementProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    Promise.all([civicApi.getTransparencyScores(), civicApi.getProcurementProjects()])
      .then(([sList, pList]) => {
        setScores(sList);
        setProcurements(pList);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredScores = scores.filter((s) =>
    s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgIndex = scores.length > 0
    ? (scores.reduce((acc, s) => acc + s.transparencyIndex, 0) / scores.length).toFixed(1)
    : "82.4";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 flex items-center gap-1">
              <Eye size={12} /> Public Transparency &amp; Open Governance
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
              <Lock size={11} /> PII Redacted • Zero Citizen Data Leakage
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Department Transparency &amp; Accountability Index
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Real-time public audit of SLA compliance, resolution speed, and procurement spending across all 10 departments.
          </p>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50 border border-cyan-200 dark:border-cyan-500/30 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">Composite Transparency Score</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{avgIndex}/100</div>
            <div className="text-[11px] text-cyan-700 dark:text-cyan-300">State-wide benchmark average</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Audited Grievances</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">8,915</div>
            <div className="text-[11px] text-slate-500">Aggregated &amp; Anonymized</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Avg. SLA Adherence Rate</span>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-300 font-mono">80.6%</div>
            <div className="text-[11px] text-slate-500">Legal statutory resolution window</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Active Procurement Projects</span>
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-300 font-mono">{procurements.length}</div>
            <div className="text-[11px] text-slate-500">AR Public-Spending Geo-Fenced</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md shadow-sm">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search department or category..."
            className="bg-transparent text-sm text-slate-900 dark:text-white outline-none w-full placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Department Transparency Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Department Performance Scorecard</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Computed via statutory SLA adherence &amp; re-complaint rates</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                <tr>
                  <th className="p-4">Department &amp; Category</th>
                  <th className="p-4 text-center">Total Reported</th>
                  <th className="p-4 text-center">Resolved</th>
                  <th className="p-4 text-center">SLA Adherence</th>
                  <th className="p-4 text-center">Avg Hours to Resolve</th>
                  <th className="p-4 text-center">Re-Complaint Rate</th>
                  <th className="p-4 text-center">Transparency Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {filteredScores.map((row) => (
                  <tr key={row.category} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{row.department}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{row.category}</div>
                    </td>
                    <td className="p-4 text-center font-mono">{row.totalGrievances}</td>
                    <td className="p-4 text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {row.resolvedGrievances}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-mono font-bold ${row.slaAdherenceRate >= 80 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {row.slaAdherenceRate}%
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono">{row.avgResolutionHours}h</td>
                    <td className="p-4 text-center font-mono text-slate-500 dark:text-slate-400">{row.reComplaintRate}%</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold font-mono text-xs ${
                        row.grade === "A+" || row.grade === "A"
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                          : row.grade === "B"
                          ? "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30"
                          : "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30"
                      }`}>
                        {row.transparencyIndex}/100 ({row.grade})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Public Procurement Spending vs Defect Correlation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Landmark size={18} className="text-cyan-600 dark:text-cyan-400" />
                Public Procurement Spending Data (AR Overlay Sources)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live link between taxpayer project budgets and on-site citizen grievance reports.
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-mono">
              Open Contractor Ledger
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {procurements.map((p) => (
              <div key={p._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase font-bold">{p.projectId}</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{p.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{p.contractorName}</p>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Sanctioned Budget:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">₹ {p.sanctionedBudgetInLakhs}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Disbursed:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹ {p.spendToDateInLakhs}L</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-cyan-500 dark:bg-cyan-400 h-full rounded-full"
                      style={{
                        width: `${Math.round((p.spendToDateInLakhs / p.sanctionedBudgetInLakhs) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-900">
                  Site: {p.location.address}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
