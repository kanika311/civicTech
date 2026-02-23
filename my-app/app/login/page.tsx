"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("citizen");

  const handleLogin = (e) => {
    e.preventDefault();

    // Demo routing based on role
    if (role === "citizen") {
      router.push("/citizen/dashboard");
    } else {
      router.push("/government/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Login to CivicTrack
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Role selection */}
          <div className="flex gap-6 text-sm pt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="citizen"
                checked={role === "citizen"}
                onChange={() => setRole("citizen")}
              />
              Citizen
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="government"
                checked={role === "government"}
                onChange={() => setRole("government")}
              />
              Government
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
}