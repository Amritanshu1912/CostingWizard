// src/app/products/components/products-variant-card.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatINR, formatPercentage } from "@/utils/formatting-utils";
import { getMarginColors } from "@/utils/product-utils";
import type {
  ProductVariant,
  ProductVariantCostAnalysis,
  ProductVariantDetail,
} from "@/types/product-types";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit2,
  Package,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { VariantForm } from "./products-forms";

interface VariantCardProps {
  variant: ProductVariantDetail;
  costAnalysis?: ProductVariantCostAnalysis;
  onSave: (variant: ProductVariant) => void;
  onDelete: () => void;
}

/**
 * Product variant card component with collapsible details
 * Remembers collapse/expand state in localStorage per variant
 * Shows cost analysis, margins, and detailed breakdowns
 */
export function VariantCard({
  variant,
  costAnalysis,
  onSave,
  onDelete,
}: VariantCardProps) {
  // State management
  const [isEditing, setIsEditing] = useState(false);

  // Load collapse state from localStorage (UX improvement: remember state)
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(`variant-expanded-${variant.id}`);
    return stored === "true";
  });

  // Persist collapse state to localStorage
  useEffect(() => {
    localStorage.setItem(`variant-expanded-${variant.id}`, String(isExpanded));
  }, [isExpanded, variant.id]);

  /**
   * Handle save from form
   */
  const handleSave = (updatedVariant: ProductVariant) => {
    onSave(updatedVariant);
    setIsEditing(false);
  };

  /**
   * Handle cancel from form
   */
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Get margin colors based on health status
  const marginColors = costAnalysis
    ? getMarginColors(
        costAnalysis.grossProfitMargin,
        variant.minimumProfitMargin
      )
    : { text: "text-muted-foreground", bg: "bg-muted/50" };

  // ============================================================================
  // EDITING MODE
  // ============================================================================
  if (isEditing) {
    return (
      <Card className="border-2 border-primary shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Edit Variant</h3>
          <VariantForm
            productId={variant.productId}
            initialVariant={variant}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // DISPLAY MODE - COLLAPSED VIEW
  // ============================================================================
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="py-2 px-6">
        {/* COLLAPSED VIEW */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Variant Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold text-base truncate">
                {variant.name}
              </h4>
              <Badge variant={variant.isActive ? "default" : "secondary"}>
                {variant.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {formatINR(variant.sellingPricePerUnit)}
              </span>
              {costAnalysis && (
                <>
                  <span>•</span>
                  <span className={marginColors.text}>
                    {formatPercentage(costAnalysis.grossProfitMargin)} margin
                  </span>
                </>
              )}
              <span>•</span>
              <span>
                {variant.fillQuantity}
                {variant.fillUnit}
              </span>
              <span>•</span>
              <span className="text-xs font-mono">SKU: {variant.sku}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-9 w-9 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant={isExpanded ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1.5 h-9 w-24"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span className="text-xs">Hide</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span className="text-xs">Details</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* EXPANDED VIEW */}
        {isExpanded && costAnalysis && (
          <VariantExpandedView
            variant={variant}
            costAnalysis={costAnalysis}
            marginColors={marginColors}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SUB-COMPONENT: EXPANDED VIEW
// Extracted for better organization
// ============================================================================

interface VariantExpandedViewProps {
  variant: ProductVariantDetail;
  costAnalysis: ProductVariantCostAnalysis;
  marginColors: { text: string; bg: string };
}

/**
 * Expanded view showing detailed cost analysis and breakdowns
 */
function VariantExpandedView({
  variant,
  costAnalysis,
  marginColors,
}: VariantExpandedViewProps) {
  return (
    <div className="mt-6 space-y-6 pt-6 border-t">
      {/* Cost Analysis Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Gross Margin Card */}
        <div className={`p-4 rounded-lg ${marginColors.bg}`}>
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <TrendingUp className="h-4 w-4" />
            <span>Gross Margin</span>
          </div>
          <div className={`text-2xl font-bold ${marginColors.text}`}>
            {formatPercentage(costAnalysis.grossProfitMargin)}
          </div>
          {costAnalysis.targetProfitMargin && (
            <div className="text-xs text-muted-foreground mt-1">
              Target: {costAnalysis.targetProfitMargin}%
              {costAnalysis.marginVsTarget !== undefined && (
                <span
                  className={
                    costAnalysis.marginVsTarget >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {" "}
                  ({costAnalysis.marginVsTarget > 0 ? "+" : ""}
                  {formatPercentage(costAnalysis.marginVsTarget)})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Total Cost Card */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">Total Cost</div>
          <div className="text-2xl font-bold">
            {formatINR(costAnalysis.totalCostWithTax)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatINR(costAnalysis.costPerKgWithTax)}/kg
          </div>
        </div>

        {/* Selling Price Card */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">
            Selling Price
          </div>
          <div className="text-2xl font-bold">
            {formatINR(costAnalysis.sellingPricePerUnit)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">per unit</div>
        </div>

        {/* Gross Profit Card */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">Gross Profit</div>
          <div className="text-2xl font-bold">
            {formatINR(costAnalysis.grossProfit)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">per unit</div>
        </div>
      </div>

      {/* Component Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recipe & Packaging */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Package className="h-4 w-4" />
            <span>Recipe & Packaging</span>
          </div>

          {/* Recipe Cost */}
          <div className="p-4 border rounded-lg bg-card space-y-2">
            <div className="font-medium text-sm">{variant.recipeName}</div>
            <div className="text-xs text-muted-foreground">
              Recipe: {formatINR(costAnalysis.recipeCostPerKg)}/kg (
              {formatINR(
                costAnalysis.recipeCostPerKg + costAnalysis.recipeTaxPerKg
              )}
              /kg with tax)
            </div>
            <div className="text-xs flex items-center gap-2">
              <span>
                For {variant.fillQuantity}
                {variant.fillUnit} :
              </span>
              <span className="font-medium">
                {formatINR(costAnalysis.recipeTotalForFill)}
                <span className="text-muted-foreground ml-1">
                  (
                  {formatPercentage(
                    costAnalysis.costBreakdown.find(
                      (c) => c.component === "recipe"
                    )?.percentage || 0
                  )}
                  )
                </span>
              </span>
            </div>
          </div>

          {/* Packaging */}
          <div className="p-4 border rounded-lg bg-card space-y-2">
            <div className="font-medium text-sm">{variant.packagingName}</div>
            <div className="text-xs text-muted-foreground">
              Capacity: {variant.packagingCapacity}
              {variant.packagingUnit}
            </div>
            <div className="text-xs flex items-center gap-2">
              <span>Cost</span>
              <span className="font-medium">
                {formatINR(costAnalysis.packagingTotal)}
                <span className="text-muted-foreground ml-1">
                  (
                  {formatPercentage(
                    costAnalysis.costBreakdown.find(
                      (c) => c.component === "packaging"
                    )?.percentage || 0
                  )}
                  )
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Tag className="h-4 w-4" />
            <span>Labels</span>
          </div>

          {variant.frontLabelName ? (
            <div className="p-4 border rounded-lg bg-card space-y-2">
              <div className="text-sm font-medium">Front Label</div>
              <div className="text-xs text-muted-foreground">
                {variant.frontLabelName}
              </div>
              <div className="text-xs flex items-center gap-2">
                <span>Cost</span>
                <span className="font-medium">
                  {formatINR(costAnalysis.frontLabelTotal)}
                </span>
              </div>
            </div>
          ) : null}

          {variant.backLabelName ? (
            <div className="p-4 border rounded-lg bg-card space-y-2">
              <div className="text-sm font-medium">Back Label</div>
              <div className="text-xs text-muted-foreground">
                {variant.backLabelName}
              </div>
              {costAnalysis.backLabelTotal && (
                <div className="text-xs flex items-center gap-2">
                  <span>Cost</span>
                  <span className="font-medium">
                    {formatINR(costAnalysis.backLabelTotal)}
                  </span>
                </div>
              )}
            </div>
          ) : null}

          {!variant.frontLabelName && !variant.backLabelName && (
            <div className="p-4 border rounded-lg bg-card">
              <div className="text-xs text-muted-foreground">
                No labels configured
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="space-y-3">
        <div className="text-sm font-semibold">Cost Breakdown</div>
        <div className="space-y-3">
          {costAnalysis.costBreakdown.map((item) => (
            <div key={item.component} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">
                  {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatPercentage(item.percentage)}
                  </span>
                  <span className="font-medium">{formatINR(item.cost)}</span>
                </div>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {costAnalysis.warnings.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <div className="font-medium text-sm text-yellow-900 dark:text-yellow-100">
              Attention Required
            </div>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              {costAnalysis.warnings.map((warning, i) => (
                <li key={i}>• {warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Notes */}
      {variant.notes && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium mb-1">Notes</div>
          <div className="text-sm text-muted-foreground">{variant.notes}</div>
        </div>
      )}
    </div>
  );
}
