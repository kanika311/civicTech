import { NextResponse } from "next/server";
import { dataRepo } from "@/lib/dataRepository";

export async function GET() {
  try {
    const configs = await dataRepo.getDepartmentConfigs();
    return NextResponse.json({ ok: true, data: configs });
  } catch (error) {
    console.error("GET /api/departments error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch department configs" },
      { status: 500 }
    );
  }
}
