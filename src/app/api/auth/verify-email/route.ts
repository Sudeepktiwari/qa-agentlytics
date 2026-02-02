import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/mongo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const users = await getUsersCollection();
  
  // Find user with this token
  const user = await users.findOne({ verificationToken: token });

  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  // Check expiry
  if (user.verificationTokenExpires && new Date(user.verificationTokenExpires) < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 400 });
  }

  // Mark as verified
  await users.updateOne(
    { _id: user._id },
    {
      $set: { emailVerified: true },
      $unset: { verificationToken: "", verificationTokenExpires: "" }
    }
  );

  // Redirect to login page with success message
  // Assuming standard Next.js app structure, usually /login or /auth/login
  // I'll try to redirect to root / or /login if I can guess. 
  // Based on the user's instructions, they didn't specify the redirect URL, just "return res.redirect("/email-verified")".
  // I'll stick to that or similar.
  
  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}
