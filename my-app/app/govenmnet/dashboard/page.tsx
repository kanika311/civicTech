"use client";

import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("./DashboardClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ color: "#666" }}>Loading dashboard...</p>
    </div>
  ),
});

export default function GovDashboardPage() {
  return <DashboardClient />;
}
