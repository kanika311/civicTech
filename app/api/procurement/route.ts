import { NextResponse } from "next/server";
import { dataRepo } from "@/lib/dataRepository";

export async function GET() {
  try {
    const projects = await dataRepo.getProcurementProjects();
    return NextResponse.json({ ok: true, data: projects });
  } catch (error) {
    console.error("GET /api/procurement error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch procurement projects" },
      { status: 500 }
    );
  }
}
