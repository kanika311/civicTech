"use client";

import { useEffect, useRef } from "react";
import type { ComplaintItem } from "@/lib/api";
import "leaflet/dist/leaflet.css";

export type PinnedComplaint = {
  complaint: ComplaintItem;
  lat: number;
  lng: number;
};

export default function ComplaintMap({
  pins,
  center = { lat: 20.5937, lng: 78.9629 },
  zoom = 5,
}: {
  pins: PinnedComplaint[];
  center?: { lat: number; lng: number };
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);
  const markersRef = useRef<{ remove: () => void }[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    import("leaflet").then((L) => {
      if (!containerRef.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      if (!containerRef.current) return;
      const map = L.map(containerRef.current).setView(
        pins.length > 0 ? [pins[0].lat, pins[0].lng] : [center.lat, center.lng],
        zoom
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      mapRef.current = map;

      if (pins.length === 1) {
        map.setView([pins[0].lat, pins[0].lng], 14);
      } else if (pins.length > 1) {
        const group = L.featureGroup(
          pins.map((p) => L.marker([p.lat, p.lng]))
        );
        map.fitBounds(group.getBounds().pad(0.2));
      }

      pins.forEach(({ complaint, lat, lng }) => {
        const marker = L.marker([lat, lng]).addTo(map);
        const statusClass =
          complaint.status === "Resolved"
            ? "bg-green-100 text-green-700"
            : complaint.status === "In Progress"
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700";
        marker.bindPopup(
          `<div class="text-sm min-w-[160px]">
            <p class="font-semibold">${escapeHtml(complaint.title || "Complaint")}</p>
            <p class="text-gray-600">${escapeHtml(complaint.location || "")}</p>
            <p class="mt-1"><span class="px-2 py-0.5 rounded text-xs ${statusClass}">${escapeHtml(complaint.status || "Pending")}</span></p>
            ${complaint.category ? `<p class="text-gray-500 text-xs mt-1">${escapeHtml(complaint.category)}</p>` : ""}
          </div>`
        );
        markersRef.current.push(marker);
      });
    });
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pins, center.lat, center.lng, zoom]);

  return <div ref={containerRef} className="w-full h-full min-h-[400px] z-0 rounded-b-xl" />;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
