// src/utils/formatting-utils.ts
// Consolidated formatting utilities for consistent display across the application

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Formats number as Indian Rupee currency with consistent decimals
 * @param value - Amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "₹1,234.56")
 */
export function formatINR(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Formats date for display in various consistent formats
 * @param date - Date string or Date object
 * @param formatType - Type of format to return
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  formatType: "short" | "long" | "datetime" | "iso" | "compact" = "short"
): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Invalid date";

  switch (formatType) {
    case "short":
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(dateObj);

    case "long":
      return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(dateObj);

    case "datetime":
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(dateObj);

    case "iso":
      return dateObj.toISOString().split("T")[0]; // YYYY-MM-DD

    case "compact":
      return `${String(dateObj.getDate()).padStart(2, "0")}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${dateObj.getFullYear()}`;

    default:
      return dateObj.toLocaleDateString();
  }
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Formats number with consistent decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Formats percentage with consistent styling
 * @param value - Percentage value (e.g., 15.5 for 15.5%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "15.5%")
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats large numbers in compact notation (1k, 1M, etc.)
 * @param value - Number to format
 * @returns Compact formatted string
 */
export function formatCompactNumber(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
}

/**
 * Formats file sizes in human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ============================================================================
// TEXT FORMATTING
// ============================================================================

/**
 * Truncates string with ellipsis if too long
 * @param str - String to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string with ellipsis
 */
export function truncateText(
  str: string | undefined,
  maxLength: number = 80
): string {
  if (!str) return "";
  return str.length > maxLength ? str.slice(0, maxLength - 1) + "…" : str;
}

/**
 * Converts string to title case
 * @param str - String to convert
 * @returns Title case string
 */
export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Creates initials from a name string
 * @param name - Full name
 * @param maxInitials - Maximum number of initials (default: 2)
 * @returns Initials string (e.g., "JD" for "John Doe")
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, maxInitials);
}

// ============================================================================
// QUANTITY & UNIT FORMATTING
// ============================================================================

/**
 * Formats quantity with unit in a consistent way
 * @param quantity - Numeric quantity
 * @param unit - Unit string (e.g., "kg", "pcs")
 * @param decimals - Decimal places for quantity (default: 2)
 * @returns Formatted quantity string (e.g., "1.50 kg")
 */
export function formatQuantity(
  quantity: number,
  unit: string,
  decimals: number = 2
): string {
  return `${formatNumber(quantity, decimals)} ${unit}`;
}

/**
 * Formats price per unit consistently
 * @param price - Unit price
 * @param unit - Unit string
 * @returns Formatted price string (e.g., "₹150.00/kg")
 */
export function formatPricePerUnit(price: number, unit: string): string {
  return `${formatINR(price)}/${unit}`;
}

// ============================================================================
// VALIDATION & SANITIZATION
// ============================================================================

/**
 * Sanitizes string input by trimming whitespace
 * @param input - String to sanitize
 * @returns Trimmed string or empty string if null/undefined
 */
export function sanitizeString(input: string | null | undefined): string {
  return input?.trim() || "";
}

/**
 * Checks if a value is a valid number
 * @param value - Value to check
 * @returns True if value is a finite number
 */
export function isValidNumber(value: any): boolean {
  return typeof value === "number" && isFinite(value) && !isNaN(value);
}
