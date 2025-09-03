import { getDb } from "@/lib/mongo";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export interface AuthPayload {
  email: string;
  adminId: string;
  iat?: number;
  exp?: number;
}

// Utility function to verify API key
export async function verifyApiKey(apiKey: string) {
  if (!apiKey || !apiKey.startsWith("ak_")) {
    return null;
  }

  try {
    const db = await getDb();
    const users = db.collection("users");
    const keyRecord = await users.findOne({ apiKey });

    if (!keyRecord) {
      return null;
    }

    return {
      adminId: keyRecord.adminId || keyRecord._id.toString(), // use ObjectId as adminId if no explicit adminId
      email: keyRecord.email,
    };
  } catch {
    return null;
  }
}

/**
 * Extract and verify JWT token from request headers
 */
export function verifyAdminToken(request: NextRequest): AuthPayload | null {
  try {
    // Check for Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    
    return payload;
  } catch (error) {
    console.error("❌ Invalid admin token:", error);
    return null;
  }
}

/**
 * Extract and verify JWT token from request cookies (for cookie-based auth)
 */
export function verifyAdminTokenFromCookie(request: NextRequest): AuthPayload | null {
  try {
    // Check for auth_token cookie
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return null;
    }

    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    
    return payload;
  } catch (error) {
    console.error("❌ Invalid admin token from cookie:", error);
    return null;
  }
}

/**
 * Get admin ID from verified token
 */
export function getAdminIdFromRequest(request: NextRequest): string | null {
  const payload = verifyAdminToken(request);
  return payload?.adminId || null;
}

/**
 * Check if admin has access to specific resource
 */
export function verifyAdminAccess(request: NextRequest, requiredAdminId?: string): { 
  isValid: boolean; 
  adminId?: string; 
  error?: string 
} {
  const payload = verifyAdminToken(request);
  
  if (!payload) {
    return { isValid: false, error: "Authentication required" };
  }

  // If specific adminId is required, verify it matches
  if (requiredAdminId && payload.adminId !== requiredAdminId) {
    return { isValid: false, error: "Access denied: insufficient permissions" };
  }

  return { isValid: true, adminId: payload.adminId };
}

/**
 * Check if admin has access to specific resource (cookie-based auth)
 */
export function verifyAdminAccessFromCookie(request: NextRequest, requiredAdminId?: string): { 
  isValid: boolean; 
  adminId?: string; 
  error?: string 
} {
  const payload = verifyAdminTokenFromCookie(request);
  
  if (!payload) {
    return { isValid: false, error: "Authentication required" };
  }

  // If specific adminId is required, verify it matches
  if (requiredAdminId && payload.adminId !== requiredAdminId) {
    return { isValid: false, error: "Access denied: insufficient permissions" };
  }

  return { isValid: true, adminId: payload.adminId };
}
