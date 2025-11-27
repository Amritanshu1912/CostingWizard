// src/app/recipes/components/recipes-comparison/recipe-comparison.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useComparableItems,
  useComparisonSummary,
  useSelectedItems,
} from "@/hooks/use-comparison";
import { AlertCircle, GitCompare, Package } from "lucide-react";
import { useState } from "react";
import { SelectionTree, SummaryCards } from "./comparison-components";
import { ComparisonTable } from "./comparison-table";

// Main Component
export function RecipeComparison() {
  const allItems = useComparableItems();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedItems = useSelectedItems(selectedIds);
  const summary = useComparisonSummary(selectedItems);

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, id];
    });
  };

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

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Selection */}
      <Card className="w-80 flex-shrink-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            Select Items
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Choose up to 4 recipes or variants
          </p>
          {selectedIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="mt-2 w-full"
            >
              Clear Selection
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(100vh-15rem)]">
          <div className="p-4">
            <SelectionTree
              items={allItems}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              maxReached={selectedIds.length >= 4}
            />
          </div>
        </ScrollArea>
      </Card>

      {/* Right Panel - Comparison */}
      <div className="flex-1 min-w-0">
        {selectedItems.length > 0 ? (
          <div className="space-y-6">
            <SummaryCards summary={summary} />
            <ComparisonTable items={selectedItems} />
          </div>
        ) : (
          <Card className="p-8 flex items-center justify-center h-[calc(100vh-15rem)]">
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
