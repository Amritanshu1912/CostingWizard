// src/app/batches/components/batch-details-tab.tsx
"use client";

import type { BatchCostAnalysis, BatchWithDetails } from "@/types/batch-types";
import { cn } from "@/utils/shared-utils";
import { convertToDisplayUnit } from "@/utils/unit-conversion-utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface BatchDetailsTabProps {
  batchDetails: BatchWithDetails;
  costAnalysis: BatchCostAnalysis;
}

/**
 * Batch details tab component
 * Displays overview metrics and product breakdown
 */
export function BatchDetailsTab({
  batchDetails,
  costAnalysis,
}: BatchDetailsTabProps) {
  return (
    <div className="space-y-6">
      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Units */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="text-xs text-muted-foreground mb-1">Total Units</div>
          <div className="text-2xl font-bold">{costAnalysis.totalUnits}</div>
        </div>

        {/* Total Cost */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="text-xs text-muted-foreground mb-1">Total Cost</div>
          <div className="text-2xl font-bold">
            ₹{costAnalysis.totalCost.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">incl. tax</div>
        </div>

        {/* Expected Revenue */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="text-xs text-muted-foreground mb-1">
            Expected Revenue
          </div>
          <div className="text-2xl font-bold">
            ₹{costAnalysis.totalRevenue.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">selling price</div>
        </div>

        {/* Expected Profit */}
        <div
          className={cn(
            "p-4 rounded-lg border",
            getProfitBgClass(
              costAnalysis.totalProfit,
              costAnalysis.profitMargin
            )
          )}
        >
          <div className="flex items-center gap-1 text-xs mb-1">
            {costAnalysis.totalProfit >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span
              className={getProfitTextClass(
                costAnalysis.totalProfit,
                costAnalysis.profitMargin
              )}
            >
              Expected Profit
            </span>
          </div>
          <div
            className={cn(
              "text-2xl font-bold",
              getProfitTextClass(
                costAnalysis.totalProfit,
                costAnalysis.profitMargin
              )
            )}
          >
            ₹{costAnalysis.totalProfit.toFixed(0)}
          </div>
          <div
            className={cn(
              "text-xs",
              getProfitTextClass(
                costAnalysis.totalProfit,
                costAnalysis.profitMargin
              )
            )}
          >
            {costAnalysis.profitMargin.toFixed(1)}% margin
          </div>
        </div>
      </div>

      {/* Products & Variants */}
      {batchDetails.products.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold">Products & Variants</h3>
          {batchDetails.products.map((product) => (
            <div key={product.productId} className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">{product.productName}</h4>
              <div className="space-y-2">
                {product.variants.map((variant) => {
                  const displayQty = convertToDisplayUnit(
                    variant.totalFillQuantity,
                    "kg"
                  );
                  return (
                    <div
                      key={variant.variantId}
                      className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                    >
                      <span>{variant.variantName}</span>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {displayQty.quantity.toFixed(2)} {displayQty.unit}
                        </span>
                        <span>→</span>
                        <span className="font-medium text-foreground">
                          {variant.units} units
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No products with valid quantities in this batch
        </div>
      )}
    </div>
  );
}

/**
 * Get profit text color class based on margin
 */
function getProfitTextClass(profit: number, margin: number): string {
  if (profit < 0) return "text-red-600 dark:text-red-400";
  if (margin >= 40) return "text-green-600 dark:text-green-400";
  if (margin >= 30) return "text-emerald-600 dark:text-emerald-400";
  if (margin >= 20) return "text-yellow-600 dark:text-yellow-400";
  if (margin >= 10) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

/**
 * Get profit background color class based on margin
 */
function getProfitBgClass(profit: number, margin: number): string {
  if (profit < 0)
    return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900";
  if (margin >= 30)
    return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900";
  if (margin >= 20)
    return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900";
  return "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900";
}
