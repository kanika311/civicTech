"use client";

import React, { useState } from "react";
import { ProcurementProject } from "@/types/grievance";
import { Building2, Landmark, CheckCircle, AlertTriangle, X, ExternalLink } from "lucide-react";

interface ARPublicSpendingOverlayProps {
  project: ProcurementProject;
  isOpen: boolean;
  onClose: () => void;
  onReportGrievance?: (project: ProcurementProject) => void;
}

export default function ARPublicSpendingOverlay({
  project,
  isOpen,
  onClose,
  onReportGrievance,
}: ARPublicSpendingOverlayProps) {
  const [pitch] = useState<number>(-8);
  const [roll] = useState<number>(0);

  if (!isOpen) return null;

  const spendPct = Math.min(
    100,
    Math.round((project.spendToDateInLakhs / project.sanctionedBudgetInLakhs) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Background simulated camera scene */}
      <div className="relative w-full max-w-2xl bg-slate-950 rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl shadow-cyan-950/50">
        {/* Synthetic spatial environment */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80"
            alt="Project Construction Site"
            className="w-full h-full object-cover opacity-40 filter contrast-125"
          />

          {/* AR spatial crosshairs and HUD markers */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-40 h-40 border border-dashed border-cyan-400/50 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
          >
            <X size={18} />
          </button>

          {/* FLOATING AR PROCUREMENT CARD */}
          <div
            className="absolute bottom-4 left-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-cyan-500/50 shadow-xl"
            style={{
              transform: `perspective(600px) rotateX(${pitch}deg) rotateY(${roll}deg)`,
              transition: "transform 0.2s ease-out",
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                  <Landmark size={16} />
                </span>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
                  PUBLIC PROCUREMENT OVERLAY
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE WORK ORDER
              </span>
            </div>

            <h4 className="text-white font-bold text-sm sm:text-base leading-snug mb-1">
              {project.title}
            </h4>
            <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
              <Building2 size={13} className="text-slate-400" />
              Contractor: <span className="text-slate-200 font-medium">{project.contractorName}</span> • Work Order: {project.workOrderNumber}
            </p>

            {/* Budget & Spend Metric Bars */}
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Sanctioned Public Budget:</span>
                <span className="text-white font-bold font-mono">₹ {project.sanctionedBudgetInLakhs.toFixed(2)} Lakhs</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Disbursed / Spend-to-Date:</span>
                <span className="text-emerald-400 font-bold font-mono">
                  ₹ {project.spendToDateInLakhs.toFixed(2)} Lakhs ({spendPct}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${spendPct}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Start: {project.startDate}</span>
                <span>Target Finish: {project.expectedCompletionDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle size={14} className="text-cyan-400" />
            <span>Audited Geo-fence Radius: {project.location.radiusMeters}m</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onReportGrievance) onReportGrievance(project);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium flex items-center gap-1.5 shadow-lg shadow-amber-600/20"
            >
              <AlertTriangle size={14} /> Report Project Defect / Delay
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
