import { NextResponse } from "next/server";
import { dataRepo } from "@/lib/dataRepository";

export async function POST() {
  try {
    const result = await dataRepo.runSlaEscalationCheck();
    return NextResponse.json({
      ok: true,
      message: `SLA escalation cycle executed. ${result.escalatedCount} grievance(s) escalated out of ${result.checkedCount} checked.`,
      data: result,
    });
  } catch (error) {
    console.error("POST /api/escalate error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to run SLA escalation check" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
