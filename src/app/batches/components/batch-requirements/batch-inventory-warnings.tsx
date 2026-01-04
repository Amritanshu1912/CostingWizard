// src/app/batches/components/batch-requirements/batch-inventory-warnings.tsx
"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RequirementItem } from "@/types/batch-types";
import type { ItemWithoutInventory } from "@/types/shared-types";

interface BatchInventoryWarningsProps {
  itemsWithoutInventory: ItemWithoutInventory[];
  criticalShortages: RequirementItem[];
  onAddToInventory?: (item: ItemWithoutInventory) => void;
}

/**
 * Inventory warnings component
 * Shows alerts for untracked items and critical shortages
 */
export function BatchInventoryWarnings({
  itemsWithoutInventory,
  criticalShortages,
  onAddToInventory,
}: BatchInventoryWarningsProps) {
  const [dismissedUntracked, setDismissedUntracked] = useState(false);

  // Don't render if no warnings
  if (itemsWithoutInventory.length === 0 && criticalShortages.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Items Without Inventory Tracking */}
      {itemsWithoutInventory.length > 0 && !dismissedUntracked && (
        <div className="p-4 border-2 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  {itemsWithoutInventory.length} Item
                  {itemsWithoutInventory.length !== 1 ? "s" : ""} Not Tracked in
                  Inventory
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  These items won&apos;t show accurate stock levels. Add them to
                  inventory to track availability and prevent shortages.
                </p>
              </div>

              <div className="space-y-2">
                {itemsWithoutInventory.map((item) => (
                  <div
                    key={`${item.itemType}-${item.itemId}`}
                    className="flex items-center justify-between p-2 rounded bg-yellow-100/50 dark:bg-yellow-900/20"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">
                        {item.itemType === "material" && "🧪"}
                        {item.itemType === "packaging" && "📦"}
                        {item.itemType === "label" && "🏷️"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.itemName}
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          {item.supplierName}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs bg-yellow-200 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-800"
                    >
                      {item.itemType}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-yellow-300 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                  onClick={() => {
                    itemsWithoutInventory.forEach((item) =>
                      onAddToInventory?.(item)
                    );
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add All to Inventory
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-yellow-700 hover:text-yellow-900 dark:text-yellow-300 dark:hover:text-yellow-100"
                  onClick={() => setDismissedUntracked(true)}
                >
                  <X className="h-3 w-3 mr-1" />
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Shortages */}
      {criticalShortages.length > 0 && (
        <div className="p-4 border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Critical Shortages Detected
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {criticalShortages.length} items are currently short of stock.
                  Production cannot start until these are procured.
                </p>
              </div>

              <div className="space-y-2">
                {criticalShortages.map((item) => (
                  <div
                    key={`${item.itemType}-${item.itemId}-${item.supplierId}`}
                    className="flex items-center justify-between p-2 rounded bg-red-100/50 dark:bg-red-900/20"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">
                        {item.itemType === "material" && "🧪"}
                        {item.itemType === "packaging" && "📦"}
                        {item.itemType === "label" && "🏷️"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.itemName}
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          {item.supplierName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="text-xs bg-red-200 dark:bg-red-900 border-red-300 dark:border-red-800"
                      >
                        Shortage: {item.shortage.toFixed(2)} {item.unit}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
