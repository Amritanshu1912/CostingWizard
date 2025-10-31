import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  GitBranch,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";
import type { RecipeDisplay, RecipeVariant } from "@/lib/types";
// Utility to format dates
function formatDate(dateString: string | Date): string {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString();
}

interface VariantComparisonProps {
  baseRecipe: RecipeDisplay;
  variants: (RecipeVariant & {
    costPerKg: number;
    costDifference: number;
    costDifferencePercentage: number;
  })[];
  selectedVariantIds: string[];
  onClose: () => void;
}

export function VariantComparison({
  baseRecipe,
  variants,
  selectedVariantIds,
  onClose,
}: VariantComparisonProps) {
  const selectedVariants = useMemo(() => {
    return variants.filter((v) => selectedVariantIds.includes(v.id));
  }, [variants, selectedVariantIds]);

  if (selectedVariants.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <GitBranch className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Select variants to compare</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Variant Comparison</h2>
          <p className="text-muted-foreground">
            Comparing {selectedVariants.length} variant
            {selectedVariants.length > 1 ? "s" : ""} of {baseRecipe.name}
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Back to Lab
        </Button>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Base Recipe Card */}
        <Card className="border-2 border-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Original Recipe</CardTitle>
              <Badge>Base</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metrics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cost/kg</span>
                <span className="text-xl font-bold">
                  ₹{baseRecipe.costPerKg.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Ingredients
                </span>
                <span className="font-semibold">
                  {baseRecipe.ingredientCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weight</span>
                <span className="font-semibold">
                  {baseRecipe.totalWeight.toFixed(0)}g
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="pt-3 border-t">
              <Badge variant="secondary">{baseRecipe.status}</Badge>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              Updated {formatDate(baseRecipe.updatedAt || baseRecipe.createdAt)}
            </div>
          </CardContent>
        </Card>

        {/* Variant Cards */}
        {selectedVariants.map((variant) => {
          const isPositiveSavings = variant.costDifference < 0;

          return (
            <Card key={variant.id} className="border-2 border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{variant.name}</CardTitle>
                  <Badge variant={variant.isActive ? "default" : "secondary"}>
                    {variant.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {variant.description && (
                  <p className="text-sm text-muted-foreground">
                    {variant.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Cost/kg
                    </span>
                    <span className="text-xl font-bold">
                      ₹{variant.costPerKg.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      vs Original
                    </span>
                    <div className="flex items-center gap-1">
                      {isPositiveSavings ? (
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`font-bold ${
                          isPositiveSavings ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {variant.costDifference > 0 ? "+" : ""}₹
                        {variant.costDifference.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Percentage
                    </span>
                    <span
                      className={`font-semibold ${
                        isPositiveSavings ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {variant.costDifferencePercentage > 0 ? "+" : ""}
                      {variant.costDifferencePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Goal */}
                {variant.optimizationGoal && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1">
                      Optimization Goal
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {variant.optimizationGoal.replace("_", " ")}
                    </Badge>
                  </div>
                )}

                {/* Changes Summary */}
                {variant.changes && variant.changes.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      {variant.changes.length} Change
                      {variant.changes.length > 1 ? "s" : ""}
                    </p>
                    <div className="space-y-1">
                      {variant.changes.slice(0, 3).map((change, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-muted-foreground flex items-start gap-1"
                        >
                          <span className="text-blue-600">•</span>
                          <span>
                            {change.ingredientName}:{" "}
                            {change.type.replace("_", " ")}
                          </span>
                        </div>
                      ))}
                      {variant.changes.length > 3 && (
                        <p className="text-xs text-blue-600">
                          +{variant.changes.length - 3} more...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Created{" "}
                  {formatDate(variant.createdAt || new Date().toISOString())}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Load
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Change Comparison */}
      {selectedVariants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Change Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-6">
                {selectedVariants.map((variant) => (
                  <div key={variant.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{variant.name}</h3>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <Badge
                        variant={
                          variant.costDifference < 0 ? "default" : "secondary"
                        }
                        className={
                          variant.costDifference < 0
                            ? "bg-green-600"
                            : "bg-red-600"
                        }
                      >
                        {variant.costDifference > 0 ? "+" : ""}₹
                        {variant.costDifference.toFixed(2)}/kg
                      </Badge>
                    </div>

                    {variant.changes && variant.changes.length > 0 ? (
                      <div className="space-y-2 pl-4">
                        {variant.changes.map((change, idx) => (
                          <Card key={idx} className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Package className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-sm">
                                    {change.ingredientName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span className="capitalize">
                                    {change.type.replace("_", " ")}
                                  </span>
                                  {change.oldValue && change.newValue && (
                                    <>
                                      <ArrowRight className="w-3 h-3" />
                                      <span>
                                        {change.oldValue} → {change.newValue}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground pl-4">
                        No detailed changes recorded
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Comparison Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle>Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Best Savings</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.min(...selectedVariants.map((v) => v.costDifference)) < 0
                  ? `-₹${Math.abs(
                      Math.min(...selectedVariants.map((v) => v.costDifference))
                    ).toFixed(2)}`
                  : "₹0.00"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Savings</p>
              <p className="text-2xl font-bold">
                ₹
                {(
                  selectedVariants.reduce(
                    (sum, v) => sum + Math.abs(v.costDifference),
                    0
                  ) / selectedVariants.length
                ).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Active Variants
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {selectedVariants.filter((v) => v.isActive).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Changes
              </p>
              <p className="text-2xl font-bold">
                {selectedVariants.reduce(
                  (sum, v) => sum + (v.changes?.length || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
