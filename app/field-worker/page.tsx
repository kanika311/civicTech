"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../component/Navbar";
import { Grievance } from "@/types/grievance";
import { civicApi } from "@/lib/civicApi";
import {
  HardHat,
  Compass,
  Navigation,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  Upload,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function FieldWorkerPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeAssistGrievance, setActiveAssistGrievance] = useState<Grievance | null>(null);

  // Field assist live orientation & distance
  const [currentHeading, setCurrentHeading] = useState<number>(120);
  const [resolutionProofUrl, setResolutionProofUrl] = useState<string>(
    "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80"
  );
  const [officialNotes, setOfficialNotes] = useState<string>("Repairs executed to standard specification.");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const workerDepartment = "Public Works Department";

  const loadData = () => {
    civicApi.getGrievances({ department: workerDepartment })
      .then((res) => {
        setGrievances(res);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Device orientation listener for field assist radar
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const compass = (e as any).webkitCompassHeading;
      if (typeof compass === "number") setCurrentHeading(Math.round(compass));
      else if (typeof e.alpha === "number") setCurrentHeading(Math.round(360 - e.alpha));
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, []);

  const handleMarkResolved = async (gId: string) => {
    setIsUpdating(true);
    try {
      await civicApi.updateGrievance(gId, {
        status: "resolved",
        resolvedPhotoUrl: resolutionProofUrl,
        officialNotes,
      });
      setUpdateSuccess("Grievance marked as resolved with on-site resolution proof photo!");
      setTimeout(() => {
        setUpdateSuccess(null);
        setActiveAssistGrievance(null);
        loadData();
      }, 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper distance calculation (Haversine formula approximation)
  const calculateDistance = (targetLat: number, targetLng: number) => {
    const currentLat = 12.9716;
    const currentLng = 77.5946;
    const dLat = (targetLat - currentLat) * 111000;
    const dLng = (targetLng - currentLng) * 111000 * Math.cos(currentLat * (Math.PI / 180));
    const dist = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
    return dist < 10 ? 12 : dist; // meters
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <HardHat size={12} /> Field Worker Portal
              </span>
              <span className="text-xs text-slate-400">
                Logged in as: <strong>Ramesh Kumar (Junior Engineer)</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Assigned Queue: {workerDepartment}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              AR Field-Assist navigation, on-site ghost overlay alignment, and resolution proof upload.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Assigned Ward</span>
            <span className="text-base font-bold text-cyan-300 font-mono">Ward 12 (Central Zone)</span>
          </div>
        </div>

        {/* Success Alert */}
        {updateSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{updateSuccess}</span>
          </div>
        )}

        {/* Content Split: List & AR Field-Assist View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Assigned Queue */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Active Department Tickets ({grievances.length})
            </h2>

            {loading ? (
              <div className="py-16 text-center text-slate-500">Loading queue...</div>
            ) : grievances.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                No active complaints assigned to your crew.
              </div>
            ) : (
              grievances.map((g) => {
                const isSelected = activeAssistGrievance?._id === g._id;
                const dist = calculateDistance(g.location.lat, g.location.lng);

                return (
                  <div
                    key={g._id}
                    onClick={() => setActiveAssistGrievance(g)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? "bg-slate-900 border-cyan-500 ring-1 ring-cyan-500/30"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[11px] font-mono text-cyan-400 uppercase">
                          {g.category} • {g.subcategory}
                        </span>
                        <h4 className="text-white font-bold text-sm">{g.location.address}</h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          g.status === "resolved"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : g.status === "escalated"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {g.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-3">{g.description}</p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80 text-slate-400">
                      <div className="flex items-center gap-1 font-mono text-cyan-300">
                        <Navigation size={13} /> Distance: ~{dist}m away
                      </div>
                      <button
                        type="button"
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                      >
                        Launch AR Field-Assist <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: AR Field-Assist HUD */}
          <div className="lg:col-span-6">
            {activeAssistGrievance ? (
              <div className="bg-slate-900 rounded-2xl border border-cyan-500/40 p-5 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Navigation size={18} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">AR Field-Assist Viewport</h3>
                      <p className="text-xs text-slate-400">On-site GPS heading &amp; ghost overlay alignment</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    TARGET: {activeAssistGrievance.location.headingDegrees || 142}°
                  </span>
                </div>

                {/* Simulated AR Camera Viewport with Ghost Overlay */}
                <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden bg-black border border-slate-700">
                  {/* Background camera live feed */}
                  <img
                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80"
                    alt="Live Field Camera"
                    className="w-full h-full object-cover filter contrast-125"
                  />

                  {/* Ghosted Overlay of original citizen complaint photo */}
                  {activeAssistGrievance.capturePhotoUrl && (
                    <img
                      src={activeAssistGrievance.capturePhotoUrl}
                      alt="Ghosted Original Report"
                      className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen pointer-events-none"
                    />
                  )}

                  {/* HUD Compass Radar Overlay */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/40 text-xs font-mono text-cyan-300 space-y-0.5">
                    <div>BEARING: {activeAssistGrievance.location.headingDegrees || 142}° SE</div>
                    <div>EST. DISTANCE: ~12m</div>
                  </div>

                  {/* On-Site ghost alignment guide */}
                  <div className="absolute bottom-3 inset-x-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-lg border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Sparkles size={14} /> Ghost Overlay Aligned to Coordinate
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      GPS: {activeAssistGrievance.location.lat}°, {activeAssistGrievance.location.lng}°
                    </span>
                  </div>
                </div>

                {/* Resolution Verification Controls */}
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Submit On-Site Resolution Proof
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400">Official Work Report Notes</label>
                    <input
                      type="text"
                      value={officialNotes}
                      onChange={(e) => setOfficialNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400">Resolution Proof Photo URL / Camera Snapshot</label>
                    <input
                      type="text"
                      value={resolutionProofUrl}
                      onChange={(e) => setResolutionProofUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isUpdating || activeAssistGrievance.status === "resolved"}
                    onClick={() => handleMarkResolved(activeAssistGrievance._id)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    {activeAssistGrievance.status === "resolved"
                      ? "Already Marked Resolved"
                      : isUpdating
                      ? "Confirming On-Site Fix..."
                      : "Confirm On-Site Fix & Mark Resolved"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
                <Navigation size={40} className="text-slate-600 animate-pulse" />
                <h3 className="text-white font-bold text-sm">No Grievance Selected</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Select an assigned ticket from the queue on the left to launch the AR Field-Assist heading radar and ghost overlay.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
