// components/batches/batch-requirements/inventory-warnings-alert.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus, X } from "lucide-react";
import { useState } from "react";

interface ItemWithoutInventory {
  itemType: "material" | "packaging" | "label";
  itemId: string;
  itemName: string;
  supplierName: string;
}

interface InventoryWarningsAlertProps {
  items: ItemWithoutInventory[];
  onAddToInventory?: (item: ItemWithoutInventory) => void;
}

export function InventoryWarningsAlert({
  items,
  onAddToInventory,
}: InventoryWarningsAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (items.length === 0 || dismissed) {
    return null;
  }

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case "material":
        return "🧪";
      case "packaging":
        return "📦";
      case "label":
        return "🏷️";
      default:
        return "📦";
    }
  };

  return (
    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-3">
          <div>
            <AlertTitle className="text-yellow-900 dark:text-yellow-100 mb-1">
              {items.length} Item{items.length !== 1 ? "s" : ""} Not Tracked in
              Inventory
            </AlertTitle>
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              These items won&apos;t show accurate stock levels. Add them to
              inventory to track availability and prevent shortages.
            </AlertDescription>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={`${item.itemType}-${item.itemId}`}
                className="flex items-center justify-between p-2 rounded bg-yellow-100/50 dark:bg-yellow-900/20"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-lg">
                    {getItemTypeIcon(item.itemType)}
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
                // Handle add all to inventory
                items.forEach((item) => onAddToInventory?.(item));
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add All to Inventory
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-yellow-700 hover:text-yellow-900 dark:text-yellow-300 dark:hover:text-yellow-100"
              onClick={() => setDismissed(true)}
            >
              <X className="h-3 w-3 mr-1" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
}
