// lib/text-utils.ts

/**
 * Normalize text for comparison (trim and lowercase)
 */
export function normalizeText(text: string): string {
    return text.trim().toLowerCase();
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
/**
 * Calculates the Levenshtein distance (edit distance) between two strings.
 * Optimized for readability + performance.
 */
export function levenshteinDistance(a: string, b: string): number {
    // --- Normalize inputs ---
    const str1 = a.toLowerCase().trim().replace(/[-_\s]+/g, "");
    const str2 = b.toLowerCase().trim().replace(/[-_\s]+/g, "");

    const len1 = str1.length;
    const len2 = str2.length;

    // --- Quick exits ---
    if (str1 === str2) return 0;
    if (len1 === 0) return len2;
    if (len2 === 0) return len1;

    // Ensure str1 is the longer one (memory optimization)
    if (len1 < len2) return levenshteinDistance(str2, str1);

    // --- Core logic ---
    let previousRow = Array.from({ length: len2 + 1 }, (_, i) => i);
    let currentRow = new Array(len2 + 1);

    for (let i = 0; i < len1; i++) {
        currentRow[0] = i + 1;

        for (let j = 0; j < len2; j++) {
            const cost = str1[i] === str2[j] ? 0 : 1;

            currentRow[j + 1] = Math.min(
                previousRow[j + 1] + 1, // deletion
                currentRow[j] + 1,      // insertion
                previousRow[j] + cost   // substitution
            );
        }

        // Swap rows for next iteration
        [previousRow, currentRow] = [currentRow, previousRow];
    }

    return previousRow[len2];
}


/**
 * Check if two strings are similar (considering space/dash variations)
 */
export function areStringsSimilar(str1: string, str2: string): boolean {
    const normalized1 = normalizeText(str1);
    const normalized2 = normalizeText(str2);

    // Exact match
    if (normalized1 === normalized2) return true;

    // Check with space/dash/underscore variations
    const variant1 = normalized1.replace(/[-_\s]/g, '');
    const variant2 = normalized2.replace(/[-_\s]/g, '');

    return variant1 === variant2;
}

/**
 * Find similar items in an array based on name field
 */
export function findSimilarItems<T extends { id: string; name: string }>(
    searchTerm: string,
    items: T[],
    currentId?: string,
    threshold: number = 2
): T[] {
    const normalized = normalizeText(searchTerm);

    return items.filter(item => {
        // Skip current item if editing
        if (currentId && item.id === currentId) return false;

        const itemName = normalizeText(item.name);

        // Check Levenshtein distance
        const distance = levenshteinDistance(normalized, itemName);
        if (distance <= threshold) return true;

        // Check space/dash variations
        if (areStringsSimilar(searchTerm, item.name)) return true;

        return false;
    });
}