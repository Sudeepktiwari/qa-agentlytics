/**
 * Admin Settings Panel Component
 * Provides UI for managing feature flags and admin preferences
 */

"use client";

import React, { useState, useEffect } from "react";

interface AdminSettings {
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
      days: number[];
    };
    autoResponses: boolean;
    leadCapture: boolean;
  };
  limits: {
    monthlyInteractions: number;
    maxConcurrentChats: number;
    storageGB: number;
  };
  updatedAt: string;
  updatedBy: string;
}

interface FeatureToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  loading?: boolean;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({
  label,
  description,
  enabled,
  onToggle,
  loading = false,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{label}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="ml-4">
        <button
          type="button"
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
            enabled ? "bg-blue-600" : "bg-gray-200"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          role="switch"
          aria-checked={enabled}
          onClick={() => !loading && onToggle(!enabled)}
          disabled={loading}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export const AdminSettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load admin settings on component mount
  useEffect(() => {
    fetchAdminSettings();
  }, []);

  const fetchAdminSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        setError(null);
      } else {
        setError(data.error || "Failed to load admin settings");
      }
    } catch (err) {
      setError("Failed to fetch admin settings");
      console.error("❌ Failed to fetch admin settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateFeature = async (feature: string, enabled: boolean) => {
    if (!settings) return;

    try {
      setUpdating(feature);
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: settings.adminId,
          feature,
          enabled,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        setSuccess(`Feature ${feature} ${enabled ? "enabled" : "disabled"} successfully`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || "Failed to update feature");
      }
    } catch (err) {
      setError("Failed to update feature");
      console.error("❌ Failed to update feature:", err);
    } finally {
      setUpdating(null);
    }
  };

  const updatePreferences = async (preferences: Partial<AdminSettings["preferences"]>) => {
    if (!settings) return;

    try {
      setUpdating("preferences");
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: settings.adminId,
          updates: { preferences: { ...settings.preferences, ...preferences } },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        setSuccess("Preferences updated successfully");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || "Failed to update preferences");
      }
    } catch (err) {
      setError("Failed to update preferences");
      console.error("❌ Failed to update preferences:", err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-red-600 text-center">
          <p className="font-medium">Error loading admin settings</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchAdminSettings}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-center text-gray-500">No admin settings found</p>
      </div>
    );
  }

  const featureDescriptions = {
    // Core features (always enabled) - not shown in toggles
    bookingDetection: "Automatically detect booking intent in user messages",
    calendarWidget: "Enable calendar widget for appointment scheduling", 
    formSubmission: "Allow form submissions and lead capture",
    // Optional features that can be toggled
    emailIntegration: "Enable email notifications and integrations",
    analytics: "Track and analyze chat interactions",
    voiceEnabled: "Enable voice chat functionality",
    proactiveMessages: "Send proactive messages to users",
  };

  // Core features that are always enabled (don't show toggles for these)
  const coreFeatures = ['bookingDetection', 'calendarWidget', 'formSubmission'];
  
  // Optional features that can be toggled
  const toggleableFeatures = Object.entries(settings.features).filter(
    ([feature]) => !coreFeatures.includes(feature)
  );

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Feature Flags Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Feature Configuration</h2>
        
        {/* Core Features (Always Enabled) */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">Core Features (Always Enabled)</h3>
          <div className="space-y-3">
            {coreFeatures.map((feature) => (
              <div key={feature} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">
                    {feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1')}
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    {featureDescriptions[feature as keyof typeof featureDescriptions]}
                  </p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Always Enabled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Features (Toggleable) */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Optional Features</h3>
          <div className="space-y-4">
            {toggleableFeatures.map(([feature, enabled]) => (
              <FeatureToggle
                key={feature}
                label={feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1')}
                description={featureDescriptions[feature as keyof typeof featureDescriptions]}
                enabled={enabled}
                onToggle={(newEnabled) => updateFeature(feature, newEnabled)}
                loading={updating === feature}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={settings.preferences.theme}
              onChange={(e) => updatePreferences({ theme: e.target.value as "light" | "dark" | "auto" })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={updating === "preferences"}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.preferences.timezone}
              onChange={(e) => updatePreferences({ timezone: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={updating === "preferences"}
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Hours Start
            </label>
            <input
              type="time"
              value={settings.preferences.businessHours.start}
              onChange={(e) => updatePreferences({
                businessHours: { ...settings.preferences.businessHours, start: e.target.value }
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={updating === "preferences"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Hours End
            </label>
            <input
              type="time"
              value={settings.preferences.businessHours.end}
              onChange={(e) => updatePreferences({
                businessHours: { ...settings.preferences.businessHours, end: e.target.value }
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={updating === "preferences"}
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <FeatureToggle
            label="Auto Responses"
            description="Automatically respond to common questions"
            enabled={settings.preferences.autoResponses}
            onToggle={(enabled) => updatePreferences({ autoResponses: enabled })}
            loading={updating === "preferences"}
          />

          <FeatureToggle
            label="Lead Capture"
            description="Capture visitor information for follow-up"
            enabled={settings.preferences.leadCapture}
            onToggle={(enabled) => updatePreferences({ leadCapture: enabled })}
            loading={updating === "preferences"}
          />
        </div>
      </div>

      {/* Admin Info */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Admin Information</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Admin ID:</span> {settings.adminId}</p>
          <p><span className="font-medium">Email:</span> {settings.email}</p>
          <p><span className="font-medium">Last Updated:</span> {new Date(settings.updatedAt).toLocaleString()}</p>
          <p><span className="font-medium">Updated By:</span> {settings.updatedBy}</p>
        </div>
      </div>
    </div>
  );
};
