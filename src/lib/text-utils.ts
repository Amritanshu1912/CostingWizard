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
export function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[len1][len2];
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