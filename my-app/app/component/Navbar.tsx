"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Map, Trophy, User, Flag } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  const linkClass = (path: string) =>
    `flex items-center gap-2 hover:text-blue-600 ${
      pathname === path ? "text-blue-600 font-semibold" : "text-gray-700"
    }`

  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <Flag size={28} />
          CivicTrack
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link href="/map" className={linkClass("/map")}>
            <Map size={18} />
            Map
          </Link>

          <Link href="/leaderboard" className={linkClass("/leaderboard")}>
            <Trophy size={18} />
            Leaderboard
          </Link>

          <Link href="/profile" className={linkClass("/profile")}>
            <User size={18} />
            Profile
          </Link>

          <Link
            href="/submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Submit Complaint
          </Link>
        </div>
      </div>
    </nav>
  )
}