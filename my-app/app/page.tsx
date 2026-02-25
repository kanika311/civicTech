"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, Typography } from "@mui/material";

import {
 
  Business as BuildingIcon,
  
} from "@mui/icons-material";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

    {/* Logo Section */}
    <div className="flex items-center space-x-3">
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2,
          bgcolor: "#1976d2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
        }}
      >
        <BuildingIcon sx={{ color: "#fff", fontSize: 22 }} />
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#111",
          letterSpacing: 0.5,
        }}
      >
        CivicTrack
      </Typography>
    </div>

    {/* Desktop Menu */}
    <div className="hidden md:flex items-center space-x-8 text-gray-600 font-medium">
      <a href="#home" className="relative group">
        Home
        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
      </a>

      <a href="#features" className="relative group">
        Features
        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
      </a>

      <a href="#leaderboard" className="relative group">
        Leaderboard
        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
      </a>

      <Link href="/login">
        <button className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-300">
          Login
        </button>
      </Link>
    </div>

    {/* Mobile Toggle */}
    <button
      className="md:hidden text-2xl text-gray-700"
      onClick={() => setMenuOpen(!menuOpen)}
    >
      ☰
    </button>
  </div>

  {/* Mobile Menu */}
  {menuOpen && (
    <div className="md:hidden bg-white border-t border-gray-100 px-6 pb-6 pt-4 space-y-4 shadow-md">
      <a href="#home" className="block text-gray-700 font-medium">Home</a>
      <a href="#features" className="block text-gray-700 font-medium">Features</a>
      <a href="#leaderboard" className="block text-gray-700 font-medium">Leaderboard</a>

      <Link href="/login">
        <button className="w-full bg-blue-600 text-white py-2 rounded-xl shadow hover:bg-blue-700 transition">
          Login
        </button>
      </Link>
    </div>
  )}
</nav>

      {/* ================= HERO ================= */}
      <section
        id="home"
        className="h-screen flex items-center justify-center text-center text-white relative pt-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1505761671935-60b3a7427bad')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-blue-900/70"></div>

        <div className="relative z-10 max-w-3xl px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Transparent Governance Starts With You
          </h2>

          <p className="text-lg md:text-xl mb-8">
            Report civic issues, track resolution, and build a smarter city.
          </p>

          <Link href="/login">
            <button className="bg-green-500 px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition">
              Submit Complaint
            </button>
          </Link>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-20 bg-white px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-700">
          Platform Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard title="Geo-tag Complaints" />
          <FeatureCard title="Live Status Tracking" />
          <FeatureCard title="Civic Points System" />
        </div>
      </section>

      {/* ================= LEADERBOARD ================= */}
      <section id="leaderboard" className="py-20 bg-gray-100 px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-700">
          Top Civic Contributors
        </h2>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
          <ul className="space-y-4">
            <li className="flex justify-between">
              <span>1. Riya Sharma</span>
              <span className="font-semibold text-green-600">1200 pts</span>
            </li>
            <li className="flex justify-between">
              <span>2. Aman Gupta</span>
              <span className="font-semibold text-green-600">980 pts</span>
            </li>
            <li className="flex justify-between">
              <span>3. Neha Patel</span>
              <span className="font-semibold text-green-600">870 pts</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-blue-900 text-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-xl font-semibold mb-2">CivicTrack</h3>
          <p className="text-sm opacity-80">
            Empowering citizens through transparency and accountability.
          </p>

          <div className="mt-4 space-x-6 text-sm">
            <a href="#home" className="hover:underline">Home</a>
            <a href="#features" className="hover:underline">Features</a>
            <a href="#leaderboard" className="hover:underline">Leaderboard</a>
          </div>

          <p className="mt-4 text-xs opacity-60">
            © 2026 CivicTrack. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}

function FeatureCard({ title }: { title: string }) {
  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold text-blue-600 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm">
        Modern solution for efficient civic issue reporting and tracking.
      </p>
    </div>
  );
}