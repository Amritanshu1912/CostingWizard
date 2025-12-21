import { findSimilarItems } from "@/utils/shared-utils";
import { useCallback, useMemo, useState } from "react";

/**
 * Similar item for duplicate detection
 */
export interface SimilarItem {
  id: string;
  name: string;
  similarity: number; // 0-100
}

/**
 * Duplicate check result
 */
export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  exactMatch?: SimilarItem;
  similarItems: SimilarItem[];
  warning?: string;
}

/**
 * Generic duplicate checking hook - works with any item type
 * Usage: const { duplicateCheck, checkDuplicate, clearCheck } = useDuplicateCheck(items, currentId)
 */
export function useDuplicateCheck<T extends { id: string; name: string }>(
  items: T[],
  currentId?: string
) {
  const [searchTerm, setSearchTerm] = useState("");

  const duplicateCheck = useMemo<DuplicateCheckResult>(() => {
    if (!searchTerm || searchTerm.length < 2) {
      return { hasDuplicates: false, similarItems: [] };
    }

    const similar = findSimilarItems(searchTerm, items, currentId, 2);

    if (similar.length === 0) {
      return { hasDuplicates: false, similarItems: [] };
    }

    const exactMatch = similar.find(
      (s) => s.name.toLowerCase() === searchTerm.toLowerCase()
    );

    const similarItems: SimilarItem[] = similar
      .map((item) => {
        const normalizedSearch = searchTerm.toLowerCase();
        const normalizedItem = item.name.toLowerCase();

        let similarity = 0;
        if (normalizedSearch === normalizedItem) {
          similarity = 100;
        } else if (normalizedItem.includes(normalizedSearch)) {
          similarity = 80;
        } else if (normalizedSearch.includes(normalizedItem)) {
          similarity = 70;
        } else {
          const searchChars = new Set(normalizedSearch.split(""));
          const itemChars = normalizedItem.split("");
          const overlap = itemChars.filter((c) => searchChars.has(c)).length;
          similarity = Math.round(
            (overlap /
              Math.max(normalizedSearch.length, normalizedItem.length)) *
              60
          );
        }

        return { id: item.id, name: item.name, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity);

    let warning: string | undefined;
    if (exactMatch) {
      warning = `"${exactMatch.name}" already exists`;
    } else if (similarItems.length > 0) {
      const topMatches = similarItems.slice(0, 2);
      warning =
        topMatches.length === 1
          ? `Similar item found: "${topMatches[0].name}"`
          : `Similar items found: "${topMatches[0].name}" and "${topMatches[1].name}"`;
    }

    return {
      hasDuplicates: true,
      exactMatch: exactMatch
        ? { id: exactMatch.id, name: exactMatch.name, similarity: 100 }
        : undefined,
      similarItems,
      warning,
    };
  }, [searchTerm, items, currentId]);

  const checkDuplicate = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearCheck = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    duplicateCheck,
    checkDuplicate,
    clearCheck,
    hasDuplicates: duplicateCheck.hasDuplicates,
    warning: duplicateCheck.warning,
  };
}
