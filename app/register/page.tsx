"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  User,
  Building2,
  Lock,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { CATEGORY_CONFIGS } from "@/lib/seedData";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [role, setRole] = useState<"citizen" | "government">("citizen");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [governmentId, setGovernmentId] = useState("");
  const [department, setDepartment] = useState("Public Works Department");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFillDemo = (targetRole: "citizen" | "government") => {
    setRole(targetRole);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (targetRole === "citizen") {
      const randNum = Math.floor(100 + Math.random() * 900);
      setName("Neha Deshmukh");
      setEmail(`neha.deshmukh${randNum}@example.com`);
      setPassword("password123");
      setPhone("9876501234");
      setAddress("Ward 12, Indiranagar, Bengaluru");
    } else {
      const randNum = Math.floor(100 + Math.random() * 900);
      setName("Er. Rajesh Nair");
      setGovernmentId(`GOV-PWD-${randNum}`);
      setDepartment("Public Works Department");
      setPassword("password123");
      setPhone("9811002233");
      setAddress("PWD Division Head Office, Zone 4");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const endpoint =
        role === "government"
          ? "/api/auth/register/government"
          : "/api/auth/register";

      const payload =
        role === "government"
          ? { name, governmentId, department, password, phone, address }
          : { name, email, password, phone, address };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.message || "Registration failed. Please check inputs.");
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || "Account created successfully! Logging you in...");

      if (data.token) {
        window.localStorage.setItem("token", data.token);
        window.localStorage.setItem("civic_role", role);
        if (data.user) {
          window.localStorage.setItem("civic_user", JSON.stringify(data.user));
        }
        window.dispatchEvent(new Event("civic_auth_changed"));
        dispatch(setCredentials({ token: data.token, role }));
      }

      setTimeout(() => {
        if (role === "government") {
          router.push("/government");
        } else {
          router.push("/citizen/dashboard");
        }
      }, 1200);
    } catch {
      setErrorMsg("Network error during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 py-10 transition-colors">
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
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Create an Account for Citizen Reporting or Government Oversight
        </p>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Role Selector Tabs */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Register As
          </label>
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setRole("citizen");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                role === "citizen"
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
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                role === "government"
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
            <span>Quick Demo Auto-Fill:</span>
          </div>
          <button
            type="button"
            onClick={() => handleFillDemo(role)}
            className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold transition"
          >
            Fill Demo {role === "citizen" ? "Citizen" : "Govt Official"}
          </button>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>

          {role === "citizen" ? (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail size={13} className="text-blue-500" /> Email Address *
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
            <>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 size={13} className="text-indigo-500" /> Government Official ID *
                </label>
                <input
                  type="text"
                  required
                  value={governmentId}
                  onChange={(e) => setGovernmentId(e.target.value)}
                  placeholder="e.g. GOV-PWD-088"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                >
                  {CATEGORY_CONFIGS.map((c) => (
                    <option key={c.department} value={c.department}>
                      {c.department}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock size={13} className="text-slate-400" /> Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 chars"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400" /> Jurisdiction / Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Ward 12, Central Zone, Bengaluru"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={14} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition flex items-center justify-center gap-2 ${
              role === "government"
                ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
            } disabled:opacity-50`}
          >
            <span>{loading ? "Registering..." : `Register as ${role === "citizen" ? "Citizen" : "Government Official"}`}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer Link to Login */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 dark:text-cyan-400 font-bold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
