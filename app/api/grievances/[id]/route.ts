import { NextRequest, NextResponse } from "next/server";
import { dataRepo } from "@/lib/dataRepository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const grievance = await dataRepo.getGrievanceById(id);
    if (!grievance) {
      return NextResponse.json(
        { ok: false, error: "Grievance not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, data: grievance });
  } catch (error) {
    console.error("GET /api/grievances/[id] error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await dataRepo.updateGrievance(id, body);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Grievance not found or cannot be updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/grievances/[id] error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update grievance" },
      { status: 500 }
    );
  }
}
