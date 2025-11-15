"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Edit2,
  Trash2,
  Package,
  Tag,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  ProductVariant,
  ProductVariantWithDetails,
  ProductVariantCostAnalysis,
} from "@/lib/types";
import { VariantEditor } from "./variant-editor";

interface VariantCardProps {
  variant: ProductVariantWithDetails;
  costAnalysis?: ProductVariantCostAnalysis;
  onSave: (variant: ProductVariant) => void;
  onDelete: () => void;
}

export function VariantCard({
  variant,
  costAnalysis,
  onSave,
  onDelete,
}: VariantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const marginColor = costAnalysis
    ? costAnalysis.grossProfitMargin < 20
      ? "text-red-600 dark:text-red-400"
      : costAnalysis.grossProfitMargin < 30
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-green-600 dark:text-green-400"
    : "text-muted-foreground";

  const marginBgColor = costAnalysis
    ? costAnalysis.grossProfitMargin < 20
      ? "bg-red-50 dark:bg-red-950/20"
      : costAnalysis.grossProfitMargin < 30
      ? "bg-yellow-50 dark:bg-yellow-950/20"
      : "bg-green-50 dark:bg-green-950/20"
    : "bg-muted/50";

  const handleSave = (updatedVariant: ProductVariant) => {
    onSave(updatedVariant);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // If editing, show the editor inline
  if (isEditing) {
    return (
      <Card className="border-2 border-primary">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Edit Variant</h3>
          <VariantEditor
            productId={variant.productId}
            initialVariant={variant}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        {/* COLLAPSED VIEW - Always visible */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-base truncate">
                {variant.name}
              </h4>
              <Badge variant={variant.isActive ? "default" : "secondary"}>
                {variant.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span>₹{variant.sellingPricePerUnit}</span>
              {costAnalysis && (
                <>
                  <span>•</span>
                  <span className={marginColor}>
                    {costAnalysis.grossProfitMargin.toFixed(1)}% margin
                  </span>
                </>
              )}
              <span>•</span>
              <span>
                {variant.fillQuantity}
                {variant.fillUnit}
              </span>
              <span>•</span>
              <span className="text-xs">SKU: {variant.sku}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* EXPANDED VIEW - Conditionally rendered */}
        {isExpanded && (
          <div className="mt-6 space-y-6 pt-6 border-t">
            {/* Cost Analysis Metrics */}
            {costAnalysis && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${marginBgColor}`}>
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Gross Margin</span>
                  </div>
                  <div className={`text-2xl font-bold ${marginColor}`}>
                    {costAnalysis.grossProfitMargin.toFixed(1)}%
                  </div>
                  {costAnalysis.targetProfitMargin && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Target: {costAnalysis.targetProfitMargin}%
                      {costAnalysis.marginVsTarget !== undefined && (
                        <span
                          className={
                            costAnalysis.marginVsTarget >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {" "}
                          ({costAnalysis.marginVsTarget > 0 ? "+" : ""}
                          {costAnalysis.marginVsTarget.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">
                    Total Cost
                  </div>
                  <div className="text-2xl font-bold">
                    ₹{costAnalysis.totalCostWithTax.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ₹{costAnalysis.costPerKgWithTax.toFixed(2)}/kg
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">
                    Selling Price
                  </div>
                  <div className="text-2xl font-bold">
                    ₹{costAnalysis.sellingPricePerUnit.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    per unit
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">
                    Gross Profit
                  </div>
                  <div className="text-2xl font-bold">
                    ₹{costAnalysis.grossProfit.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    per unit
                  </div>
                </div>
              </div>
            )}

            {/* Component Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipe & Packaging */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Package className="h-4 w-4" />
                  <span>Recipe & Packaging</span>
                </div>
                <div className="space-y-2">
                  {/* Recipe Cost */}
                  {costAnalysis && (
                    <div className="p-3 border rounded-lg space-y-1">
                      <div className="font-medium text-sm">
                        {variant.recipeName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Recipe: ₹{costAnalysis.recipeCostPerKg.toFixed(2)}/kg (₹
                        {(
                          costAnalysis.recipeCostPerKg +
                          costAnalysis.recipeTaxPerKg
                        ).toFixed(2)}
                        /kg with tax)
                      </div>
                      <div className="text-xs">
                        For {variant.fillQuantity}
                        {variant.fillUnit}: ₹
                        {costAnalysis.recipeTotalForFill.toFixed(2)}
                        <span className="text-muted-foreground ml-1">
                          (
                          {costAnalysis.costBreakdown
                            .find((c) => c.component === "recipe")
                            ?.percentage.toFixed(1)}
                          %)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Packaging */}
                  <div className="p-3 border rounded-lg space-y-1">
                    <div className="font-medium text-sm">
                      {variant.packagingName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Capacity: {variant.packagingCapacity}
                      {variant.packagingUnit}
                    </div>
                    {costAnalysis && (
                      <div className="text-xs">
                        Cost: ₹{costAnalysis.packagingTotal.toFixed(2)}
                        <span className="text-muted-foreground ml-1">
                          (
                          {costAnalysis.costBreakdown
                            .find((c) => c.component === "packaging")
                            ?.percentage.toFixed(1)}
                          %)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4" />
                  <span>Labels</span>
                </div>
                <div className="space-y-2">
                  {variant.frontLabelName && (
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm font-medium">Front Label</div>
                      <div className="text-xs text-muted-foreground">
                        {variant.frontLabelName}
                      </div>
                      {costAnalysis && (
                        <div className="text-xs mt-1">
                          ₹{costAnalysis.frontLabelTotal.toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                  {variant.backLabelName && (
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm font-medium">Back Label</div>
                      <div className="text-xs text-muted-foreground">
                        {variant.backLabelName}
                      </div>
                      {costAnalysis && costAnalysis.backLabelTotal && (
                        <div className="text-xs mt-1">
                          ₹{costAnalysis.backLabelTotal.toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                  {!variant.frontLabelName && !variant.backLabelName && (
                    <div className="p-3 border rounded-lg text-xs text-muted-foreground">
                      No labels configured
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cost Breakdown Chart */}
            {costAnalysis && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Cost Breakdown</div>
                <div className="space-y-2">
                  {costAnalysis.costBreakdown.map((item) => (
                    <div key={item.component} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {item.percentage.toFixed(1)}%
                          </span>
                          <span className="font-medium">
                            ₹{item.cost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {costAnalysis && costAnalysis.warnings.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
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
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium mb-1">Notes</div>
                <div className="text-sm text-muted-foreground">
                  {variant.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
