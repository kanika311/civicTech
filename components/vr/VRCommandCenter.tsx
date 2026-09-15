"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Grievance } from "@/types/grievance";
import { Layers, Eye, Users, CheckCircle2, RotateCcw, Box, Compass, Sparkles, Filter } from "lucide-react";

interface VRCommandCenterProps {
  grievances: Grievance[];
  onBatchAssign?: (ids: string[], workerName: string) => void;
}

// Department Color Map for 3D Columns
const DEPT_COLORS: Record<string, number> = {
  "Municipal Corporation": 0x10b981, // Emerald
  "Public Works Department": 0x3b82f6, // Blue
  "Water Board / Electricity Board": 0x06b6d4, // Cyan
  "Health Department": 0xec4899, // Pink
  "Education Department": 0x8b5cf6, // Purple
  "Police / Traffic Department": 0xf59e0b, // Amber
  "Revenue Department": 0xeab308, // Yellow
  "Social Welfare Department": 0x6366f1, // Indigo
  "Pollution Control Board / Disaster Management": 0x14b8a6, // Teal
  "Anti-Corruption Bureau": 0xef4444, // Red
};

interface ClusterData {
  id: string;
  ward: string;
  x: number;
  z: number;
  department: string;
  count: number;
  grievanceIds: string[];
  highestEscalation: string;
}

