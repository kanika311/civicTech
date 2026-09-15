import { NextResponse } from "next/server";
import { dataRepo } from "@/lib/dataRepository";

export async function GET() {
  try {
    const scores = await dataRepo.getTransparencyScores();
    return NextResponse.json({ ok: true, data: scores });
  } catch (error) {
    console.error("GET /api/transparency error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch transparency scores" },
      { status: 500 }
    );
  }
}
