import { NextRequest, NextResponse } from "next/server";
import { listDocuments, deleteDocument } from "@/lib/chroma";

export async function GET(req: NextRequest) {
  const admin = req.nextUrl.searchParams.get("admin");
  if (admin !== "1")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const docs = await listDocuments();
  return NextResponse.json({ documents: docs });
}

export async function DELETE(req: NextRequest) {
  const admin = req.nextUrl.searchParams.get("admin");
  if (admin !== "1")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const filename = req.nextUrl.searchParams.get("filename");
  if (!filename)
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  await deleteDocument(filename);
  return NextResponse.json({ success: true });
}
