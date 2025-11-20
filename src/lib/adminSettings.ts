/**
 * Admin Settings Management System
 * Replaces environment variable feature flags with database-stored admin preferences
 */

import { MongoClient, Db, Collection } from "mongodb";

// Onboarding settings interface
export interface OnboardingField {
  key: string;
  label: string;
  required: boolean;
  type: "text" | "email" | "phone" | "select" | "checkbox";
  validations?: {
    regex?: string;
    minLength?: number;
    maxLength?: number;
  };
  placeholder?: string;
  options?: string[];
}

export interface ParsedCurlSummary {
  method: string;
  url?: string | null;
  contentType?: string;
  headersRedacted?: Record<string, string>;
  bodyKeys?: string[];
}

export interface OnboardingSettings {
  enabled: boolean;
  apiBaseUrl?: string;
  registerEndpoint?: string; // relative path
  method?: "POST" | "PUT" | "PATCH";
  apiKey?: string;
  authHeaderKey?: string; // e.g., Authorization or X-API-Key
  docsUrl?: string;
  // New: canonical cURL registration command for auto-configuration
  curlCommand?: string;
  // Authentication: docs and canonical cURL
  authDocsUrl?: string;
  authCurlCommand?: string;
  // Post-registration initial setup: docs and canonical cURL
  initialSetupDocsUrl?: string;
  initialSetupCurlCommand?: string;
  fields?: OnboardingField[];
  registrationFields?: OnboardingField[];
  registrationHeaders?: string[];
  registrationHeaderFields?: OnboardingField[];
  registrationResponseFields?: string[];
  registrationResponseFieldDefs?: OnboardingField[];
  authFields?: OnboardingField[];
  authHeaders?: string[];
  authHeaderFields?: OnboardingField[];
  authResponseFields?: string[];
  authResponseFieldDefs?: OnboardingField[];
  initialFields?: OnboardingField[];
  initialHeaders?: string[];
  initialHeaderFields?: OnboardingField[];
  initialResponseFields?: string[];
  initialResponseFieldDefs?: OnboardingField[];
  registrationParsed?: ParsedCurlSummary;
  authParsed?: ParsedCurlSummary;
  initialParsed?: ParsedCurlSummary;
  rateLimit?: { perMinute: number };
  idempotencyKeyField?: string;
}

// Admin settings interface
export interface AdminSettings {
  _id?: string;
  adminId: string;
  email: string;
  features: {
    bookingDetection: boolean;
    calendarWidget: boolean;
    formSubmission: boolean;
    emailIntegration: boolean;
    analytics: boolean;
    voiceEnabled: boolean;
    proactiveMessages: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "auto";
    timezone: string;
    businessHours: {
      start: string;
      end: string;
      days: number[]; // 0-6, Sunday=0
    };
    autoResponses: boolean;
    leadCapture: boolean;
  };
  limits: {
    monthlyInteractions: number;
    maxConcurrentChats: number;
    storageGB: number;
  };
  onboarding?: OnboardingSettings; // Optional onboarding configuration
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
  version: number; // For optimistic locking
}

// Default settings for new admins
export const DEFAULT_ADMIN_SETTINGS: Omit<AdminSettings, "_id" | "adminId" | "email" | "createdAt" | "updatedAt" | "updatedBy"> = {
  features: {
    // Core features - always enabled
    bookingDetection: true,
    calendarWidget: true,
    formSubmission: true, // Now always enabled
    // Optional features that can be toggled
    emailIntegration: false,
    analytics: true,
    voiceEnabled: false,
    proactiveMessages: true,
  },
  preferences: {
    theme: "auto",
    timezone: "America/New_York",
    businessHours: {
      start: "09:00",
      end: "17:00",
      days: [1, 2, 3, 4, 5], // Monday-Friday
    },
    autoResponses: true,
    leadCapture: true,
  },
  limits: {
    monthlyInteractions: 10000,
    maxConcurrentChats: 100,
    storageGB: 5,
  },
  onboarding: {
    enabled: false,
    apiBaseUrl: undefined,
    registerEndpoint: undefined,
    method: "POST",
    apiKey: undefined,
    authHeaderKey: "Authorization",
    docsUrl: undefined,
    curlCommand: undefined,
    authDocsUrl: undefined,
    authCurlCommand: undefined,
    initialSetupDocsUrl: undefined,
    initialSetupCurlCommand: undefined,
    fields: undefined,
    registrationFields: undefined,
    registrationHeaders: undefined,
    registrationHeaderFields: undefined,
    registrationResponseFields: undefined,
    registrationResponseFieldDefs: undefined,
    authFields: undefined,
    authHeaders: undefined,
    authHeaderFields: undefined,
    authResponseFields: undefined,
    authResponseFieldDefs: undefined,
    initialFields: undefined,
    initialHeaders: undefined,
    initialHeaderFields: undefined,
    initialResponseFields: undefined,
    initialResponseFieldDefs: undefined,
    registrationParsed: undefined,
    authParsed: undefined,
    initialParsed: undefined,
    rateLimit: { perMinute: 30 },
    idempotencyKeyField: "email",
  },
  version: 1,
};

