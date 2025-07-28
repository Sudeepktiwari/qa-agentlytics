"use client";

import { useState, useEffect } from "react";

export default function VoiceSettingsAdmin() {
  const [settings, setSettings] = useState({
    voiceEnabled: true,
    voiceGender: "female",
    autoOpenProactive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load current settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/voice-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/voice-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save settings");
      }
    } catch (error) {
      setMessage("Error saving settings");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const testVoice = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        `Testing ${settings.voiceGender} voice. This is how the chatbot will sound by default.`
      );

      const voices = speechSynthesis.getVoices();
      let selectedVoice = null;

      if (settings.voiceGender === "female") {
        selectedVoice = voices.find(
          (voice) =>
            voice.name.toLowerCase().includes("female") ||
            voice.name.toLowerCase().includes("woman") ||
            voice.name.toLowerCase().includes("samantha") ||
            voice.name.toLowerCase().includes("karen")
        );
      } else {
        selectedVoice = voices.find(
          (voice) =>
            voice.name.toLowerCase().includes("male") ||
            voice.name.toLowerCase().includes("man") ||
            voice.name.toLowerCase().includes("daniel")
        );
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = 0.9;
      utterance.pitch = settings.voiceGender === "female" ? 1.1 : 0.9;
      utterance.volume = 0.8;

      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Chatbot Voice Settings
        </h1>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes("success")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Enable Voice */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.voiceEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, voiceEnabled: e.target.checked })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable Voice by Default
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              When enabled, new chat sessions will start with voice
              functionality active
            </p>
          </div>

          {/* Voice Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Default Voice Gender
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="voiceGender"
                  value="female"
                  checked={settings.voiceGender === "female"}
                  onChange={(e) =>
                    setSettings({ ...settings, voiceGender: e.target.value })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">Female Voice</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="voiceGender"
                  value="male"
                  checked={settings.voiceGender === "male"}
                  onChange={(e) =>
                    setSettings({ ...settings, voiceGender: e.target.value })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">Male Voice</span>
              </label>
            </div>
          </div>

          {/* Auto-open Proactive */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.autoOpenProactive}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoOpenProactive: e.target.checked,
                  })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Auto-open Chat for Proactive Messages
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Automatically open the chat window when sending proactive messages
            </p>
          </div>

          {/* Test Voice Button */}
          {settings.voiceEnabled && (
            <div>
              <button
                onClick={testVoice}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
              >
                🔊 Test Voice
              </button>
            </div>
          )}

          {/* Save Button */}
          <div>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ${
                isSaving
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
              }`}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            How it Works
          </h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• These settings become the default for all new chat sessions</p>
            <p>
              • Users can still override these settings in their individual
              chats
            </p>
            <p>• Changes take effect immediately for new chat sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
