// components/batches/batch-requirements/index.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { ProductionBatch } from "@/lib/types";
import { AlertCircle } from "lucide-react";
import { useBatchRequirements } from "../../hooks/use-batches";
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
          </div>
        </div>
      )}

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
