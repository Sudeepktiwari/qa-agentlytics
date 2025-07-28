import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface VoiceSettings {
  voiceEnabled: boolean;
  voiceGender: string;
  autoOpenProactive: boolean;
  updatedAt?: string;
}

const SETTINGS_FILE = path.join(process.cwd(), "data", "voice-settings.json");

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Default settings
const DEFAULT_SETTINGS = {
  voiceEnabled: true,
  voiceGender: "female",
  autoOpenProactive: true,
  updatedAt: new Date().toISOString(),
};

// Load settings from file
function loadSettings() {
  try {
    ensureDataDirectory();
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf8");
      return JSON.parse(data);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error loading voice settings:", error);
    return DEFAULT_SETTINGS;
  }
}

// Save settings to file
function saveSettings(settings: VoiceSettings) {
  try {
    ensureDataDirectory();
    const settingsWithTimestamp = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify(settingsWithTimestamp, null, 2)
    );
    return settingsWithTimestamp;
  } catch (error) {
    console.error("Error saving voice settings:", error);
    throw error;
  }
}

export async function GET() {
  try {
    const settings = loadSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error in GET /api/admin/voice-settings:", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the settings
    const validatedSettings = {
      voiceEnabled: Boolean(body.voiceEnabled),
      voiceGender: body.voiceGender === "male" ? "male" : "female",
      autoOpenProactive: Boolean(body.autoOpenProactive),
    };

    const savedSettings = saveSettings(validatedSettings);

    return NextResponse.json({
      success: true,
      settings: savedSettings,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/voice-settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
