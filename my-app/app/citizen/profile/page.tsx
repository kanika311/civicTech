"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../component/Navbar";
import {
  authApi,
  citizenApi,
  type ProfileResponse,
  type ComplaintItem,
  type DashboardData,
  type LeaderboardEntry,
} from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/authSlice";

const STATUS_FLOW = ["Pending", "Approved", "In Progress", "Resolved"] as const;

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingComplaint, setTrackingComplaint] = useState<ComplaintItem | null>(null);

  useEffect(() => {
    Promise.all([
      authApi.getProfile(),
      citizenApi.getDashboard(),
      citizenApi.getComplaints(),
      citizenApi.getLeaderboard(),
    ])
      .then(([profileRes, dashboardRes, complaintsRes, leaderboardRes]) => {
        if (profileRes.ok) setProfile(profileRes.data);
        else setError(profileRes.error);
        if (dashboardRes.ok) setDashboard(dashboardRes.data);
        if (complaintsRes.ok) setComplaints(complaintsRes.data);
        if (leaderboardRes.ok) setLeaderboard(leaderboardRes.data);
      })
      .catch(() => setError("Failed to load profile"))
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

  const rank = useMemo(() => {
    if (!profile?._id || leaderboard.length === 0) return null;
    const idx = leaderboard.findIndex((e) => e._id === profile._id);
    return idx === -1 ? null : idx + 1;
  }, [profile?._id, leaderboard]);

  const handleLogout = async () => {
    await authApi.logout();
    if (typeof window !== "undefined") window.localStorage.removeItem("token");
    dispatch(logout());
    router.push("/login");
  };

  const formatDate = (createdAt?: string) => {
    if (!createdAt) return "—";
    return new Date(createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusStyle = (status: string) => {
    if (status === "Resolved") return "bg-green-100 text-green-600";
    if (status === "Approved") return "bg-blue-100 text-blue-600";
    if (status === "In Progress") return "bg-indigo-100 text-indigo-600";
    if (status === "Pending") return "bg-yellow-100 text-yellow-600";
    return "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <p className="text-red-500">{error || "Profile not found"}</p>
        </div>
      </>
    );
  }

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const total = dashboard?.totalComplaints ?? 0;
  const resolved = dashboard?.resolved ?? 0;
  const inProgress = dashboard?.inProgress ?? 0;
  const points = dashboard?.points ?? 0;

  return (
    <>
      <Navbar />

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 mb-8">
            Manage your account and track your contributions.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl">
                  👤
                </div>
                <h2 className="mt-4 text-xl font-semibold">{profile.name}</h2>
                <span className="mt-1 text-sm bg-gray-200 px-3 py-1 rounded-full">
                  Citizen
                </span>
              </div>

              <div className="mt-6 space-y-3 text-gray-600 text-sm">
                <p>📧 {profile.email}</p>
                {profile.phone && <p>📞 {profile.phone}</p>}
                {profile.address && <p>📍 {profile.address}</p>}
                <p>📅 Member since {memberSince}</p>
              </div>

              <div className="border-t mt-6 pt-4 flex justify-between">
                <div>
                  <p className="text-blue-600 text-xl font-bold">
                    {rank != null ? `#${rank}` : "—"}
                  </p>
                  <p className="text-sm text-gray-500">Rank</p>
                </div>
                <div>
                  <p className="text-blue-600 text-xl font-bold">{points}</p>
                  <p className="text-sm text-gray-500">Points</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50"
              >
                Logout
              </button>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <StatCard title="Total Complaints" value={String(total)} />
                <StatCard title="Resolved" value={String(resolved)} />
                <StatCard title="In Progress" value={String(inProgress)} />
                <StatCard title="Total Points" value={String(points)} />
              </div>

              {categoryCounts.length > 0 && (
                <div className="grid sm:grid-cols-3 gap-6">
                  {categoryCounts.slice(0, 6).map(([name, count]) => (
                    <SmallCard key={name} title={name} value={String(count)} />
                  ))}
                </div>
              )}

              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Complaints</h2>
                <p className="text-sm text-gray-500 mb-4">Click on a status to see full tracking.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2">Issue</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-gray-500">
                            No complaints yet.
                          </td>
                        </tr>
                      ) : (
                        complaints.map((c) => (
                          <Row
                            key={c._id}
                            issue={c.title || "—"}
                            category={c.category || "—"}
                            status={c.status || "Pending"}
                            date={formatDate(c.createdAt)}
                            location={c.location || "—"}
                            onStatusClick={() => setTrackingComplaint(c)}
                            statusStyle={statusStyle}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {trackingComplaint && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                  onClick={() => setTrackingComplaint(null)}
                >
                  <div
                    className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Complaint status</h3>
                      <button
                        type="button"
                        onClick={() => setTrackingComplaint(null)}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm mb-6">{trackingComplaint.title || "Complaint"}</p>
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
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                  isDone
                                    ? "bg-green-500 text-white"
                                    : isActive
                                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                                      : "bg-gray-200 text-gray-500"
                                }`}
                              >
                                {isDone ? "✓" : index + 1}
                              </div>
                              {index < STATUS_FLOW.length - 1 && (
                                <div
                                  className={`w-0.5 flex-1 min-h-[32px] ${isDone ? "bg-green-500" : "bg-gray-200"}`}
                                />
                              )}
                            </div>
                            <div className={`pt-1 ${index === STATUS_FLOW.length - 1 ? "pb-0" : "pb-6"}`}>
                              <p
                                className={`font-medium ${
                                  isActive ? "text-blue-600" : isDone ? "text-green-700" : "text-gray-400"
                                }`}
                              >
                                {step}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
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
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  );
}

function SmallCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500 text-sm truncate" title={title}>{title}</p>
      <h3 className="text-xl font-semibold mt-2">{value}</h3>
    </div>
  );
}

function Row({
  issue,
  category,
  status,
  date,
  location,
  onStatusClick,
  statusStyle,
}: {
  issue: string;
  category: string;
  status: string;
  date: string;
  location: string;
  onStatusClick?: () => void;
  statusStyle: (s: string) => string;
}) {
  return (
    <tr className="border-b">
      <td className="py-3">{issue}</td>
      <td>{category}</td>
      <td>
        <button
          type="button"
          onClick={onStatusClick}
          className={`px-2 py-1 rounded-full text-xs cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 ${statusStyle(status)}`}
        >
          {status}
        </button>
      </td>
      <td>{date}</td>
      <td>{location}</td>
    </tr>
  );
}
