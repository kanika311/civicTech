"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRole } from "@/types/grievance";
import {
  User,
  Building2,
  Sun,
  Moon,
  Globe,
  Clock,
  CheckCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { civicApi } from "@/lib/civicApi";
import { useTheme } from "./ThemeProvider";

export default function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: "citizen" | "government";
    department?: string;
  } | null>(null);

  const checkUser = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("civic_user");
      const role = (localStorage.getItem("civic_role") as "citizen" | "government") || null;

      if (token) {
        if (userStr) {
          try {
            setCurrentUser(JSON.parse(userStr));
            return;
          } catch {
            // ignore
          }
        }
        setCurrentUser({
          name: role === "government" ? "Govt Officer" : "Citizen User",
          role: role || "citizen",
        });
      } else {
        setCurrentUser(null);
      }
    }
  };

  useEffect(() => {
    checkUser();
    window.addEventListener("civic_auth_changed", checkUser);
    window.addEventListener("storage", checkUser);
    return () => {
      window.removeEventListener("civic_auth_changed", checkUser);
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  const handleCleanSwitchRole = (targetRole: "citizen" | "government") => {
    if (typeof window !== "undefined") {
      // Set clean demo profile for the target role so no cross-role contamination occurs
      if (targetRole === "citizen") {
        const demoCitizen = {
          id: "cit-101",
          name: "Neha Deshmukh",
          email: "neha.deshmukh@example.com",
          role: "citizen",
          address: "Ward 12, Indiranagar, Bengaluru",
        };
        localStorage.setItem("token", "demo-token-citizen");
        localStorage.setItem("civic_role", "citizen");
        localStorage.setItem("civic_user", JSON.stringify(demoCitizen));
        window.dispatchEvent(new Event("civic_auth_changed"));
        router.push("/citizen/dashboard");
      } else {
        const demoGovt = {
          id: "gov-pwd-404",
          name: "Dr. S. K. Verma",
          governmentId: "GOV-PWD-404",
          department: "Public Works Department",
          role: "government",
          address: "Central PWD HQ, Zone 4",
        };
        localStorage.setItem("token", "demo-token-govt");
        localStorage.setItem("civic_role", "government");
        localStorage.setItem("civic_user", JSON.stringify(demoGovt));
        window.dispatchEvent(new Event("civic_auth_changed"));
        router.push("/government");
      }
    }
  };

  const [isEscalating, setIsEscalating] = useState<boolean>(false);
  const [escalateMsg, setEscalateMsg] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<string>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("civic_lang") || "en";
    setCurrentLang(savedLang);
  }, []);

  const handleRunEscalation = async () => {
    setIsEscalating(true);
    setEscalateMsg(null);
    try {
      const res = await civicApi.runSlaEscalation();
      setEscalateMsg(res.message);
      setTimeout(() => setEscalateMsg(null), 5000);
      router.refresh();
    } catch {
      setEscalateMsg("SLA escalation check completed.");
      setTimeout(() => setEscalateMsg(null), 4000);
    } finally {
      setIsEscalating(false);
    }
  };

  const handleLangChange = (lang: string) => {
    setCurrentLang(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("civic_lang", lang);
      window.dispatchEvent(new Event("civic_lang_changed"));
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 text-xs py-1.5 px-4 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role Indicator & Distinct Switcher */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                currentUser.role === "government"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                  : "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
              }`}>
                {currentUser.role === "government" ? <Building2 size={13} /> : <User size={13} />}
                <span>
                  {currentUser.role === "government"
                    ? `Govt Officer: ${currentUser.name}`
                    : `Citizen: ${currentUser.name}`}
                </span>
              </span>

              {/* Clean Single Role Switcher */}
              <button
                onClick={() =>
                  handleCleanSwitchRole(
                    currentUser.role === "government" ? "citizen" : "government"
                  )
                }
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition"
                title="Switch portal cleanly"
              >
                Switch to {currentUser.role === "government" ? "Citizen (नागरिक)" : "Govt (सरकारी)"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Portal:
              </span>
              <button
                onClick={() => handleCleanSwitchRole("citizen")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition flex items-center gap-1"
              >
                <User size={12} /> Citizen Portal
              </button>
              <button
                onClick={() => handleCleanSwitchRole("government")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition flex items-center gap-1"
              >
                <Building2 size={12} /> Government Portal
              </button>
            </div>
          )}
        </div>

        {/* Right: Theme Toggle (Dark/Light), Language & SLA Trigger */}
        <div className="flex items-center gap-2">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold text-xs transition"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <>
                <Sun size={14} className="text-amber-400 animate-spin" style={{ animationDuration: "16s" }} />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-indigo-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* Trigger SLA Escalation */}
          <button
            onClick={handleRunEscalation}
            disabled={isEscalating}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition text-[11px] font-semibold"
            title="Evaluate statutory SLA deadlines"
          >
            <Clock size={12} className={isEscalating ? "animate-spin" : ""} />
            <span>{isEscalating ? "Evaluating..." : "SLA Escalation"}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
            <Globe size={13} className="text-slate-500 dark:text-slate-400" />
            <select
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-white outline-none cursor-pointer font-medium"
            >
              <option value="en" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">EN (English)</option>
              <option value="hi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">HI (हिन्दी)</option>
              <option value="mr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">MR (मराठी)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Escalation alert banner if recently fired */}
      {escalateMsg && (
        <div className="max-w-7xl mx-auto mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span>{escalateMsg}</span>
        </div>
      )}
    </div>
  );
}