export default function VRCommandCenter({
  grievances,
  onBatchAssign,
}: VRCommandCenterProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<ClusterData | null>(null);
  const [activeDepartment, setActiveDepartment] = useState<string>("ALL");
  const [assigneeName, setAssigneeName] = useState<string>("Rapid Response Crew #3");
  const [batchSuccess, setBatchSuccess] = useState<string | null>(null);
  const [isVRActive, setIsVRActive] = useState<boolean>(false);

  // Group grievances by ward & department for 3D heatmap clusters
  const clusters: ClusterData[] = React.useMemo(() => {
    const map: Record<string, ClusterData> = {};

    // Mock ward center coordinates on a 3D grid
    const wardPositions: Record<string, [number, number]> = {
      "Ward 8": [-14, -8],
      "Ward 11": [-6, -4],
      "Ward 12": [0, 0],
      "Ward 15": [8, -10],
      "Ward 19": [-10, 10],
      "Ward 22": [-4, 12],
      "Ward 24": [2, 10],
      "Ward 31": [12, 8],
      "Ward 44": [16, 2],
    };

    grievances.forEach((g) => {
      const ward = g.wardNumber || "Ward 12";
      const key = `${ward}_${g.department}`;
      const pos = wardPositions[ward] || [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20];

      if (!map[key]) {
        map[key] = {
          id: key,
          ward,
          x: pos[0] + (Math.random() - 0.5) * 2,
          z: pos[1] + (Math.random() - 0.5) * 2,
          department: g.department,
          count: 0,
          grievanceIds: [],
          highestEscalation: g.escalationLevel,
        };
      }

      map[key].count += 1;
      map[key].grievanceIds.push(g._id);
      if (g.escalationLevel === "state" || g.escalationLevel === "district") {
        map[key].highestEscalation = g.escalationLevel;
      }
    });

    return Object.values(map);
  }, [grievances]);

  // Unique departments for toggleable layer filter
  const departments = React.useMemo(() => {
    const set = new Set<string>();
    grievances.forEach((g) => set.add(g.department));
    return Array.from(set);
  }, [grievances]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.025);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 32, 42);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xa855f7, 2, 80);
    pointLight.position.set(0, 15, 0);
    scene.add(pointLight);

    // 5. 3D Jurisdictional Terrain Grid
    const gridHelper = new THREE.GridHelper(50, 25, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Ward boundary platforms
    const wardPlanes = [
      { name: "Central Zone (Ward 11-12)", x: -2, z: -2, w: 14, d: 14, color: 0x1e3a8a },
      { name: "West Zone (Ward 8)", x: -14, z: -8, w: 10, d: 10, color: 0x14532d },
      { name: "South Zone (Ward 19-31)", x: 2, z: 10, w: 16, d: 12, color: 0x581c87 },
      { name: "East Zone (Ward 44)", x: 16, z: 2, w: 10, d: 12, color: 0x7c2d12 },
    ];

    wardPlanes.forEach((wp) => {
      const planeGeo = new THREE.PlaneGeometry(wp.w, wp.d);
      const planeMat = new THREE.MeshStandardMaterial({
        color: wp.color,
        transparent: true,
        opacity: 0.25,
        roughness: 0.8,
      });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(wp.x, -0.02, wp.z);
      scene.add(plane);
    });

    // 6. Interactive 3D Density Columns (Clusters)
    const clusterMeshes: { mesh: THREE.Mesh; cluster: ClusterData }[] = [];

    clusters.forEach((c) => {
      if (activeDepartment !== "ALL" && c.department !== activeDepartment) return;

      const heightVal = Math.max(2, c.count * 3.5);
      const colColor = DEPT_COLORS[c.department] || 0x38bdf8;

      const colGeo = new THREE.CylinderGeometry(0.9, 1.2, heightVal, 16);
      const colMat = new THREE.MeshStandardMaterial({
        color: colColor,
        roughness: 0.3,
        metalness: 0.4,
        emissive: colColor,
        emissiveIntensity: c.highestEscalation === "district" || c.highestEscalation === "state" ? 0.6 : 0.2,
      });

      const colMesh = new THREE.Mesh(colGeo, colMat);
      colMesh.position.set(c.x, heightVal / 2, c.z);
      colMesh.castShadow = true;
      scene.add(colMesh);

      // Pulsing cap for urgent escalated items
      if (c.highestEscalation === "state" || c.highestEscalation === "district") {
        const beaconGeo = new THREE.SphereGeometry(0.7, 12, 12);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(c.x, heightVal + 0.8, c.z);
        scene.add(beacon);
      }

      clusterMeshes.push({ mesh: colMesh, cluster: c });
    });

    // 7. Raycasting for selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clusterMeshes.map((cm) => cm.mesh));

      if (intersects.length > 0) {
        const hit = clusterMeshes.find((cm) => cm.mesh === intersects[0].object);
        if (hit) {
          setSelectedCluster(hit.cluster);
        }
      }
    };

    renderer.domElement.addEventListener("click", handleClick);

    // 8. Animation & Slow Orbit Loop
    let angle = 0;
    let animId: number;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      camera.position.x += deltaX * 0.08;
      camera.position.y -= deltaY * 0.08;
      camera.position.y = Math.max(10, Math.min(60, camera.position.y));
      camera.lookAt(0, 0, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Subtle atmospheric rotation when idle
      if (!isDragging) {
        angle += 0.0015;
        camera.position.x = 42 * Math.sin(angle);
        camera.position.z = 42 * Math.cos(angle);
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      renderer.domElement.removeEventListener("click", handleClick);
      renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [clusters, activeDepartment]);

  const handleExecuteBatchAssign = () => {
    if (!selectedCluster) return;
    if (onBatchAssign) {
      onBatchAssign(selectedCluster.grievanceIds, assigneeName);
    }
    setBatchSuccess(`Batch of ${selectedCluster.count} complaint(s) successfully assigned to "${assigneeName}".`);
    setTimeout(() => setBatchSuccess(null), 4000);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col min-h-[650px]">
      {/* HUD Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Box size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-base sm:text-lg">VR/3D Spatial Command-Center</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Three.js Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Jurisdictional complaint density &amp; cluster assignment across all 10 departments
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Department Layer Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
            <Filter size={13} className="text-slate-400" />
            <span className="text-slate-400">Layer:</span>
            <select
              value={activeDepartment}
              onChange={(e) => setActiveDepartment(e.target.value)}
              className="bg-transparent text-white font-medium outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-slate-900">All Departments (Composite)</option>
              {departments.map((dept) => (
                <option key={dept} value={dept} className="bg-slate-900">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* WebXR Toggle */}
          <button
            onClick={() => setIsVRActive(!isVRActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isVRActive
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Sparkles size={14} />
            {isVRActive ? "WebXR Active" : "Enter WebXR VR"}
          </button>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="relative flex-1 w-full min-h-[460px] bg-slate-950 overflow-hidden">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Viewport Overlay Guidance */}
        <div className="absolute top-4 left-4 pointer-events-none bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="text-cyan-400 font-semibold flex items-center gap-1">
            <Compass size={13} /> 3D NAVIGATION CONTROLS
          </div>
          <div>• Drag mouse to rotate perspective</div>
          <div>• Click on any 3D pillar to inspect ward cluster</div>
          <div>• Red pulsing pillars indicate SLA breaches</div>
        </div>

        {/* Cluster Inspector & Batch Assign Drawer */}
        {selectedCluster && (
          <div className="absolute bottom-4 right-4 z-20 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-cyan-500/50 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: `#${(DEPT_COLORS[selectedCluster.department] || 0x3b82f6).toString(16)}` }} />
                <h4 className="text-white font-bold text-sm">{selectedCluster.ward} Cluster</h4>
              </div>
              <button
                onClick={() => setSelectedCluster(null)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-slate-400">Total Grievances:</div>
                <div className="text-white font-bold font-mono text-base">{selectedCluster.count}</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-slate-400">Department:</div>
                <div className="text-cyan-300 font-semibold truncate">{selectedCluster.department}</div>
              </div>
            </div>

            {/* Batch Assign Controls */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Users size={12} /> Assign Entire Cluster to Field Crew:
              </label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none focus:border-cyan-400"
                placeholder="Crew name or officer"
              />
              <button
                onClick={handleExecuteBatchAssign}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition"
              >
                <CheckCircle2 size={14} /> Batch-Assign {selectedCluster.count} Grievance(s)
              </button>
            </div>

            {batchSuccess && (
              <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 size={14} /> {batchSuccess}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer stats bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>Active Jurisdictions: <strong className="text-white">4 Zones (9 Wards)</strong></span>
          <span>Heatmap Clusters: <strong className="text-cyan-300">{clusters.length}</strong></span>
        </div>
        <div className="text-slate-400 italic">
          Desktop Three.js Scene • Upgradeable to WebXR Immersive Headset
        </div>
      </div>
    </div>
  );
}
