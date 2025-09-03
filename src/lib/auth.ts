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
 * Get authentication headers for frontend API calls
 */
export function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') {
    return {}; // Server-side, no token available
  }

  const token = localStorage.getItem('adminToken');
  if (!token) {
    return {};
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Get current admin ID from stored token (client-side)
 */
export function getCurrentAdminId(): string | null {
  if (typeof window === 'undefined') {
    return null; // Server-side
  }

  const token = localStorage.getItem('adminToken');
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.decode(token) as AuthPayload;
    return payload?.adminId || null;
  } catch (error) {
    console.error("❌ Failed to decode admin token:", error);
    return null;
  }
}
