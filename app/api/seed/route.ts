import { NextResponse } from "next/server";
import { dataRepo } from "@/lib/dataRepository";

export async function POST() {
  try {
    await dataRepo.resetToSeed();
    return NextResponse.json({
      ok: true,
      message: "Database re-seeded successfully with 10 categories, grievances, and procurement projects.",
    });
  } catch (error) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to seed database" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
