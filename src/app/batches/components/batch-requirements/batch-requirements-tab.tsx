// src/app/batches/components/batch-requirements/batch-requirements-tab.tsx
"use client";

import type { BatchRequirementsAnalysis } from "@/types/batch-types";
import { BatchRequirementsOverview } from "./batch-requirements-overview";
import { BatchInventoryWarnings } from "./batch-inventory-warnings";
import { BatchRequirementsCategories } from "./batch-requirements-categories";
import { BatchRequirementsSuppliers } from "./batch-requirements-suppliers";
import { BatchRequirementsProducts } from "./batch-requirements-products";

interface BatchRequirementsTabProps {
  requirements: BatchRequirementsAnalysis;
}

/**
 * Batch requirements tab component
 * Displays procurement requirements with inventory integration
 */
export function BatchRequirementsTab({
  requirements,
}: BatchRequirementsTabProps) {
  /**
   * Scroll to supplier section
   */
  const handleSupplierClick = () => {
    document.getElementById("supplier-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /**
   * Scroll to categories section
   */
  const handleShortageClick = () => {
    document.getElementById("categories-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /**
   * Handle add to inventory
   */
  const handleAddToInventory = (item: any) => {
    console.log("Add to inventory:", item);
    // TODO: Implement add to inventory logic
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <BatchRequirementsOverview
        requirements={requirements}
        onSupplierClick={handleSupplierClick}
        onShortageClick={handleShortageClick}
      />

      {/* Alerts */}
      <BatchInventoryWarnings
        itemsWithoutInventory={requirements.itemsWithoutInventory || []}
        criticalShortages={requirements.criticalShortages || []}
        onAddToInventory={handleAddToInventory}
      />

      {/* Requirements by Category */}
      <div id="categories-section">
        <BatchRequirementsCategories byCategory={requirements.byCategory!} />
      </div>

      {/* Supplier-wise Requirements */}
      <div id="supplier-section">
        <BatchRequirementsSuppliers
          suppliers={requirements.bySupplier || []}
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
        <BatchRequirementsProducts products={requirements.byProduct} />
      )}
    </div>
  );
}
