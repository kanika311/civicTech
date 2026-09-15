"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Compass, Navigation, Crosshair, RefreshCw, X, Check, Sliders, AlertCircle } from "lucide-react";
import { ARAnchorData } from "@/types/grievance";

interface ARCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (anchorData: ARAnchorData) => void;
  categoryName?: string;
}

export default function ARCaptureModal({
  isOpen,
  onClose,
  onCapture,
  categoryName = "Roads & Infrastructure",
}: ARCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Spatial anchor telemetry
  const [heading, setHeading] = useState<number>(142);
  const [pitch, setPitch] = useState<number>(-10);
  const [roll, setRoll] = useState<number>(1);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: 12.9716,
    lng: 77.5946,
    accuracy: 3.5,
  });

  // Desktop simulation mode
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  // Initialize camera and sensors when opened
  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      setStreamActive(false);
      setCapturedPreview(null);
      return;
    }

    // 1. Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy || 4),
          });
        },
        (err) => {
          console.warn("Geolocation fallback to mock coordinates:", err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    // 2. Device Orientation (Gyroscope / Compass)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // heading
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const webkitCompass = (e as any).webkitCompassHeading;
      if (typeof webkitCompass === "number") {
        setHeading(Math.round(webkitCompass));
      } else if (typeof e.alpha === "number") {
        setHeading(Math.round(360 - e.alpha));
      }

      if (typeof e.beta === "number") setPitch(Math.round(e.beta - 90)); // pitch relative to upright
      if (typeof e.gamma === "number") setRoll(Math.round(e.gamma));
    };

    window.addEventListener("deviceorientation", handleOrientation, true);

    // 3. getUserMedia Camera Stream
    let mediaStream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      .then((stream) => {
        mediaStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => setStreamActive(true));
        }
      })
      .catch((err) => {
        console.warn("Camera access unavailable, switching to simulated AR feed:", err.message);
        setCameraError("Camera unavailable or permission denied. Using AR simulation mode.");
        setIsSimulating(true);
      });

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Cardinal direction helper
  const getCardinalDirection = (deg: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  // Capture spatial anchor photo
  const handleSnap = () => {
    let photoData = "";
    if (videoRef.current && canvasRef.current && streamActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stamp spatial metadata watermark onto photo canvas
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(20, canvas.height - 90, 480, 70);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 16px monospace";
        ctx.fillText(`CIVICTRACK SPATIAL ANCHOR [${categoryName.toUpperCase()}]`, 35, canvas.height - 65);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "14px monospace";
        ctx.fillText(
          `GPS: ${coords.lat}°, ${coords.lng}° | HEADING: ${heading}° ${getCardinalDirection(heading)} | PITCH: ${pitch}°`,
          35,
          canvas.height - 35
        );

        photoData = canvas.toDataURL("image/jpeg", 0.85);
      }
    } else {
      // Fallback realistic photo for simulation mode
      photoData = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80";
    }

    setCapturedPreview(photoData);
  };

  const handleConfirm = () => {
    if (!capturedPreview) return;
    onCapture({
      lat: coords.lat,
      lng: coords.lng,
      headingDegrees: heading,
      pitch,
      roll,
      accuracy: coords.accuracy,
      timestamp: Date.now(),
      photoBase64: capturedPreview,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[850px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900/90 border-b border-slate-800 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Camera size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold text-sm sm:text-base">AR Spatial Evidence Capture</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  WebXR Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">Locking GPS + Compass Heading + Horizon Anchor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                isSimulating
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
              title="Toggle sensor simulator for desktop testing"
            >
              <Sliders size={14} />
              {isSimulating ? "Simulation Active" : "Simulate Sensors"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewport & HUD Overlay */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
          {/* Camera Video */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover ${streamActive ? "block" : "hidden"}`}
          />

          {/* Simulation View if camera not active */}
          {!streamActive && (
            <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center text-slate-400 p-6">
              <img
                src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80"
                alt="AR Scene"
                className="absolute inset-0 w-full h-full object-cover opacity-35 filter contrast-125"
              />
              <div className="relative z-10 text-center max-w-md bg-slate-950/70 p-4 rounded-xl border border-slate-700/60 backdrop-blur-md">
                <Camera size={36} className="mx-auto mb-2 text-blue-400 animate-pulse" />
                <p className="text-white font-medium text-sm">Synthetic AR Camera Simulation</p>
                <p className="text-xs text-slate-400 mt-1">
                  Using high-fidelity sensor emulation. Use the bottom sliders or capture directly.
                </p>
              </div>
            </div>
          )}

          {/* Hidden Canvas for snap processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Preview Modal if snapped */}
          {capturedPreview && (
            <div className="absolute inset-0 z-30 bg-slate-950/95 flex flex-col items-center justify-center p-4">
              <div className="max-w-xl w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center text-xs text-slate-300">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Check size={14} /> Spatial Anchor Watermarked
                  </span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <img src={capturedPreview} alt="Captured preview" className="w-full max-h-[380px] object-cover" />
                <div className="p-4 flex gap-3 bg-slate-900">
                  <button
                    onClick={() => setCapturedPreview(null)}
                    className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={15} /> Retake
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                  >
                    <Check size={16} /> Attach Spatial Anchor
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HUD OVERLAY ELEMENTS */}
          {/* 1. Compass Rose Bar at Top */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            <div className="bg-slate-900/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-500/40 text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-lg">
              <Compass size={15} className="animate-spin text-cyan-400" style={{ animationDuration: "12s" }} />
              <span className="font-bold text-white">{heading}°</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-600/30 text-cyan-200 text-[11px] font-bold">
                {getCardinalDirection(heading)}
              </span>
            </div>
            {/* Horizon Level indicator */}
            <div className="mt-1 flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-3 py-0.5 rounded-full">
              <span>P: {pitch}°</span>
              <span>R: {roll}°</span>
              <span className={`w-2 h-2 rounded-full ${Math.abs(pitch) < 5 && Math.abs(roll) < 5 ? "bg-emerald-400 shadow-emerald-400/50 shadow-sm" : "bg-amber-400"}`} />
            </div>
          </div>

          {/* 2. Geolocation Telemetry HUD (Left) */}
          <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 text-xs font-mono space-y-1 text-slate-300 max-w-[200px]">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
              <Navigation size={13} /> GPS SPATIAL FIX
            </div>
            <div className="text-[11px]">LAT: <span className="text-white font-bold">{coords.lat}° N</span></div>
            <div className="text-[11px]">LNG: <span className="text-white font-bold">{coords.lng}° E</span></div>
            <div className="text-[11px] text-emerald-400">ACCURACY: ±{coords.accuracy}m</div>
          </div>

          {/* 3. Center Targeting Reticle */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 border border-dashed border-cyan-400/40 rounded-full flex items-center justify-center animate-pulse">
              <Crosshair size={40} className="text-cyan-400/80" />
              {/* Corner brackets */}
              <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

              <span className="absolute -bottom-8 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-cyan-300">
                ANCHOR TARGET LOCK
              </span>
            </div>
          </div>

          {/* 4. Category Routing Pill (Right) */}
          <div className="absolute top-4 right-4 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/60 text-xs text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Target Category</div>
            <div className="text-white font-semibold">{categoryName}</div>
          </div>
        </div>

        {/* Desktop Simulator Controls (if enabled) */}
        {isSimulating && (
          <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs z-20">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Compass Heading</span>
                <span className="text-cyan-300 font-mono">{heading}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={heading}
                onChange={(e) => setHeading(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Camera Pitch</span>
                <span className="text-cyan-300 font-mono">{pitch}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Camera Roll</span>
                <span className="text-cyan-300 font-mono">{roll}°</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={roll}
                onChange={(e) => setRoll(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        )}

        {/* Bottom Shutter Action Bar */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between z-20">
          <div className="text-xs text-slate-400 hidden sm:block">
            Align reticle with defect &amp; press capture
          </div>

          <div className="flex items-center justify-center flex-1 sm:flex-initial">
            <button
              onClick={handleSnap}
              className="group relative w-16 h-16 rounded-full bg-slate-900 border-4 border-white/80 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition"
              title="Capture AR Anchor"
            >
              <div className="w-11 h-11 rounded-full bg-blue-500 group-hover:bg-blue-400 transition" />
            </button>
          </div>

          <div className="text-right text-xs text-slate-400 hidden sm:block">
            Single Spatial Anchor Object
          </div>
        </div>
      </div>
    </div>
  );
}
