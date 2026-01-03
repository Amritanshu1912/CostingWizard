// src/app/batches/components/batch-requirements/batch-requirements-overview.tsx
"use client";

import {
  AlertCircle,
  Building2,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";
import { MetricCardWithChildren } from "@/components/ui/metric-card";
import type { BatchRequirementsAnalysis } from "@/types/batch-types";

interface BatchRequirementsOverviewProps {
  requirements: BatchRequirementsAnalysis;
  onSupplierClick?: () => void;
  onShortageClick?: () => void;
}

/**
 * Requirements overview component
 * Displays detailed summary metrics in card grid
 */
export function BatchRequirementsOverview({
  requirements,
  onSupplierClick,
  onShortageClick,
}: BatchRequirementsOverviewProps) {
  const hasShortages =
    requirements.criticalShortages && requirements.criticalShortages.length > 0;
  const overview = requirements.overview;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Items */}
      <MetricCardWithChildren
        title="Total Items"
        value={overview.totalItems}
        icon={Package}
        description="to procure"
        variant="default"
      >
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">🧪 Materials</span>
            <span className="font-medium">{overview.materialCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">📦 Packaging</span>
            <span className="font-medium">{overview.packagingCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">🏷️ Labels</span>
            <span className="font-medium">{overview.labelCount}</span>
          </div>
        </div>
      </MetricCardWithChildren>

      {/* Total Cost */}
      <MetricCardWithChildren
        title="Total Cost"
        value={`₹${(overview.totalCost / 1000).toFixed(1)}k`}
        icon={DollarSign}
        description="procurement cost"
        variant="info"
      >
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Materials</span>
            <span className="font-medium">
              {overview.totalCost > 0
                ? ((overview.materialCost / overview.totalCost) * 100).toFixed(
                    0
                  )
                : 0}
              %
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Packaging</span>
            <span className="font-medium">
              {overview.totalCost > 0
                ? ((overview.packagingCost / overview.totalCost) * 100).toFixed(
                    0
                  )
                : 0}
              %
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Labels</span>
            <span className="font-medium">
              {overview.totalCost > 0
                ? ((overview.labelCost / overview.totalCost) * 100).toFixed(0)
                : 0}
              %
            </span>
          </div>
        </div>
      </MetricCardWithChildren>

      {/* Suppliers */}
      <MetricCardWithChildren
        title="Suppliers"
        value={overview.supplierCount}
        icon={Building2}
        description="to contact"
        variant="default"
        onClick={onSupplierClick}
      >
        <div className="space-y-1 text-xs">
          {requirements.bySupplier?.slice(0, 3).map((supplier) => (
            <div
              key={supplier.supplierId}
              className="flex items-center justify-between"
            >
              <span className="text-muted-foreground truncate max-w-[120px]">
                {supplier.supplierName}
              </span>
              <span className="font-medium">
                ₹{(supplier.totalCost / 1000).toFixed(1)}k
              </span>
            </div>
          ))}
          {requirements.bySupplier && requirements.bySupplier.length > 3 && (
            <p className="text-muted-foreground text-center pt-1">
              +{requirements.bySupplier.length - 3} more
            </p>
          )}
        </div>
      </MetricCardWithChildren>

      {/* Shortages */}
      <MetricCardWithChildren
        title="Shortages"
        value={requirements.criticalShortages?.length ?? 0}
        icon={hasShortages ? AlertCircle : TrendingUp}
        description={hasShortages ? "items short" : "all available"}
        variant={hasShortages ? "danger" : "success"}
        onClick={hasShortages ? onShortageClick : undefined}
      >
        {hasShortages ? (
          <div className="space-y-1 text-xs">
            {requirements.criticalShortages!.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-red-600 dark:text-red-400"
              >
                <span className="truncate max-w-[120px]">{item.itemName}</span>
                <span className="font-medium">
                  -{item.shortage.toFixed(0)} {item.unit}
                </span>
              </div>
            ))}
            {requirements.criticalShortages!.length > 3 && (
              <p className="text-center pt-1 font-medium">
                +{requirements.criticalShortages!.length - 3} more
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            ✓ All items available in stock
          </p>
        )}
      </MetricCardWithChildren>
    </div>
  );
}
