import { NextRequest, NextResponse } from "next/server";
import { listDocuments, deleteDocument } from "@/lib/chroma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

function getAdminIdFromRequest(req: NextRequest): string | undefined {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return undefined;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      email: string;
      adminId: string;
    };
    return payload.adminId;
  } catch {
    return undefined;
  }
}

export async function GET(req: NextRequest) {
  const admin = req.nextUrl.searchParams.get("admin");
  if (admin !== "1")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const adminId = getAdminIdFromRequest(req);
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const docs = await listDocuments(adminId);
  return NextResponse.json({ documents: docs });
}

export async function DELETE(req: NextRequest) {
  const admin = req.nextUrl.searchParams.get("admin");
  if (admin !== "1")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { filename } = await req.json();
  const adminId = getAdminIdFromRequest(req);
  if (!adminId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await deleteDocument(filename, adminId);
  return NextResponse.json({ success: true });
}
