// src/app/recipes/components/recipes-comparison/recipe-comparison.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useComparableItems,
  useComparisonData,
  useComparisonSummary,
} from "@/hooks/recipe-hooks/use-recipe-comparison";
import { AlertCircle, GitCompare, Package } from "lucide-react";
import { useCallback, useState } from "react";
import { SelectionTree, SummaryCards } from "./comparison-components";
import { ComparisonTable } from "./comparison-table";

const MAX_SELECTIONS = 4;

/**
 * Recipe comparison main component
 */
export function RecipeComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // DATA FETCHING (Using New Hooks)
  const allItems = useComparableItems(); // All recipes + variants
  const selectedItems = useComparisonData(selectedIds); // Only selected items
  const summary = useComparisonSummary(selectedItems); // Summary stats

  // HANDLERS
  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      // Deselect if already selected
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }

      // Don't select if max reached
      if (prev.length >= MAX_SELECTIONS) {
        return prev;
      }

      // Select
      return [...prev, id];
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // RENDER - Empty State (No Recipes)

  if (allItems.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">No Recipes Available</h3>
          <p className="text-sm">
            Create recipes first to start comparing them
          </p>
        </div>
      </Card>
    );
  }

  // RENDER - Main Comparison View
  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* ===== LEFT: Selection Sidebar ===== */}
      <Card className="w-80 flex-shrink-0 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            Select Items
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Choose up to {MAX_SELECTIONS} recipes or variants
          </p>

          {/* Selection Counter */}
          <div className="mt-2 text-xs font-medium">
            {selectedIds.length} / {MAX_SELECTIONS} selected
          </div>

          {/* Clear Button */}
          {selectedIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="mt-2 w-full"
            >
              Clear Selection
            </Button>
          )}
        </div>

        {/* Selection Tree */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <SelectionTree
              items={allItems}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              maxReached={selectedIds.length >= MAX_SELECTIONS}
            />
          </div>
        </ScrollArea>
      </Card>

      {/* ===== RIGHT: Comparison Panel ===== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {selectedItems.length > 0 ? (
          // Show comparison when items selected
          <div className="space-y-6">
            <SummaryCards summary={summary} />
            <ComparisonTable items={selectedItems} />
          </div>
        ) : (
          // Empty state - No selections
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground max-w-md">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">Select Items to Compare</h3>
              <p className="text-sm">
                Choose recipes or variants from the list on the left to see
                detailed comparisons
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
