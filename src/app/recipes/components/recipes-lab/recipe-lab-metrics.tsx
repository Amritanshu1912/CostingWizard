// components/recipes/recipe-lab/recipe-lab-metrics.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type {
  ExperimentMetrics,
  ExperimentIngredient,
} from "@/hooks/use-recipe-experiment";
import type { SupplierMaterialWithDetails } from "@/lib/types";

interface RecipeLabMetricsProps {
  metrics: ExperimentMetrics;
  targetCost?: number;
  experimentIngredients: ExperimentIngredient[];
  supplierMaterials: SupplierMaterialWithDetails[];
  onApplySuggestion: (index: number, supplierId: string) => void;
  getAlternatives: (ing: ExperimentIngredient) => SupplierMaterialWithDetails[];
}

export function RecipeLabMetrics({
  metrics,
  targetCost,
  experimentIngredients,
  supplierMaterials,
  onApplySuggestion,
  getAlternatives,
}: RecipeLabMetricsProps) {
  return (
    <Card className="w-80 flex flex-col py-2">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Live Metrics</h3>
      </div>

      <ScrollArea className="flex-1 min-h-0 px-4 py-0">
        <div className="space-y-4">
          {/* Comprehensive Cost Impact */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-white">
            <p className="text-xs text-muted-foreground mb-0 font-semibold">
              Cost Analysis
            </p>

            <div className="space-y-3">
              {/* Weight Comparison */}
              <div className="pb-2 border-b">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Weight
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Original</span>
                  <span className="font-semibold">
                    {metrics.originalWeight.toFixed(0)}g
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm">Modified</span>
                  <span className="font-semibold text-blue-600">
                    {metrics.modifiedWeight.toFixed(0)}g
                  </span>
                </div>
                {Math.abs(metrics.originalWeight - metrics.modifiedWeight) >
                  1 && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      Change
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        metrics.modifiedWeight > metrics.originalWeight
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {metrics.modifiedWeight > metrics.originalWeight
                        ? "+"
                        : ""}
                      {(
                        metrics.modifiedWeight - metrics.originalWeight
                      ).toFixed(0)}
                      g
                    </span>
                  </div>
                )}
              </div>

              {/* Total Composition Cost */}
              <div className="pb-2 border-b">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Composition Cost
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Original</span>
                  <span className="font-semibold">
                    ₹{metrics.originalTotalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm">Modified</span>
                  <span className="font-semibold text-blue-600">
                    ₹{metrics.modifiedTotalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-muted-foreground">With Tax</span>
                  <div className="text-right">
                    <div className="text-muted-foreground">
                      ₹{metrics.originalTotalCostWithTax.toFixed(2)} →
                    </div>
                    <div className="text-blue-600 font-semibold">
                      ₹{metrics.modifiedTotalCostWithTax.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Per Kg */}
              <div className="pb-2 border-b">
                <p className="text-xs text-muted-foreground mb-1">
                  Cost per Kg
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Original</span>
                  <span className="font-semibold">
                    ₹{metrics.originalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm">Modified</span>
                  <span className="font-semibold text-blue-600">
                    ₹{metrics.modifiedCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-muted-foreground">With Tax</span>
                  <div className="text-right">
                    <div className="text-muted-foreground">
                      ₹{metrics.originalCostPerKgWithTax.toFixed(2)} →
                    </div>
                    <div className="text-blue-600 font-semibold">
                      ₹{metrics.modifiedCostPerKgWithTax.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Savings */}
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Savings</span>
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold ${
                        metrics.savings > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {metrics.savings > 0 ? "-" : "+"}₹
                      {Math.abs(metrics.savings).toFixed(2)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      ({Math.abs(metrics.savingsPercent).toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Gap */}
              {targetCost && metrics.targetGap !== undefined && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Target Cost</span>
                    <span className="text-sm">₹{targetCost.toFixed(2)}/kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Gap</span>
                    <span
                      className={`font-bold ${
                        metrics.targetGap > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {metrics.targetGap > 0 ? "+" : "-"}₹
                      {Math.abs(metrics.targetGap).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Smart Suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4 className="font-semibold text-sm">Optimization Tips</h4>
            </div>

            <div className="space-y-2">
              {experimentIngredients
                .map((ing, index) => {
                  const alternatives = getAlternatives(ing);
                  if (alternatives.length === 0) return null;

                  const cheapest = alternatives.reduce((min, alt) =>
                    alt.unitPrice < min.unitPrice ? alt : min
                  );

                  const sm = supplierMaterials.find(
                    (s) => s.id === ing.supplierMaterialId
                  );
                  if (!sm) return null;

                  const saving = sm.unitPrice - cheapest.unitPrice;
                  const savingPercent = (saving / sm.unitPrice) * 100;

                  if (saving <= 0) return null;

                  return (
                    <Card key={ing.id} className="p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            Switch {sm.displayName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {sm.supplier?.name} → {cheapest.supplier?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600 font-semibold">
                          Save ₹{saving.toFixed(2)}/kg (
                          {savingPercent.toFixed(0)}%)
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => onApplySuggestion(index, cheapest.id)}
                        >
                          Apply
                        </Button>
                      </div>
                    </Card>
                  );
                })
                .filter(Boolean)}

              {experimentIngredients.every(
                (ing) => getAlternatives(ing).length === 0
              ) && (
                <Card className="p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No optimization suggestions available</span>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Warnings & Achievements */}
          {metrics.targetGap && metrics.targetGap > 0 && (
            <Card className="p-3 bg-red-50 border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Above Target Cost
                  </p>
                  <p className="text-xs text-red-700">
                    Current cost is ₹{metrics.targetGap.toFixed(2)} above target
                  </p>
                </div>
              </div>
            </Card>
          )}

          {metrics.targetGap && metrics.targetGap <= 0 && (
            <Card className="p-3 bg-green-50 border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Target Achieved!
                  </p>
                  <p className="text-xs text-green-700">
                    ₹{Math.abs(metrics.targetGap).toFixed(2)} below target
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
