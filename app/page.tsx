"use client";

import React from "react";
import Link from "next/link";
import Navbar from "./component/Navbar";
import { CATEGORY_CONFIGS } from "@/lib/seedData";
import {
  User,
  Building2,
  Camera,
  Box,
  Clock,
  Sparkles,
  Lock,
  Landmark,
  ArrowRight,
  CheckCircle2,
  Compass,
  HardHat,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 w-full space-y-16 pb-20">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-14 px-4 sm:px-6 max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-sm">
            <Sparkles size={14} className="text-blue-600 dark:text-cyan-400" />
            Universal Government Grievance Redressal &amp; Spatial Oversight
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-cyan-300 dark:to-emerald-400">ANY</span> Government Problem. Track to Resolution.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Universal citizen grievance reporting across all 10 departments with browser-based AR spatial evidence, 3D VR official oversight, and automated SLA escalation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/citizen/submit-universal"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 transition"
            >
              <Camera size={18} /> Report Grievance (AR Capture)
            </Link>

            <Link
              href="/government"
              className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm flex items-center gap-2 shadow-sm transition"
            >
              <Building2 size={18} className="text-indigo-600 dark:text-indigo-400" /> Government Portal (Govt)
            </Link>

            <Link
              href="/transparency"
              className="px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-sm flex items-center gap-2 transition"
            >
              Transparency Scores
            </Link>
          </div>
        </section>

        {/* 2 PRIMARY OPERATING ROLES: CITIZEN VS GOVERNMENT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Choose Your Role
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Dedicated, tailored interfaces for Citizens and Government Officials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Citizen Role Card */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-6 hover:shadow-2xl transition">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <User size={30} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Citizen (नागरिक)</h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    Report Problems • Live SLA Tracking • Earn Civic Points
                  </p>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    AR camera spatial capture (GPS + compass heading)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    AI-powered category auto-routing &amp; voice dictation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    AR Ghost preview to visually inspect resolved sites
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Protected anonymous corruption whistleblower reporting
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <Link
                  href="/citizen/dashboard"
                  className="flex-1 py-3 text-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition"
                >
                  Citizen Dashboard
                </Link>
                <Link
                  href="/citizen/submit-universal"
                  className="flex-1 py-3 text-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition border border-slate-200 dark:border-slate-700"
                >
                  + Report Issue
                </Link>
              </div>
            </div>

            {/* Government Role Card */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-6 hover:shadow-2xl transition">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Building2 size={30} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Government (सरकारी अधिकारी)</h3>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    Department Queues • 3D/VR Command • AR Field-Assist
                  </p>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Manage tickets across all 10 official government departments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    AR Field-Assist view with distance radar and ghost overlay
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    3D/VR district terrain &amp; complaint density heatmaps
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Automated SLA escalation monitoring &amp; resolution proof uploads
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <Link
                  href="/government"
                  className="w-full py-3 text-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
                >
                  <span>Enter Government Control Center</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 10 CATEGORY TAXONOMY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Universal 10-Department Taxonomy
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Citizens can report ANY government problem. Automatic routing and statutory legal SLA timelines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {CATEGORY_CONFIGS.map((cat, idx) => (
              <div
                key={cat.category}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-cyan-400 uppercase tracking-wider block font-bold">
                    #{idx + 1} {cat.autoRouteCode}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">{cat.category}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{cat.department}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">SLA: {cat.defaultSlaDays} Days</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-[10px]">
                    {cat.isVisualARCategory ? "AR Visual" : "Form"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}