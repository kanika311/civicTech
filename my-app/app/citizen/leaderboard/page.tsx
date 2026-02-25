"use client";

import { useState, useEffect } from "react";
import Navbar from "../../component/Navbar";
import { citizenApi, type LeaderboardEntry } from "@/lib/api";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold text-lg" title="1st">
        🥇
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-600 font-bold text-lg" title="2nd">
        🥈
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-700/20 text-amber-800 font-bold text-lg" title="3rd">
        🥉
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold">
      #{rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const [list, setList] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    citizenApi
      .getLeaderboard()
      .then((res) => {
        if (res.ok) setList(res.data);
        else setError(res.error);
      })
      .catch(() => setError("Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Citizen Leaderboard
          </h1>
          <p className="text-slate-600">
            Ranked by <strong>resolved complaints</strong>. More resolved = higher rank. Ties broken by total complaints.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
            {error}
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
            No leaderboard data yet. Resolve some complaints to appear here.
          </div>
        )}

        {!loading && !error && list.length > 0 && (
          <div className="space-y-3">
            {list.map((entry, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              return (
                <div
                  key={entry._id ?? index}
                  className={`flex items-center gap-4 rounded-xl border transition shadow-sm ${
                    isTopThree
                      ? "bg-white border-amber-200/60 shadow-md"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  } ${rank === 1 ? "ring-2 ring-amber-200/80" : ""}`}
                >
                  <div className="flex-shrink-0 pl-4 py-3">
                    <RankBadge rank={rank} />
                  </div>
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                        rank === 1
                          ? "bg-amber-100 text-amber-800"
                          : rank === 2
                            ? "bg-slate-200 text-slate-700"
                            : rank === 3
                              ? "bg-amber-700/20 text-amber-800"
                              : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {getInitials(entry.name)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-3 pr-2">
                    <p className="font-semibold text-slate-800 truncate">
                      {entry.name}
                    </p>
                    {entry.totalComplaints != null && (
                      <p className="text-sm text-slate-500">
                        {entry.totalComplaints} total · {entry.totalResolved} resolved
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 pr-4 py-3 text-right">
                    <span className="inline-block bg-green-100 text-green-800 font-bold px-3 py-1 rounded-lg">
                      {entry.totalResolved}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">resolved</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-sm text-slate-500 mt-8">
          Rank = most resolved complaints first. Ties broken by total complaints submitted.
        </p>
      </div>
    </div>
  );
}
