"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  User,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Compass,
} from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials, setError } from "@/store/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [role, setRole] = useState<"citizen" | "government">("citizen");
  const [email, setEmail] = useState("");
  const [governmentId, setGovernmentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFillDemo = (targetRole: "citizen" | "government") => {
    setRole(targetRole);
    setErrorMsg(null);
    if (targetRole === "citizen") {
      setEmail("citizen@example.com");
      setPassword("password123");
    } else {
      setGovernmentId("GOV-PWD-001");
      setPassword("password123");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    dispatch(setError(null));

    const identifier = role === "citizen" ? email.trim() : governmentId.trim();

    if (!identifier) {
      setErrorMsg(role === "citizen" ? "Please enter your email address." : "Please enter your Government Official ID.");
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: role === "citizen" ? identifier : undefined,
          governmentId: role === "government" ? identifier : undefined,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.message || "Invalid credentials. Please check and try again.");
        setLoading(false);
        return;
      }

      const { token, role: userRole, user } = data;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("token", token);
        window.localStorage.setItem("civic_role", userRole);
        if (user) {
          window.localStorage.setItem("civic_user", JSON.stringify(user));
        }
        window.dispatchEvent(new Event("civic_auth_changed"));
      }

      dispatch(setCredentials({ token, role: userRole }));

      // Redirect smoothly to corresponding dashboard
      if (userRole === "government") {
        router.push("/government");
      } else {
        router.push("/citizen/dashboard");
      }
    } catch {
      setErrorMsg("Network error connecting to login server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 transition-colors">
      {/* Brand Header */}
      <div className="mb-6 text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition shadow-lg">
            <img
              src="/logo.png"
              alt="CivicTrack Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white">
            CivicTrack
          </span>
        </Link>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
          Universal Citizen Grievance Redressal &amp; Spatial AR/VR Oversight
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Role Selector Tabs (Citizen vs Government) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setRole("citizen");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${role === "citizen"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <User size={14} /> Citizen (नागरिक)
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("government");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${role === "government"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <Building2 size={14} /> Government (सरकारी)
            </button>
          </div>
        </div>

        {/* 1-Click Demo Fill Assistant */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
            <Sparkles size={13} className="text-amber-500" />
            <span>Quick Demo Login:</span>
          </div>
          <button
            type="button"
            onClick={() => handleFillDemo(role)}
            className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold transition"
          >
            Fill Demo {role === "citizen" ? "Citizen" : "Govt"}
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {role === "citizen" ? (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail size={13} className="text-blue-500" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 size={13} className="text-indigo-500" /> Government Official ID
              </label>
              <input
                type="text"
                required
                value={governmentId}
                onChange={(e) => setGovernmentId(e.target.value)}
                placeholder="e.g. GOV-PWD-001 or officer@pwd.gov.in"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock size={13} className="text-slate-400" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 pr-10 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition flex items-center justify-center gap-2 ${role === "government"
                ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
              } disabled:opacity-50`}
          >
            <span>{loading ? "Authenticating..." : `Log in as ${role === "citizen" ? "Citizen" : "Government Official"}`}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 dark:text-cyan-400 font-bold hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
