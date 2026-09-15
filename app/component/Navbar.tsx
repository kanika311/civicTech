"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Eye,
  PlusCircle,
  Compass,
  User,
  LogOut,
  LogIn,
} from "lucide-react";

interface UserProfile {
  name: string;
  role: "citizen" | "government";
  email?: string;
  governmentId?: string;
  department?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("civic_user");
      const role = localStorage.getItem("civic_role") as "citizen" | "government" | null;

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
          name: role === "government" ? "Govt Official" : "Citizen User",
          role: role || "citizen",
        });
      } else {
        setCurrentUser(null);
      }
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("civic_auth_changed", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("civic_auth_changed", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("civic_user");
      localStorage.removeItem("civic_role");
      window.dispatchEvent(new Event("civic_auth_changed"));
    }
    setCurrentUser(null);
    router.push("/login");
  };

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
      pathname === path
        ? "text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 shadow-sm"
        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60"
    }`;

  return (
    <nav className="w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-9 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition flex-shrink-0">
            <img
              src="/logo.png"
              alt="CivicTrack Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight block leading-none">
              CivicTrack
            </span>
            <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-mono tracking-wider">
              CITIZEN &amp; GOVT REDRESSAL
            </span>
          </div>
        </Link>

        {/* Desktop Links - Strictly Role-Isolated */}
        <div className="hidden md:flex items-center gap-1.5">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>

          {/* Citizen-Only Links */}
          {currentUser?.role === "citizen" && (
            <>
              <Link href="/citizen/dashboard" className={linkClass("/citizen/dashboard")}>
                <LayoutDashboard size={14} />
                Citizen Dashboard
              </Link>
              <Link
                href="/citizen/submit-universal"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
              >
                <PlusCircle size={14} />
                Report Grievance
              </Link>
            </>
          )}

          {/* Government-Only Links */}
          {currentUser?.role === "government" && (
            <Link href="/government" className={linkClass("/government")}>
              <Building2 size={14} />
              Government Portal
            </Link>
          )}

          {/* Shared Transparency Link */}
          <Link href="/transparency" className={linkClass("/transparency")}>
            <Eye size={14} />
            Transparency
          </Link>

          {/* Auth Section */}
          {currentUser ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 ${
                currentUser.role === "government"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200"
                  : "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200"
              }`}>
                <User size={12} className={currentUser.role === "government" ? "text-indigo-500" : "text-blue-500"} />
                <span className="max-w-[120px] truncate">{currentUser.name}</span>
                <span className={`text-[9px] font-mono px-1 rounded uppercase font-bold ${
                  currentUser.role === "government"
                    ? "bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200"
                    : "bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200"
                }`}>
                  {currentUser.role === "government" ? "Govt Officer" : "Citizen"}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1 text-xs"
                title="Sign Out"
              >
                <LogOut size={14} />
                <span className="hidden lg:inline text-[11px]">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition flex items-center gap-1"
              >
                <LogIn size={13} /> Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu link */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                currentUser.role === "government" ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300" : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              }`}>
                {currentUser.role === "government" ? "Govt" : "Citizen"}
              </span>
              {currentUser.role === "citizen" ? (
                <Link
                  href="/citizen/dashboard"
                  className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/government"
                  className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold"
                >
                  Portal
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="text-xs font-bold text-blue-600 dark:text-cyan-400 px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
