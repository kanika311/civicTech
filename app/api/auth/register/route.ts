import { NextRequest, NextResponse } from "next/server";
import { REGISTERED_USERS } from "../login/route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const lowerEmail = email.toLowerCase().trim();
    const existing = REGISTERED_USERS.find((u) => u.email?.toLowerCase() === lowerEmail);
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "A user with this email already exists." },
        { status: 400 }
      );
    }

    const newUser = {
      id: `cit-${Date.now().toString(36)}`,
      name,
      email: lowerEmail,
      password,
      phone,
      address,
      role: "citizen" as const,
    };

    REGISTERED_USERS.push(newUser);

    return NextResponse.json({
      ok: true,
      message: "Citizen registered successfully!",
      token: `jwt-citizen-${newUser.id}-${Date.now()}`,
      role: "citizen",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { ok: false, message: "Registration failed." },
      { status: 500 }
    );
  }
}
