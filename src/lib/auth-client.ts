// Client-side authentication utilities
// This file contains only browser-safe functions and should not import any server-side dependencies

/**
 * Decode JWT token payload (browser-safe version)
 */
function decodeJWTPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode JWT payload:", error);
    return null;
  }
}

/**
 * Get current admin ID from localStorage
 */
export function getCurrentAdminId(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = getCurrentAuthToken();
  if (!token) return null;
  
  const payload = decodeJWTPayload(token);
  return payload?.adminId || null;
}

/**
 * Get current auth token from localStorage
 */
export function getCurrentAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken'); // Use same key as original
}

/**
 * Store admin authentication data in localStorage
 */
export function storeAuthData(adminId: string, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('adminId', adminId);
  localStorage.setItem('adminToken', token); // Use same key as original
}

/**
 * Clear authentication data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminId');
  localStorage.removeItem('adminToken'); // Use same key as original
}

/**
 * Get authentication headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getCurrentAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return !!(getCurrentAdminId() && getCurrentAuthToken());
}
