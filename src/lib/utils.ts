import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to DD-MM-YYYY string consistently across the app
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Normalizes a name for case-insensitive, whitespace-robust comparison
 */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Checks if two names are exact duplicates after normalization
 */
export function isExactDuplicate(
  existingName: string,
  newName: string
): boolean {
  return normalizeName(existingName) === normalizeName(newName);
}

/**
 * Calculates Levenshtein distance between two strings (for fuzzy matching)
 * Used to detect similar names (e.g., typos)
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

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
 * Checks for fuzzy similarity between names (Levenshtein distance < 3 or separator variations)
 */
export function isFuzzyMatch(existingName: string, newName: string): boolean {
  const normalizedA = normalizeName(existingName);
  const normalizedB = normalizeName(newName);

  // Exact match after normalization
  if (normalizedA === normalizedB) return true;

  // Levenshtein distance check
  if (levenshteinDistance(normalizedA, normalizedB) < 3) return true;

  // Separator variation check (space vs dash/underscore)
  const separatorsRegex = /[-_\s]+/g;
  const normalizedAWithoutSeparators = normalizedA.replace(separatorsRegex, "");
  const normalizedBWithoutSeparators = normalizedB.replace(separatorsRegex, "");

  return normalizedAWithoutSeparators === normalizedBWithoutSeparators;
}

/**
 * Debounce function to limit how often a function is called
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
 * Checks for similar items and returns appropriate warning message
 * Used for real-time duplicate prevention in dialogs
 */
export function checkForSimilarItems(
  searchTerm: string,
  items: Array<{ name: string }>,
  itemType: "material" | "packaging" | "label" = "material"
): string | null {
  if (!searchTerm || searchTerm.length < 2) {
    return null;
  }

  const normalized = normalizeName(searchTerm);

  // Check exact match first
  const exactMatch = items.find(
    (item) => normalizeName(item.name) === normalized
  );

  if (exactMatch) {
    const typeLabel = itemType.charAt(0).toUpperCase() + itemType.slice(1);
    return `${typeLabel} "${exactMatch.name}" already exists. Select it from dropdown.`;
  }

  // Check fuzzy matches
  const similar = items.filter((item) => {
    const itemName = normalizeName(item.name);

    // Levenshtein distance
    const distance = levenshteinDistance(normalized, itemName);
    if (distance <= 2) return true;

    // Separator variation check (space vs dash/underscore)
    const separatorsRegex = /[-_\s]+/g;
    const normalizedWithoutSeparators = normalized.replace(separatorsRegex, "");
    const itemWithoutSeparators = itemName.replace(separatorsRegex, "");

    return normalizedWithoutSeparators === itemWithoutSeparators;
  });

  if (similar.length > 0) {
    const typeLabel = itemType.charAt(0).toUpperCase() + itemType.slice(1);
    return `Similar ${itemType} found: "${similar[0].name}". Did you mean that?`;
  }

  return null;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use checkForSimilarItems instead
 */
export function checkForSimilarMaterials(
  searchTerm: string,
  materials: Array<{ name: string }>
): string | null {
  return checkForSimilarItems(searchTerm, materials, "material");
}

/**
 * Gets initials from a name string
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
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return "text-green-600";
  if (rating >= 3.5) return "text-yellow-600";
  return "text-red-600";
}
