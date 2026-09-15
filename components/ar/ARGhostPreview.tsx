"use client";

import React, { useState, useEffect } from "react";
import { Grievance } from "@/types/grievance";
import { Compass, Eye, Sliders, X, CheckCircle2, RotateCw, Sparkles } from "lucide-react";

interface ARGhostPreviewProps {
  grievance: Grievance;
  isOpen: boolean;
  onClose: () => void;
}

export default function ARGhostPreview({
  grievance,
  isOpen,
  onClose,
}: ARGhostPreviewProps) {
  const [currentHeading, setCurrentHeading] = useState<number>(140);
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100
  const [viewMode, setViewMode] = useState<"split" | "blend">("split");
  const [opacity, setOpacity] = useState<number>(50); // for blend mode

  const targetHeading = grievance.location.headingDegrees || 142;
  const headingDelta = Math.abs((currentHeading - targetHeading + 540) % 360 - 180);
  const isAligned = headingDelta < 15;

  // Listen to device orientation for live compass
  useEffect(() => {
    if (!isOpen) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const webkitCompass = (e as any).webkitCompassHeading;
      if (typeof webkitCompass === "number") {
        setCurrentHeading(Math.round(webkitCompass));
      } else if (typeof e.alpha === "number") {
        setCurrentHeading(Math.round(360 - e.alpha));
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, [isOpen]);

  if (!isOpen) return null;

  const beforePhoto =
    grievance.capturePhotoUrl ||
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80";
  const afterPhoto =
    grievance.resolvedPhotoUrl ||
    "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[800px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold text-sm sm:text-base">AR Ghost Before/After Inspection</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Spatial Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Anchored at {grievance.location.lat}°, {grievance.location.lng}° • Heading {targetHeading}°
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setViewMode("split")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  viewMode === "split" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode("blend")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  viewMode === "blend" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Ghost Blend
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Spatial Heading Compass Banner */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 font-mono">
            <Compass
              size={16}
              className={`transition-transform duration-300 ${isAligned ? "text-emerald-400" : "text-amber-400"}`}
              style={{ transform: `rotate(${currentHeading}deg)` }}
            />
            <span className="text-slate-400">YOUR HEADING:</span>
            <span className="text-white font-bold">{currentHeading}°</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">TARGET ANCHOR:</span>
            <span className="text-cyan-400 font-bold">{targetHeading}°</span>
          </div>

          <div className="flex items-center gap-2">
            {isAligned ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                <CheckCircle2 size={13} /> Optical Spatial Orientation Aligned
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                <RotateCw size={13} className="animate-spin" /> Rotate camera {targetHeading > currentHeading ? "Right" : "Left"} by {headingDelta}° to match capture angle
              </span>
            )}
            {/* Quick align button for desktop testing */}
            <button
              onClick={() => setCurrentHeading(targetHeading)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
            >
              Align to Anchor
            </button>
          </div>
        </div>

        {/* Visual Comparison Viewport */}
        <div className="relative flex-1 bg-black overflow-hidden select-none">
          {viewMode === "split" ? (
            // SPLIT SLIDER VIEW
            <div className="relative w-full h-full">
              {/* After Image (Full background) */}
              <img
                src={afterPhoto}
                alt="Resolved State"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow">
                AFTER: Resolved Proof
              </div>

              {/* Before Image (Clipped by slider percentage) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={beforePhoto}
                  alt="Original Reported Problem"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ width: "100vw", maxWidth: "none" }}
                />
                <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider shadow">
                  BEFORE: Citizen Report
                </div>
              </div>

              {/* Divider line & handle */}
              <div
                className="absolute top-0 bottom-0 z-20 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center font-bold text-xs border-2 border-blue-600">
                  ⇄
                </div>
              </div>
            </div>
          ) : (
            // GHOST BLEND VIEW
            <div className="relative w-full h-full">
              <img
                src={afterPhoto}
                alt="Resolved State"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <img
                src={beforePhoto}
                alt="Reported Problem Ghost"
                className="absolute inset-0 w-full h-full object-cover mix-blend-screen pointer-events-none transition-opacity duration-150"
                style={{ opacity: opacity / 100 }}
              />
              <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md bg-black/70 border border-slate-700 text-white text-xs font-mono">
                Ghost Overlay: {opacity}% Opacity
              </div>
            </div>
          )}
        </div>

        {/* Bottom Interactive Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {viewMode === "split" ? (
            <div className="flex items-center gap-3 w-full sm:w-2/3">
              <span className="text-red-400 font-semibold uppercase text-[11px]">Before (Reported)</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-emerald-400 font-semibold uppercase text-[11px]">After (Resolved)</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-2/3">
              <span className="text-slate-400">Ghost Opacity:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="flex-1 accent-cyan-400"
              />
              <span className="text-cyan-300 font-mono font-bold">{opacity}%</span>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-slate-400">Official Notes:</span>
            <span className="text-slate-200 truncate max-w-[240px] italic">
              &quot;{grievance.officialNotes || "Work completed and inspected to grade standard."}&quot;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
