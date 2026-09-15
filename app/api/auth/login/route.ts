import { NextRequest, NextResponse } from "next/server";

// In-memory registered users store initialized with demo accounts
export const REGISTERED_USERS: Array<{
  id: string;
  name: string;
  email?: string;
  governmentId?: string;
  password: string;
  role: "citizen" | "government";
  department?: string;
  phone?: string;
  address?: string;
}> = [
  {
    id: "cit-101",
    name: "Aarav Sharma",
    email: "citizen@example.com",
    password: "password123",
    role: "citizen",
    phone: "9876543210",
    address: "Ward 12, MG Road, Bengaluru",
  },
  {
    id: "gov-201",
    name: "Dr. S. K. Verma",
    email: "officer@pwd.gov.in",
    governmentId: "GOV-PWD-001",
    password: "password123",
    role: "government",
    department: "Public Works Department",
    phone: "9811223344",
    address: "PWD Division Office, Ward 12",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, governmentId, password, role } = body;

    const identifier = (email || governmentId || "").toLowerCase().trim();

    // Check against registered or demo users
    const matched = REGISTERED_USERS.find((u) => {
      if (role && u.role !== role) return false;
      const uEmail = (u.email || "").toLowerCase();
      const uGovId = (u.governmentId || "").toLowerCase();
      return uEmail === identifier || uGovId === identifier;
    });

    // Accept valid user password, or provide smooth demo access
    if (matched && matched.password === password) {
      return NextResponse.json({
        ok: true,
        token: `jwt-${matched.role}-${matched.id}-${Date.now()}`,
        role: matched.role,
        user: {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          governmentId: matched.governmentId,
          role: matched.role,
          department: matched.department,
        },
      });
    }

    // If demo fallback or any non-empty password for smooth testing
    if (identifier && password && password.length >= 6) {
      const fallbackRole = role || (identifier.includes("gov") ? "government" : "citizen");
      const newUser = {
        id: `usr-${Date.now().toString(36)}`,
        name: identifier.split("@")[0].toUpperCase(),
        email: identifier.includes("@") ? identifier : `${identifier}@civic.gov.in`,
        governmentId: identifier,
        password,
        role: fallbackRole as "citizen" | "government",
        department: fallbackRole === "government" ? "Public Works Department" : undefined,
      };

      REGISTERED_USERS.push(newUser);

      return NextResponse.json({
        ok: true,
        token: `jwt-${newUser.role}-${newUser.id}-${Date.now()}`,
        role: newUser.role,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          governmentId: newUser.governmentId,
          role: newUser.role,
          department: newUser.department,
        },
      });
    }

    return NextResponse.json(
      { ok: false, message: "Invalid email/government ID or password (minimum 6 characters)." },
      { status: 401 }
    );
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Server login error" },
      { status: 500 }
    );
  }
}
