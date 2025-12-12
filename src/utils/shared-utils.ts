// src/utils/shared-utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges CSS classes using clsx and tailwind-merge
 * Handles conditional classes and Tailwind CSS class conflicts
 *
 * @param inputs - CSS class values to combine
 * @returns Merged CSS class string
 *
 * @example
 * cn("text-red-500", condition && "bg-blue-500", "p-4")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ================================================================================================
 * STRING NORMALIZATION & COMPARISON UTILITIES
 * ================================================================================================
 */

/**
 * Normalize text for comparison (trim and lowercase)
 *
 * @param text - String to normalize
 * @returns Normalized lowercase string
 *
 * @example
 * normalizeText("  Hello WORLD  ") // "hello world"
 */
export function normalizeText(text: string): string {
  return text.trim().toLowerCase();
}

/**
 * Checks if two strings are exact duplicates after normalization
 * Performs case-insensitive and whitespace-tolerant comparison
 *
 * @param string1 - Existing string to compare against
 * @param string2 - New string to check
 * @returns True if strings are exact duplicates
 *
 * @example
 * isExactDuplicate("John Doe", "  john DOE  ") // true
 */
export function isExactDuplicate(string1: string, string2: string): boolean {
  return normalizeText(string1) === normalizeText(string2);
}

/**
 * ================================================================================================
 * FUZZY STRING MATCHING & SIMILARITY
 * ================================================================================================
 */

/**
 * Calculates Levenshtein distance between two strings (edit distance)
 * Measures minimum number of single-character edits needed to transform one string into another
 * Used for detecting typos and similar names in fuzzy matching
 *
 * @param a - First string
 * @param b - Second string
 * @returns Edit distance (number of changes needed)
 *
 * @example
 * levenshteinDistance("kitten", "kitten") // 0
 * levenshteinDistance("kitten", "sitten") // 1 (substitution)
 * levenshteinDistance("kitten", "ittens") // 2 (deletion + insertion)
 */
