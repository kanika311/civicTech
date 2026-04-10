"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "../../component/Navbar";
import { citizenApi, type ComplaintItem } from "@/lib/api";
import { geocodeWithFallback } from "@/lib/geocode";
import type { PinnedComplaint } from "./ComplaintMap";

const ComplaintMap = dynamic(
  () => import("./ComplaintMap").then((m) => m.default),
  { ssr: false, loading: () => <div className="w-full h-[400px] bg-gray-200 animate-pulse rounded-xl flex items-center justify-center text-gray-500">Loading map...</div> }
);

export default function MapPage() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [pins, setPins] = useState<PinnedComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    citizenApi
      .getComplaints()
      .then((res) => {
        if (res.ok) setComplaints(res.data);
        else setError(res.error);
      })
      .catch(() => setError("Failed to load complaints"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (complaints.length === 0) {
      setPins([]);
      return;
    }
    const withLocation = complaints.filter((c) => c.location && c.location.trim());
    if (withLocation.length === 0) {
      setPins([]);
      return;
    }
    let cancelled = false;
    setGeocoding(true);
    const run = async () => {
      const next: PinnedComplaint[] = [];
      for (let i = 0; i < withLocation.length; i++) {
        if (cancelled) return;
        const complaint = withLocation[i];
        const coords = await geocodeWithFallback(complaint.location!, i);
        next.push({ complaint, lat: coords.lat, lng: coords.lng });
        await new Promise((r) => setTimeout(r, 1100));
      }
      if (!cancelled) setPins(next);
      setGeocoding(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [complaints]);

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const active = complaints.filter(
    (c) => c.status === "Pending" || c.status === "In Progress"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Complaint Map</h1>
          <p className="text-gray-600">
            Pins show where your complaints were reported. Click a pin for details.
          </p>
        </div>

        {loading && <p className="text-gray-500">Loading complaints...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-gray-500 text-sm">Your Reports</p>
                <p className="text-2xl font-bold text-blue-600">{total}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-gray-500 text-sm">Active Issues</p>
                <p className="text-2xl font-bold text-orange-500">{active}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-gray-500 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{resolved}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-semibold text-lg">Complaint locations</h2>
                {geocoding && (
                  <span className="text-sm text-amber-600">
                    Geocoding locations… (1 per second)
                  </span>
                )}
                {!geocoding && complaints.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {pins.length} of {complaints.filter((c) => c.location?.trim()).length} pinned
                  </span>
                )}
              </div>
              <div className="w-full h-[400px] relative">
                <ComplaintMap key={pins.length === 0 ? "no-pins" : "has-pins"} pins={pins} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="font-semibold text-lg mb-4">Your reported locations</h2>
              {complaints.length === 0 ? (
                <p className="text-gray-500">No complaints yet. Submit one to see it on the map.</p>
              ) : (
                <ul className="space-y-2">
                  {complaints.map((c) => (
                    <li
                      key={c._id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <span className="font-medium">{c.title || "Untitled"}</span>
                      <span className="text-gray-600 text-sm">{c.location || "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
