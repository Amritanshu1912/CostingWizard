// components/batches/batch-requirements/index.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductionBatch } from "@/types/shared-types";
import { AlertCircle } from "lucide-react";
import { useBatchRequirements } from "@/hooks/batch-hooks/use-batches";
import { InventoryWarningsAlert } from "./inventory-warnings-alert";
import { ProductWiseRequirements } from "./product-wise-requirements";
import { RequirementsCategoryList } from "./requirements-category-list";
import { RequirementsOverview } from "./requirements-overview";
import { SupplierWiseRequirements } from "./supplier-wise-requirements";

interface BatchRequirementsProps {
  batch: ProductionBatch;
}

export function BatchRequirements({ batch }: BatchRequirementsProps) {
  const requirements = useBatchRequirements(batch.id);

  if (!requirements) {
    return <RequirementsLoadingState />;
  }

  const handleSupplierClick = () => {
    // Scroll to supplier section
    document.getElementById("supplier-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleShortageClick = () => {
    // Scroll to categories section
    document.getElementById("categories-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleAddToInventory = (item: any) => {
    console.log("Add to inventory:", item);
    // TODO: Implement add to inventory logic
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <RequirementsOverview
        requirements={requirements}
        onSupplierClick={handleSupplierClick}
        onShortageClick={handleShortageClick}
      />

      {/* Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inventory Warnings */}
        {requirements.itemsWithoutInventory &&
          requirements.itemsWithoutInventory.length > 0 && (
            <InventoryWarningsAlert
              items={requirements.itemsWithoutInventory}
              onAddToInventory={handleAddToInventory}
            />
          )}

        {/* Critical Shortages Alert */}
        {requirements.criticalShortages.length > 0 && (
          <div className="p-4 border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                    Critical Shortages Detected
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {requirements.criticalShortages.length} items are currently
                    short of stock. Production cannot start until these are
                    procured.
                  </p>
                </div>

                <div className="space-y-2">
                  {requirements.criticalShortages.map((item) => (
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

      {/* Requirements by Category */}
      <div id="categories-section">
        <RequirementsCategoryList
          materials={requirements.materials}
          packaging={requirements.packaging}
          labels={requirements.labels}
          totalMaterialCost={requirements.totalMaterialCost}
          totalPackagingCost={requirements.totalPackagingCost}
          totalLabelCost={requirements.totalLabelCost}
        />
      </div>

      {/* Supplier-wise Requirements */}
      <div id="supplier-section">
        <SupplierWiseRequirements
          suppliers={requirements.bySupplier}
          onGeneratePO={(supplierId) => {
            console.log("Generate PO for:", supplierId);
            // TODO: Implement PO generation
          }}
          onContactSupplier={(supplierId) => {
            console.log("Contact supplier:", supplierId);
            // TODO: Implement supplier contact
          }}
        />
      </div>

      {/* Product-wise Requirements */}
      {requirements.byProduct && (
        <ProductWiseRequirements products={requirements.byProduct} />
      )}
    </div>
  );
}

function RequirementsLoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-96" />
    </div>
  );
}
