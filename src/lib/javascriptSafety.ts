/**
 * JavaScript Safety Utilities for Widget String Generation
 *
 * These utilities ensure that any strings used in dynamically generated
 * JavaScript code are properly escaped to prevent syntax errors.
 */

export class JavaScriptSafetyUtils {
  /**
   * Escape a string to be safely used within JavaScript string literals
   */
  static escapeForJavaScript(str: string): string {
    if (typeof str !== "string") {
      return "";
    }

    return str
      .replace(/\\/g, "\\\\") // Escape backslashes first
      .replace(/'/g, "\\'") // Escape single quotes
      .replace(/"/g, '\\"') // Escape double quotes
      .replace(/\n/g, "\\n") // Escape newlines
      .replace(/\r/g, "\\r") // Escape carriage returns
      .replace(/\t/g, "\\t") // Escape tabs
      .replace(/\u2028/g, "\\u2028") // Line separator
      .replace(/\u2029/g, "\\u2029") // Paragraph separator
      .replace(/\f/g, "\\f") // Form feed
      .replace(/\v/g, "\\v"); // Vertical tab
  }

  /**
   * Validate that a string is safe for JavaScript generation
   */
  static validateJavaScriptString(str: string): boolean {
    if (typeof str !== "string") {
      return false;
    }

    // Check for dangerous patterns that could break JavaScript
    const dangerousPatterns = [
      /\${/, // Template literal remnants
      /`/, // Backticks
      /<!--/, // HTML comments
      /<script/i, // Script tags
      /javascript:/i, // JavaScript protocols
      /on\w+\s*=/i, // Event handlers
      /eval\s*\(/i, // eval calls
      /Function\s*\(/i, // Function constructor
      /setTimeout\s*\(/i, // setTimeout with string
      /setInterval\s*\(/i, // setInterval with string
    ];

    return !dangerousPatterns.some((pattern) => pattern.test(str));
  }

  /**
   * Sanitize and limit string length for safe use
   */
  static sanitizeString(str: string, maxLength: number = 500): string {
    if (typeof str !== "string") {
      return "";
    }

    // Remove potentially dangerous characters
    let sanitized = str
      .replace(/<[^>]*>/g, "") // Remove HTML tags completely
      .replace(/[\u0000-\u001f\u007f-\u009f]/g, "") // Remove control characters
      .trim();

    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Create a safe JavaScript object string representation
   */
  static createSafeJSObject(obj: Record<string, any>): string {
    try {
      const safeObj: Record<string, any> = {};

      for (const [key, value] of Object.entries(obj)) {
        // Validate key is safe
        if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
          continue; // Skip unsafe keys
        }

        // Process value based on type
        if (typeof value === "string") {
          safeObj[key] = this.escapeForJavaScript(value);
        } else if (typeof value === "number" && isFinite(value)) {
          safeObj[key] = value;
        } else if (typeof value === "boolean") {
          safeObj[key] = value;
        } else if (value === null) {
          safeObj[key] = null;
        }
        // Skip other types (functions, undefined, objects, etc.)
      }

      return JSON.stringify(safeObj);
    } catch (error) {
      console.error("Error creating safe JS object:", error);
      return "{}";
    }
  }
}

/**
 * Response validation utilities
 */
export class ResponseValidator {
  /**
   * Validate and sanitize a chat response for safe widget use
   */
  static validateAndSanitize(response: any): SafeChatResponse {
    return {
      reply: this.sanitizeReply(response?.reply),
      showBookingCalendar: Boolean(response?.showBookingCalendar),
      bookingType: this.validateBookingType(response?.bookingType),
      calendarHtml: this.sanitizeHtml(response?.calendarHtml),
    };
  }

  /**
   * Sanitize reply text for safe use in widget
   */
  static sanitizeReply(reply: any): string {
    if (typeof reply !== "string") {
      return "I'd be happy to help you!";
    }

    const sanitized = JavaScriptSafetyUtils.sanitizeString(reply, 1000);

    if (!JavaScriptSafetyUtils.validateJavaScriptString(sanitized)) {
      return "I'd be happy to help you!";
    }

    return JavaScriptSafetyUtils.escapeForJavaScript(sanitized);
  }

  /**
   * Validate booking type is one of allowed values
   */
  static validateBookingType(type: any): BookingType | null {
    const allowedTypes: BookingType[] = [
      "demo",
      "call",
      "consultation",
      "support",
    ];

    if (
      typeof type === "string" &&
      allowedTypes.includes(type as BookingType)
    ) {
      return type as BookingType;
    }

    return null;
  }

  /**
   * Sanitize HTML content for safe injection
   */
  static sanitizeHtml(html: any): string | undefined {
    if (typeof html !== "string") {
      return undefined;
    }

    // Basic HTML validation - no script tags, event handlers, etc.
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:.*script/i,
      /vbscript:/i,
    ];

    if (dangerousPatterns.some((pattern) => pattern.test(html))) {
      return undefined;
    }

    // Limit size
    if (html.length > 50000) {
      return undefined;
    }

    return html;
  }
}

/**
 * Type definitions for safe responses
 */
export type BookingType = "demo" | "call" | "consultation" | "support";

export interface SafeChatResponse {
  reply: string;
  showBookingCalendar?: boolean;
  bookingType?: BookingType | null;
  calendarHtml?: string;
}

/**
 * Feature flags for gradual rollout
 */
export class FeatureFlags {
  private static flags = {
    BOOKING_DETECTION: process.env.ENABLE_BOOKING_DETECTION === "true",
    CALENDAR_WIDGET: process.env.ENABLE_CALENDAR_WIDGET === "true",
    FORM_SUBMISSION: process.env.ENABLE_FORM_SUBMISSION === "true",
    ADMIN_INTERFACE: process.env.ENABLE_ADMIN_INTERFACE === "true",
  };

  static isEnabled(feature: keyof typeof FeatureFlags.flags): boolean {
    return FeatureFlags.flags[feature] === true;
  }

  static getAllFlags(): Record<string, boolean> {
    return { ...FeatureFlags.flags };
  }

  // Direct access to flags for convenience
  static get ENABLE_BOOKING_DETECTION(): boolean {
    return FeatureFlags.flags.BOOKING_DETECTION;
  }

  static get ENABLE_CALENDAR_WIDGET(): boolean {
    return FeatureFlags.flags.CALENDAR_WIDGET;
  }

  static get ENABLE_FORM_SUBMISSION(): boolean {
    return FeatureFlags.flags.FORM_SUBMISSION;
  }

  static get ENABLE_ADMIN_INTERFACE(): boolean {
    return FeatureFlags.flags.ADMIN_INTERFACE;
  }
}