export function levenshteinDistance(a: string, b: string): number {
  // Early return for identical strings
  if (a === b) return 0;

  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  // Initialize first row and column
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  // Fill the matrix
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Checks if two normalized strings are similar considering separator variations
 * Helper function for separator-based similarity detection
 *
 * @param normalizedStr1 - First normalized string
 * @param normalizedStr2 - Second normalized string
 * @returns True if strings are similar after removing separators
 */
function areSimilarIgnoringSeparators(
  normalizedStr1: string,
  normalizedStr2: string
): boolean {
  // Remove all separators (spaces, dashes, underscores)
  const clean1 = normalizedStr1.replace(/[-_\s]+/g, "");
  const clean2 = normalizedStr2.replace(/[-_\s]+/g, "");
  return clean1 === clean2;
}

/**
 * Checks for fuzzy similarity between names using multiple strategies
 * Combines exact matching, Levenshtein distance, and separator variation checks
 *
 * @param existingName - Existing name to compare
 * @param newName - New name to check for similarity
 * @returns True if names are similar or identical
 *
 * @example
 * isFuzzyMatch("John-Doe", "John Doe") // true (separator variation)
 * isFuzzyMatch("John", "Jon") // true (edit distance < 3)
 */
export function isFuzzyMatch(existingName: string, newName: string): boolean {
  const normalizedA = normalizeText(existingName);
  const normalizedB = normalizeText(newName);

  // Exact match after normalization
  if (normalizedA === normalizedB) return true;

  // Levenshtein distance check (allows for typos)
  if (levenshteinDistance(normalizedA, normalizedB) < 3) return true;

  // Separator variation check
  return areSimilarIgnoringSeparators(normalizedA, normalizedB);
}

/**
 * Check if two strings are similar (considering space/dash variations)
 * Lightweight version focusing only on separator variations
 *
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @returns True if strings are similar
 *
 * @example
 * areStringsSimilar("John-Doe", "John Doe") // true
 * areStringsSimilar("hello_world", "hello world") // true
 */
export function areStringsSimilar(str1: string, str2: string): boolean {
  const normalized1 = normalizeText(str1);
  const normalized2 = normalizeText(str2);

  // Exact match
  if (normalized1 === normalized2) return true;

  // Separator variation check
  return areSimilarIgnoringSeparators(normalized1, normalized2);
}

/**
 * ================================================================================================
 * DUPLICATE PREVENTION & SIMILARITY DETECTION
 * ================================================================================================
 */

/**
 * Checks for similar items and returns appropriate warning message
 * Used for real-time duplicate prevention in creation/editing dialogs
 *
 * @param searchTerm - Current search/input term
 * @param items - Array of existing items to check against
 * @param itemType - Type of item for user-friendly messages
 * @returns Warning message or null if no issues found
 *
 * @example
 * checkForSimilarItems("John Doe", existingMaterials, "material")
 * // Returns: "Material "John Doe" already exists. Select it from dropdown."
 */
export function checkForSimilarItems(
  searchTerm: string,
  items: Array<{ name: string }>,
  itemType: "material" | "packaging" | "label" = "material"
): string | null {
  if (!searchTerm || searchTerm.length < 2) {
    return null;
  }

  const normalized = normalizeText(searchTerm);

  // Check exact match first
  const exactMatch = items.find(
    (item) => normalizeText(item.name) === normalized
  );

  if (exactMatch) {
    const typeLabel = itemType.charAt(0).toUpperCase() + itemType.slice(1);
    return `${typeLabel} "${exactMatch.name}" already exists. Select it from dropdown.`;
  }

  // Check fuzzy matches using multiple strategies
  const similar = items.filter((item) => {
    const itemName = normalizeText(item.name);

    // Levenshtein distance check (typos)
    const distance = levenshteinDistance(normalized, itemName);
    if (distance <= 2) return true;

    // Separator variation check (space vs dash/underscore)
    const separatorsRegex = /[-_\s]+/g;
    const normalizedWithoutSeparators = normalized.replace(separatorsRegex, "");
    const itemWithoutSeparators = itemName.replace(separatorsRegex, "");

    return normalizedWithoutSeparators === itemWithoutSeparators;
  });

  if (similar.length > 0) {
    return `Similar ${itemType} found: "${similar[0].name}". Did you mean that?`;
  }

  return null;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use checkForSimilarItems instead
 *
 * @param searchTerm - Search term to check
 * @param materials - Array of materials to check against
 * @returns Warning message or null
 *
 * @example
 * checkForSimilarMaterials("Steel", existingMaterials) // Legacy usage
 */
export function checkForSimilarMaterials(
  searchTerm: string,
  materials: Array<{ name: string }>
): string | null {
  return checkForSimilarItems(searchTerm, materials, "material");
}

/**
 * Find similar items in an array based on name field
 * Advanced similarity detection combining multiple algorithms
 *
 * @template T - Item type that extends base item structure
 * @param searchTerm - Term to search for
 * @param items - Array of items to search in
 * @param currentId - ID of current item (to exclude from results when editing)
 * @param threshold - Maximum Levenshtein distance to consider similar (default: 2)
 * @returns Array of similar items
 *
 * @example
 * findSimilarItems("John", users, "user123") // Excludes user123 from results
 */
export function findSimilarItems<T extends { id: string; name: string }>(
  searchTerm: string,
  items: T[],
  currentId?: string,
  threshold: number = 2
): T[] {
  const normalized = normalizeText(searchTerm);

  return items.filter((item) => {
    // Skip current item if editing
    if (currentId && item.id === currentId) return false;

    const itemName = normalizeText(item.name);

    // Check Levenshtein distance (edit distance)
    const distance = levenshteinDistance(normalized, itemName);
    if (distance <= threshold) return true;

    // Check space/dash variations (separator differences)
    if (areStringsSimilar(searchTerm, item.name)) return true;

    return false;
  });
}

/**
 * ================================================================================================
 * FUNCTIONAL UTILITIES
 * ================================================================================================
 */

/**
 * Debounce function to limit how often a function is called
 * Useful for search inputs, API calls, and other frequent operations
 *
 * @template T - Function type to debounce
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with same signature
 *
 * @example
 * const debouncedSearch = debounce((query) => api.search(query), 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * ================================================================================================
 * UI HELPERS & FORMATTING
 * ================================================================================================
 */

/**
 * Gets initials from a name string
 * Creates 1-2 character initials for avatars and user identification
 *
 * @param name - Full name string
 * @returns Uppercase initials (1-2 characters)
 *
 * @example
 * getInitials("John Doe") // "JD"
 * getInitials("Alice") // "AL"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Gets rating color class based on rating value
 * Maps numerical ratings to Tailwind CSS color classes
 *
 * @param rating - Numerical rating (typically 1-5 scale)
 * @returns Tailwind CSS text color class
 *
 * @example
 * getRatingColor(4.8) // "text-green-600"
 * getRatingColor(3.2) // "text-yellow-600"
 * getRatingColor(2.1) // "text-red-600"
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return "text-green-600";
  if (rating >= 3.5) return "text-yellow-600";
  return "text-red-600";
}
