// components/batches/batch-requirements/requirements-overview.tsx
import type { BatchRequirementsAnalysis } from "@/lib/types";
import {
  AlertCircle,
  Building2,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "../../utils/stat-card";

interface RequirementsOverviewProps {
  requirements: BatchRequirementsAnalysis;
  onSupplierClick?: () => void;
  onShortageClick?: () => void;
}

export function RequirementsOverview({
  requirements,
  onSupplierClick,
  onShortageClick,
}: RequirementsOverviewProps) {
  const hasShortages = requirements.criticalShortages.length > 0;
  const totalItems =
    requirements.materials.length +
    requirements.packaging.length +
    requirements.labels.length;

  // Calculate cost breakdown percentages
  const materialPercent =
    requirements.totalCost > 0
      ? (requirements.totalMaterialCost / requirements.totalCost) * 100
      : 0;
  const packagingPercent =
    requirements.totalCost > 0
      ? (requirements.totalPackagingCost / requirements.totalCost) * 100
      : 0;
  const labelPercent =
    requirements.totalCost > 0
      ? (requirements.totalLabelCost / requirements.totalCost) * 100
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Items */}
      <StatCard
        title="Total Items"
        value={totalItems}
        icon={Package}
        subtitle="to procure"
        variant="default"
      >
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">🧪 Materials</span>
            <span className="font-medium">{requirements.materials.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">📦 Packaging</span>
            <span className="font-medium">{requirements.packaging.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">🏷️ Labels</span>
            <span className="font-medium">{requirements.labels.length}</span>
          </div>
        </div>
      </StatCard>

      {/* Total Cost */}
      <StatCard
        title="Total Cost"
        value={`₹${requirements.totalCost.toFixed(1)}k`}
        icon={DollarSign}
        subtitle="procurement cost"
        variant="info"
      >
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Materials</span>
            <span className="font-medium">{materialPercent.toFixed(0)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Packaging</span>
            <span className="font-medium">{packagingPercent.toFixed(0)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Labels</span>
            <span className="font-medium">{labelPercent.toFixed(0)}%</span>
          </div>
        </div>
      </StatCard>

      {/* Suppliers */}
      <StatCard
        title="Suppliers"
        value={requirements.bySupplier.length}
        icon={Building2}
        subtitle="to contact"
        variant="default"
        onClick={onSupplierClick}
      >
        <div className="space-y-1 text-xs">
          {requirements.bySupplier.slice(0, 3).map((supplier) => (
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
          {requirements.bySupplier.length > 3 && (
            <p className="text-muted-foreground text-center pt-1">
              +{requirements.bySupplier.length - 3} more
            </p>
          )}
        </div>
      </StatCard>

      {/* Shortages */}
      <StatCard
        title="Shortages"
        value={requirements.criticalShortages.length}
        icon={hasShortages ? AlertCircle : TrendingUp}
        subtitle={hasShortages ? "items short" : "all available"}
        variant={hasShortages ? "danger" : "success"}
        onClick={hasShortages ? onShortageClick : undefined}
      >
        {hasShortages ? (
          <div className="space-y-1 text-xs">
            {requirements.criticalShortages.slice(0, 3).map((item, idx) => (
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
            {requirements.criticalShortages.length > 3 && (
              <p className="text-center pt-1 font-medium">
                +{requirements.criticalShortages.length - 3} more
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            ✓ All items available in stock
          </p>
        )}
      </StatCard>
    </div>
  );
}
