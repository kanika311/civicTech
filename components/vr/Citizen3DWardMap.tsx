"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Grievance } from "@/types/grievance";
import {
  X,
  Compass,
  RotateCcw,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Eye,
} from "lucide-react";

interface Citizen3DWardMapProps {
  grievances: Grievance[];
  isOpen: boolean;
  onClose: () => void;
  onSelectGrievance?: (g: Grievance) => void;
}

export default function Citizen3DWardMap({
  grievances,
  isOpen,
  onClose,
  onSelectGrievance,
}: Citizen3DWardMapProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [arLensMode, setArLensMode] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = arLensMode ? null : new THREE.Color(0x0f172a);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 26);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 5. Ward 3D Terrain Platform
    const platformGeo = new THREE.CylinderGeometry(14, 15, 0.8, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.2,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.4;
    scene.add(platform);

    // Grid on top
    const grid = new THREE.GridHelper(26, 13, 0x334155, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // Ward Center Beacon
    const hubGeo = new THREE.CylinderGeometry(1.2, 1.5, 0.3, 16);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.4,
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.set(0, 0.15, 0);
    scene.add(hub);

    // 6. Grievance 3D Pins
    const pinMeshes: { mesh: THREE.Group; grievance: Grievance }[] = [];

    grievances.forEach((g, idx) => {
      const pinGroup = new THREE.Group();

      // Distribute pins across the ward platform
      const angle = (idx / Math.max(1, grievances.length)) * Math.PI * 2;
      const radius = 3 + (idx % 3) * 3.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Determine color by status
      let pinColor = 0x3b82f6; // Blue (submitted / in_progress)
      if (g.status === "resolved") pinColor = 0x10b981; // Green
      if (g.status === "escalated" || g.escalationLevel !== "ward") pinColor = 0xef4444; // Red

      // Pin stem
      const stemGeo = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 1;
      pinGroup.add(stem);

      // Pin head sphere
      const headGeo = new THREE.SphereGeometry(0.55, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({
        color: pinColor,
        emissive: pinColor,
        emissiveIntensity: 0.4,
        roughness: 0.2,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 2;
      pinGroup.add(head);

      // Floating ring for escalated
      if (g.status === "escalated") {
        const ringGeo = new THREE.TorusGeometry(0.7, 0.05, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 2;
        pinGroup.add(ring);
      }

      pinGroup.position.set(x, 0, z);
      scene.add(pinGroup);
      pinMeshes.push({ mesh: pinGroup, grievance: g });
    });

    // 7. Raycasting for Pin Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      for (const item of pinMeshes) {
        const intersects = raycaster.intersectObjects(item.mesh.children, true);
        if (intersects.length > 0) {
          setSelectedGrievance(item.grievance);
          break;
        }
      }
    };

    renderer.domElement.addEventListener("click", onPointerDown);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slowly rotate platform when idle
      platform.rotation.y = elapsedTime * 0.08;
      grid.rotation.y = elapsedTime * 0.08;

      // Pulse pin heads
      pinMeshes.forEach((item, i) => {
        const head = item.mesh.children[1];
        if (head) {
          head.position.y = 2 + Math.sin(elapsedTime * 2 + i) * 0.15;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", onPointerDown);
      renderer.dispose();
      if (container) container.innerHTML = "";
    };
  }, [isOpen, grievances, arLensMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-opacity">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Compass size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  3D Citizen Ward Digital Twin
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Ward 12 Spatial Map
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive spatial visualization of community reports and live resolution states.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setArLensMode(!arLensMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                arLensMode
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>{arLensMode ? "AR View (Active)" : "Toggle AR Overlay"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="relative flex-1 min-h-[380px] bg-slate-950 overflow-hidden">
          {arLensMode && (
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80"
                alt="AR City Camera Background"
                className="w-full h-full object-cover opacity-35"
              />
              <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-black/70 border border-purple-500/50 text-[11px] font-mono text-purple-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                AR SPATIAL ANCHOR: LAT 12.9716° N • LNG 77.5946° E
              </div>
            </div>
          )}

          <div ref={mountRef} className="w-full h-full relative z-10 cursor-grab active:cursor-grabbing" />

          {/* Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-20 p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] space-y-1">
            <div className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider">
              Ward Pin Status Legend
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> In Progress
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved (AR Verified)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> SLA Breached
              </span>
            </div>
          </div>

          {/* Selected Grievance Drawer */}
          {selectedGrievance && (
            <div className="absolute top-3 right-3 z-20 w-80 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-lg border border-slate-700 shadow-xl space-y-2.5 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                  {selectedGrievance.department}
                </span>
                <button
                  onClick={() => setSelectedGrievance(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <h4 className="font-bold text-white text-sm leading-snug">
                {selectedGrievance.subcategory}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-2">
                {selectedGrievance.description}
              </p>

              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1 text-slate-200">
                  <MapPin size={12} className="text-rose-400" />
                  <span className="truncate">{selectedGrievance.location.address}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span>BEARING: {selectedGrievance.location.headingDegrees || 140}°</span>
                  <span className="uppercase text-amber-400">STATUS: {selectedGrievance.status}</span>
                </div>
              </div>

              {selectedGrievance.capturePhotoUrl && (
                <div className="rounded-xl overflow-hidden h-28 border border-slate-800">
                  <img
                    src={selectedGrievance.capturePhotoUrl}
                    alt="Grievance Evidence"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Click any 3D pin to inspect community report telemetry.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
          >
            Close 3D View
          </button>
        </div>
      </div>
    </div>
  );
}
