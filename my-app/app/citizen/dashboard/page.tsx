"use client";

import Link from "next/link";
import { CgProfile } from "react-icons/cg";
import { CiMap, CiTrophy } from "react-icons/ci";

export default function CitizenDashboard() {
  const complaints = [
    {
      title: "Pothole on Main Street",
      category: "Infrastructure",
      status: "In Progress",
      date: "Feb 20, 2026",
      location: "Main St, Downtown",
    },
    {
      title: "Street light not working",
      category: "Utilities",
      status: "Pending",
      date: "Feb 19, 2026",
      location: "Oak Avenue, Block 5",
    },
    {
      title: "Garbage not collected",
      category: "Sanitation",
      status: "Resolved",
      date: "Feb 18, 2026",
      location: "Elm Street, District 2",
    },
  ];

  const statusStyle = (status) => {
    if (status === "Resolved")
      return "bg-green-100 text-green-600";
    if (status === "Pending")
      return "bg-yellow-100 text-yellow-600";
    return "bg-blue-100 text-blue-600";
  };

  return (
    <div className="min-h-screen bg-gray-200">

      {/* ================= NAVBAR ================= */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1   className="flex items-center gap-2 text-blue-600 font-semibold">
            CivicTrack
          </h1>

          <div className="hidden md:flex items-center gap-8 text-gray-700">
            <Link href="#" className="text-blue-600 font-[600] ">
              Dashboard
            </Link>
            <Link href="/citizen/map"   className="flex items-center gap-2 hover:text-blue-600 transition"><CiMap />Map</Link>
            <Link href="/citizen/leaderboard"   className="flex items-center gap-2 hover:text-blue-600 transition"><CiTrophy />Leaderboard</Link>
            <Link href="/citizen/profile"   className="flex items-center gap-2 hover:text-blue-600 transition"><CgProfile />Profile</Link>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Submit Complaint
            </button>
          </div>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* TITLE */}
        <h2 className="text-3xl font-semibold text-blue-600">
          Complaint Dashboard
        </h2>
        <p className="text-gray-600 mt-2 mb-10">
          Monitor and track your submitted complaints.
        </p>

        {/* ================= KPI CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card title="Total Complaints" value="1,284" />
          <Card title="Resolved" value="856" valueColor="text-green-600" />
          <Card title="In Progress" value="324" valueColor="text-yellow-600" />
          <Card
            title="Avg Resolution Time"
            value="4.2 days"
            valueColor="text-purple-600"
          />
        </div>

        {/* ================= CATEGORY ================= */}
        <h3 className="text-2xl font-semibold text-blue-600 mb-6">
          Complaints by Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <CategoryCard name="Infrastructure" count="342" />
          <CategoryCard name="Sanitation" count="289" />
          <CategoryCard name="Utilities" count="234" />
          <CategoryCard name="Safety" count="198" />
          <CategoryCard name="Environment" count="156" />
          <CategoryCard name="Other" count="65" />
        </div>

        {/* ================= RECENT COMPLAINTS ================= */}
        <h3 className="text-2xl font-semibold text-blue-600 mb-6">
          Recent Complaints
        </h3>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4">Issue Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Location</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c, index) => (
                <tr key={index} className="border-t">
                  <td className="p-4">{c.title}</td>
                  <td className="p-4">{c.category}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4">{c.date}</td>
                  <td className="p-4">{c.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Card({ title, value, valueColor = "text-blue-600" }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-gray-600 text-sm mb-2">{title}</p>
      <p className={`text-2xl font-semibold ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}

function CategoryCard({ name, count }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-gray-600 text-sm">{name}</p>
      <p className="text-2xl font-semibold text-blue-600 mt-2">
        {count}
      </p>
    </div>
  );
}