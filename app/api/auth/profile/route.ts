import { NextRequest, NextResponse } from "next/server";
import { REGISTERED_USERS } from "../login/route";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return NextResponse.json({ ok: false, message: "Not logged in" }, { status: 401 });
  }

  // Find user by token prefix or return demo user
  const isGov = token.includes("government");
  const user = REGISTERED_USERS.find((u) => u.role === (isGov ? "government" : "citizen")) || REGISTERED_USERS[0];

  return NextResponse.json({
    ok: true,
    _id: user.id,
    name: user.name,
    email: user.email,
    governmentId: user.governmentId,
    phone: user.phone,
    address: user.address,
    role: user.role,
    department: user.department,
    createdAt: new Date().toISOString(),
  });
}
