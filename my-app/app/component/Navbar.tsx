"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, Trophy, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition ${
      pathname === path ? "text-blue-600 font-semibold bg-blue-50" : ""
    }`;

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-blue-600 hover:opacity-90 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <span className="font-bold text-slate-800 text-lg">CivicTrack</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/citizen/dashboard" className={linkClass("/citizen/dashboard")}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link href="/citizen/map" className={linkClass("/citizen/map")}>
            <Map size={18} />
            Map
          </Link>
          <Link href="/citizen/leaderboard" className={linkClass("/citizen/leaderboard")}>
            <Trophy size={18} />
            Leaderboard
          </Link>
          <Link href="/citizen/profile" className={linkClass("/citizen/profile")}>
            <User size={18} />
            Profile
          </Link>
          <Link
            href="/citizen/submit"
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Submit Complaint
          </Link>
        </div>
      </div>
    </nav>
  );
}
