import { NextRequest, NextResponse } from "next/server";

export const DEMO_USERS = {
  citizen: {
    _id: "cit-101",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    role: "citizen",
    department: "Citizens",
    ward: "Ward 12",
    zone: "Central Zone",
    civicPoints: 145,
    badges: ["Civic Sentinel", "Clean City Champion", "Fast Reporter"],
  },
  field_worker: {
    _id: "wrk-201",
    name: "Ramesh Kumar",
    email: "ramesh.k@pwd.gov.in",
    role: "field_worker",
    department: "Public Works Department",
    designation: "Junior Engineer (Field Inspection)",
    assignedWard: "Ward 12",
  },
  department_officer: {
    _id: "off-301",
    name: "Dr. S. K. Verma",
    email: "sk.verma@pwd.gov.in",
    role: "department_officer",
    department: "Public Works Department",
    designation: "Executive Engineer (Central Division)",
  },
  zonal_admin: {
    _id: "adm-401",
    name: "Ananya Roy, IAS",
    email: "ananya.roy@karnataka.gov.in",
    role: "zonal_admin",
    department: "District Administration",
    designation: "District Magistrate & Collector",
    jurisdiction: "Central & South Zone",
  },
  district_admin: {
    _id: "adm-401",
    name: "Ananya Roy, IAS",
    email: "ananya.roy@karnataka.gov.in",
    role: "district_admin",
    department: "District Administration",
    designation: "District Magistrate & Collector",
    jurisdiction: "Central & South Zone",
  },
  state_ombudsman: {
    _id: "omb-501",
    name: "Justice (Retd.) K. N. Rao",
    email: "ombudsman.grievance@state.gov.in",
    role: "state_ombudsman",
    department: "State Public Grievance Ombudsman",
    designation: "State Ombudsman",
  },
  public_auditor: {
    _id: "aud-601",
    name: "Janaagraha Public Auditor",
    email: "audit@janaagraha.org",
    role: "public_auditor",
    department: "Civil Society Oversight",
    designation: "Open Government Independent Auditor",
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = (searchParams.get("role") || "citizen") as keyof typeof DEMO_USERS;
  const user = DEMO_USERS[role] || DEMO_USERS.citizen;

  return NextResponse.json({
    ok: true,
    user,
    token: `demo-token-${user.role}-${Date.now()}`,
  });
}
