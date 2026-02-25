"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../component/Navbar";
import {
  citizenApi,
  type DashboardData,
  type ComplaintItem,
} from "@/lib/api";

const STATUS_FLOW = ["Pending", "Approved", "In Progress", "Resolved"] as const;

export default function CitizenDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingComplaint, setTrackingComplaint] = useState<ComplaintItem | null>(null);

  const hasComplaints = complaints.length > 0;

  useEffect(() => {
    Promise.all([citizenApi.getDashboard(), citizenApi.getComplaints()])
      .then(([dashboardRes, complaintsRes]) => {
        if (dashboardRes.ok) setDashboard(dashboardRes.data);
        else setError(dashboardRes.error);
        if (complaintsRes.ok) setComplaints(complaintsRes.data);
        else if (!dashboardRes.ok) setError(complaintsRes.error);
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    complaints.forEach((c) => {
      const cat = c.category || "Other";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [complaints]);

  const statusStyle = (status: string) => {
    if (status === "Resolved") return "bg-green-100 text-green-600";
    if (status === "Approved") return "bg-blue-100 text-blue-600";
    if (status === "In Progress") return "bg-indigo-100 text-indigo-600";
    if (status === "Pending") return "bg-yellow-100 text-yellow-600";
    return "bg-gray-100 text-gray-600";
  };

  const formatDate = (createdAt?: string) => {
    if (!createdAt) return "—";
    return new Date(createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-12 flex justify-center items-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-12 flex justify-center items-center min-h-[40vh]">
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-red-100 p-8 max-w-md text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const total = dashboard?.totalComplaints ?? 0;
  const resolved = dashboard?.resolved ?? 0;
  const inProgress = dashboard?.inProgress ?? 0;
  const points = dashboard?.points ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero strip */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 sm:p-8 mb-8 shadow-lg shadow-blue-500/20">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Your Complaint Dashboard
          </h1>
          <p className="mt-2 text-blue-100 text-sm sm:text-base max-w-xl">
            Monitor your submitted complaints. Click any status to see full tracking.
          </p>
          {hasComplaints && (
            <button
              type="button"
              onClick={() => router.push("/citizen/submit")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-sm transition-all duration-200"
            >
              <span>+</span> Submit new complaint
            </button>
          )}
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card title="Total Complaints" value={total} icon="📋" accent="blue" />
          <Card title="Resolved" value={resolved} valueColor="text-emerald-600" icon="✓" accent="green" />
          <Card title="In Progress" value={inProgress} valueColor="text-amber-600" icon="◐" accent="amber" />
          <Card title="Points" value={points} valueColor="text-violet-600" icon="★" accent="violet" />
        </div>

        {/* Empty state */}
        {!hasComplaints && (
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-xl p-10 md:p-14 text-center mb-12 transition-shadow hover:shadow-2xl duration-300">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-blue-500/30">
                📋
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                No complaints yet
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Report an issue in your area—potholes, street lights, sanitation—and track its status here.
              </p>
              <button
                type="button"
                onClick={() => router.push("/citizen/submit")}
                className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5"
              >
                Submit your first complaint
              </button>
            </div>
          </div>
        )}

        {/* Complaints by Category + Recent Complaints */}
        {hasComplaints && (
          <>
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              By category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {categoryCounts.map(([name, count]) => (
                <CategoryCard key={name} name={name} count={count} />
              ))}
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Recent complaints
            </h3>
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-xl overflow-hidden transition-shadow hover:shadow-2xl duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-600 font-semibold">
                      <th className="p-4 rounded-tl-2xl">Issue Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 rounded-tr-2xl">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c, i) => (
                      <tr
                        key={c._id}
                        className={`border-t border-slate-100 transition-colors duration-150 hover:bg-blue-50/50 ${
                          i % 2 === 0 ? "bg-white/50" : "bg-slate-50/30"
                        }`}
                      >
                        <td className="p-4 font-medium text-slate-800">{c.title || "—"}</td>
                        <td className="p-4 text-slate-600">{c.category || "—"}</td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => setTrackingComplaint(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${statusStyle(
                              c.status || "Pending"
                            )}`}
                          >
                            {c.status || "Pending"}
                          </button>
                        </td>
                        <td className="p-4 text-slate-600">{formatDate(c.createdAt)}</td>
                        <td className="p-4 text-slate-600">{c.location || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Status tracking modal */}
        {trackingComplaint && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setTrackingComplaint(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200/80"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800">Complaint status</h3>
                <button
                  type="button"
                  onClick={() => setTrackingComplaint(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>
              <p className="text-slate-600 text-sm mb-6 font-medium">{trackingComplaint.title || "Complaint"}</p>
              <div className="relative pl-1">
                {STATUS_FLOW.map((step, index) => {
                  const current = trackingComplaint.status || "Pending";
                  const currentIndex = STATUS_FLOW.indexOf(current as (typeof STATUS_FLOW)[number]);
                  const stepIndex = index;
                  const isDone = stepIndex < currentIndex;
                  const isActive = stepIndex === currentIndex;
                  const isUpcoming = stepIndex > currentIndex;
                  return (
                    <div key={step} className="flex gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                            isDone
                              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                              : isActive
                                ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg"
                                : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isDone ? "✓" : index + 1}
                        </div>
                        {index < STATUS_FLOW.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 min-h-[32px] transition-colors ${
                              isDone ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className={`pt-1 ${index === STATUS_FLOW.length - 1 ? "pb-0" : "pb-6"}`}>
                        <p
                          className={`font-semibold ${
                            isActive ? "text-blue-600" : isDone ? "text-emerald-700" : "text-slate-400"
                          }`}
                        >
                          {step}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isDone && "Completed"}
                          {isActive && "Current step"}
                          {isUpcoming && "Upcoming"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  valueColor = "text-blue-600",
  icon,
  accent = "blue",
}: {
  title: string;
  value: string | number;
  valueColor?: string;
  icon?: string;
  accent?: "blue" | "green" | "amber" | "violet";
}) {
  const accentBorder = {
    blue: "border-l-blue-500",
    green: "border-l-emerald-500",
    amber: "border-l-amber-500",
    violet: "border-l-violet-500",
  }[accent];
  return (
    <div
      className={`bg-white/90 backdrop-blur rounded-2xl border border-slate-200/80 shadow-lg p-6 border-l-4 ${accentBorder} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${valueColor}`}>{value}</p>
        </div>
        {icon && (
          <span className="text-2xl opacity-80" aria-hidden>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

function CategoryCard({
  name,
  count,
}: {
  name: string;
  count: string | number;
}) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200/80 shadow-lg p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white">
      <p className="text-slate-600 text-sm font-medium">{name}</p>
      <p className="text-2xl font-bold text-blue-600 mt-2">{count}</p>
    </div>
  );
}
