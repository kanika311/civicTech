import { NextRequest, NextResponse } from "next/server";
import { REGISTERED_USERS } from "../../login/route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, governmentId, password, department, phone, address } = body;

    if (!name || !governmentId || !password) {
      return NextResponse.json(
        { ok: false, message: "Name, Government ID, and password are required." },
        { status: 400 }
      );
    }

    const lowerGovId = governmentId.toLowerCase().trim();
    const existing = REGISTERED_USERS.find(
      (u) => u.governmentId?.toLowerCase() === lowerGovId
    );
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "A government account with this ID already exists." },
        { status: 400 }
      );
    }

    const newUser = {
      id: `gov-${Date.now().toString(36)}`,
      name,
      governmentId: governmentId.trim(),
      email: `${lowerGovId}@civic.gov.in`,
      password,
      department: department || "Public Works Department",
      phone,
      address,
      role: "government" as const,
    };

    REGISTERED_USERS.push(newUser);

    return NextResponse.json({
      ok: true,
      message: "Government official registered successfully!",
      token: `jwt-government-${newUser.id}-${Date.now()}`,
      role: "government",
      user: {
        id: newUser.id,
        name: newUser.name,
        governmentId: newUser.governmentId,
        department: newUser.department,
        role: newUser.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/register/government error:", error);
    return NextResponse.json(
      { ok: false, message: "Government registration failed." },
      { status: 500 }
    );
  }
}
