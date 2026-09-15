import { NextRequest, NextResponse } from "next/server";
import { dataRepo } from "@/lib/dataRepository";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const citizenId = searchParams.get("citizenId") || undefined;
    const department = searchParams.get("department") || undefined;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const escalationLevel = searchParams.get("escalationLevel") || undefined;
    const onlyEscalated = searchParams.get("onlyEscalated") === "true";
    const excludeAnonymous = searchParams.get("excludeAnonymous") === "true";
    const search = searchParams.get("q") || undefined;

    const grievances = await dataRepo.getGrievances({
      citizenId,
      department,
      status,
      category,
      escalationLevel,
      onlyEscalated,
      excludeAnonymousForPublic: excludeAnonymous,
      search,
    });

    return NextResponse.json({ ok: true, data: grievances });
  } catch (error) {
    console.error("GET /api/grievances error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch grievances" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.description) {
      return NextResponse.json(
        { ok: false, error: "Description is required" },
        { status: 400 }
      );
    }

    const created = await dataRepo.createGrievance(body);
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/grievances error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to submit grievance" },
      { status: 500 }
    );
  }
}