// In-memory cache for settings
class SettingsCache {
  private cache = new Map<string, { settings: AdminSettings; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  get(adminId: string): AdminSettings | null {
    const cached = this.cache.get(adminId);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(adminId);
      return null;
    }
    
    return cached.settings;
  }

  set(adminId: string, settings: AdminSettings): void {
    this.cache.set(adminId, {
      settings: { ...settings },
      timestamp: Date.now(),
    });
  }

  invalidate(adminId: string): void {
    this.cache.delete(adminId);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance
const settingsCache = new SettingsCache();

// Database connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db("chatbot");
  return cachedDb;
}

async function getAdminSettingsCollection(): Promise<Collection<AdminSettings>> {
  const db = await connectToDatabase();
  return db.collection<AdminSettings>("adminSettings");
}

/**
 * Get admin settings by admin ID with caching
 */
export async function getAdminSettings(adminId: string): Promise<AdminSettings> {
  // Try cache first
  const cached = settingsCache.get(adminId);
  if (cached) {
    return cached;
  }

  try {
    const collection = await getAdminSettingsCollection();
    const settings = await collection.findOne({ adminId });

    // If no settings exist, create default settings
    if (!settings) {
      return await createDefaultAdminSettings(adminId);
    }

    // Convert MongoDB document to AdminSettings
    const adminSettings: AdminSettings = {
      _id: settings._id?.toString(),
      adminId: settings.adminId,
      email: settings.email,
      features: settings.features,
      preferences: settings.preferences,
      limits: settings.limits,
      onboarding: (() => {
        const ob = settings.onboarding || DEFAULT_ADMIN_SETTINGS.onboarding;
        // Auto-enable onboarding if curlCommand is provided
        if (ob?.curlCommand && !ob.enabled) {
          return { ...ob, enabled: true };
        }
        return ob;
      })(),
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
      updatedBy: settings.updatedBy,
      version: settings.version,
    };

    // Cache the settings
    settingsCache.set(adminId, adminSettings);
    
    return adminSettings;
  } catch (error) {
    console.error("❌ Failed to get admin settings:", error);
    
    // Return default settings as fallback
    return {
      ...DEFAULT_ADMIN_SETTINGS,
      _id: `default-${adminId}`,
      adminId,
      email: `${adminId}@unknown.com`,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: "system",
    };
  }
}

/**
 * Create default admin settings for a new admin
 */
export async function createDefaultAdminSettings(
  adminId: string,
  email?: string
): Promise<AdminSettings> {
  try {
    const collection = await getAdminSettingsCollection();
    
    const settings: AdminSettings = {
      ...DEFAULT_ADMIN_SETTINGS,
      adminId,
      email: email || `${adminId}@unknown.com`,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: adminId,
    };

    await collection.insertOne(settings);
    
    // Cache the new settings
    settingsCache.set(adminId, settings);
    
    console.log(`✅ Created default admin settings for ${adminId}`);
    return settings;
  } catch (error) {
    console.error("❌ Failed to create default admin settings:", error);
    throw error;
  }
}

/**
 * Update admin settings
 */
export async function updateAdminSettings(
  adminId: string,
  updates: Partial<AdminSettings>,
  updatedBy: string
): Promise<AdminSettings> {
  try {
    const collection = await getAdminSettingsCollection();
    
    const updateDoc = {
      ...updates,
      updatedAt: new Date(),
      updatedBy,
    };

    const result = await collection.findOneAndUpdate(
      { adminId },
      { 
        $set: updateDoc,
        $inc: { version: 1 }
      },
      { returnDocument: "after", upsert: true }
    );

    const doc = (result as any)?.value ?? result;
    if (!doc) {
      throw new Error("Failed to update admin settings");
    }

    // Convert MongoDB document to AdminSettings
    const adminSettings: AdminSettings = {
      _id: doc._id?.toString(),
      adminId: doc.adminId,
      email: doc.email,
      features: doc.features,
      preferences: doc.preferences,
      limits: doc.limits,
      onboarding: doc.onboarding, // include onboarding settings
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      updatedBy: doc.updatedBy,
      version: doc.version,
    };

    // Invalidate cache
    settingsCache.invalidate(adminId);
    
    // Cache the updated settings
    settingsCache.set(adminId, adminSettings);
    
    console.log(`✅ Updated admin settings for ${adminId}`);
    return adminSettings;
  } catch (error) {
    console.error("❌ Failed to update admin settings:", error);
    throw error;
  }
}

/**
 * Check if a specific feature is enabled for an admin
 */
export async function isFeatureEnabled(
  adminId: string,
  feature: keyof AdminSettings["features"]
): Promise<boolean> {
  // Core features are always enabled
  const coreFeatures = ['bookingDetection', 'calendarWidget', 'formSubmission'];
  if (coreFeatures.includes(feature)) {
    return true;
  }

  try {
    const settings = await getAdminSettings(adminId);
    return settings.features[feature] || false;
  } catch (error) {
    console.error(`❌ Failed to check feature ${feature} for ${adminId}:`, error);
    
    // Return default value based on feature
    const defaultFeatures = DEFAULT_ADMIN_SETTINGS.features;
    return defaultFeatures[feature] || false;
  }
}

/**
 * Get all admin settings (for admin panel listing)
 */
export async function getAllAdminSettings(): Promise<AdminSettings[]> {
  try {
    const collection = await getAdminSettingsCollection();
    return await collection.find({}).sort({ updatedAt: -1 }).toArray();
  } catch (error) {
    console.error("❌ Failed to get all admin settings:", error);
    return [];
  }
}

/**
 * Delete admin settings
 */
export async function deleteAdminSettings(adminId: string): Promise<boolean> {
  try {
    const collection = await getAdminSettingsCollection();
    const result = await collection.deleteOne({ adminId });
    
    // Invalidate cache
    settingsCache.invalidate(adminId);
    
    console.log(`✅ Deleted admin settings for ${adminId}`);
    return result.deletedCount > 0;
  } catch (error) {
    console.error("❌ Failed to delete admin settings:", error);
    return false;
  }
}

/**
 * Utility function to get admin ID from API key or request context
 */
export function extractAdminId(apiKey?: string, request?: any): string {
  // Try to extract from API key
  if (apiKey && apiKey.startsWith("ak_")) {
    // For now, use a simple hash of the API key as admin ID
    // In production, you'd have a proper API key -> admin ID mapping
    return Buffer.from(apiKey).toString("base64").slice(0, 12);
  }
  
  // Try to extract from request headers or session
  if (request?.headers?.["x-admin-id"]) {
    return request.headers["x-admin-id"];
  }
  
  // Default fallback
  return "default-admin";
}

/**
 * Middleware function to replace FeatureFlags class
 */
export class AdminFeatureFlags {
  private adminId: string;
  
  constructor(adminId: string) {
    this.adminId = adminId;
  }
  
  async getBookingDetection(): Promise<boolean> {
    return await isFeatureEnabled(this.adminId, "bookingDetection");
  }
  
  async getCalendarWidget(): Promise<boolean> {
    return await isFeatureEnabled(this.adminId, "calendarWidget");
  }
  
  async getFormSubmission(): Promise<boolean> {
    return await isFeatureEnabled(this.adminId, "formSubmission");
  }
  
  async getEmailIntegration(): Promise<boolean> {
    return await isFeatureEnabled(this.adminId, "emailIntegration");
  }
  
  async getAnalytics(): Promise<boolean> {
    return await isFeatureEnabled(this.adminId, "analytics");
  }
  
  async getVoiceEnabled(): Promise<boolean> {
    return await isFeatureEnabled(this.adminId, "voiceEnabled");
  }
  
  async getProactiveMessages(): Promise<boolean> {
    return await isFeatureEnabled(this.adminId, "proactiveMessages");
  }
}
