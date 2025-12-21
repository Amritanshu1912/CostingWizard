// src/app/recipes/components/recipes-comparison/comparison-table.tsx
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useIngredientComparison } from "@/hooks/recipe-hooks/use-recipe-comparison";
import type { ComparisonItem, ComparisonMetric } from "@/types/recipe-types";
import { cn } from "@/utils/shared-utils";
import { Info, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";

/**
 * Helper: Calculate percentage difference between values
 */
const calculateDiff = (
  current: number,
  baseline: number
): { value: string; trend: "up" | "down" | "neutral" } => {
  if (baseline === 0) return { value: "N/A", trend: "neutral" };

  const diff = ((current - baseline) / baseline) * 100;

  return {
    value: `${Math.abs(diff).toFixed(1)}%`,
    trend: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
  };
};

/**
 * Comprehensive comparison metrics
 * Defines what to compare and how to display it
 */
const COMPARISON_METRICS: ComparisonMetric[] = [
  // Cost Metrics
  {
    key: "totalWeight",
    label: "Total Weight",
    getValue: (item) => item.totalWeight,
    format: (value) =>
      `${typeof value === "number" ? value.toFixed(2) : value}g`,
    calculateDiff,
    description: "Total weight of all ingredients",
  },
  {
    key: "totalCost",
    label: "Total Cost",
    getValue: (item) => item.totalCost,
    format: (value) =>
      `₹${typeof value === "number" ? value.toFixed(2) : value}`,
    calculateDiff,
    description: "Total cost for entire recipe batch",
  },
  {
    key: "costPerKg",
    label: "Cost per kg",
    getValue: (item) => item.costPerKg,
    format: (value) =>
      `₹${typeof value === "number" ? value.toFixed(2) : value}`,
    calculateDiff,
    description: "Base cost per kilogram (excluding tax)",
  },
  {
    key: "taxedCostPerKg",
    label: "Cost per kg (with tax)",
    getValue: (item) => item.taxedCostPerKg,
    format: (value) =>
      `₹${typeof value === "number" ? value.toFixed(2) : value}`,
    calculateDiff,
    description: "Total cost per kilogram including all taxes",
  },

  // Composition Metrics
  {
    key: "ingredientCount",
    label: "Ingredient Count",
    getValue: (item) => item.ingredientCount,
    format: (value) => String(value),
    description: "Number of ingredients in formulation",
  },

  // Supplier Metrics
  {
    key: "uniqueSuppliers",
    label: "Unique Suppliers",
    getValue: (item) => item.uniqueSuppliers,
    format: (value) => String(value),
    description: "Number of unique suppliers used",
  },
];

/**
 * Comparison table component
 * Shows side-by-side comparison of recipes/variants
 * @param items - Selected items to compare (2-4 items)
 */
export function ComparisonTable({ items }: { items: ComparisonItem[] }) {
  const baseline = items[0]; // First item is baseline
  const selectedIds = useMemo(() => items.map((item) => item.id), [items]);
  const ingredientComparison = useIngredientComparison(selectedIds);

  return (
    <Card className="p-4">
      <TooltipProvider>
        <ScrollArea className="h-[calc(100vh-20rem)]">
          <table className="w-full">
            {/* Table Header */}
            <thead className="sticky top-0 bg-white border-b z-10">
              <tr>
                <th className="text-left p-2 font-medium text-sm w-[200px]">
                  Metric
                </th>
                {items.map((item) => (
                  <th
                    key={item.id}
                    className="text-left p-2 font-medium text-sm min-w-[180px]"
                  >
                    <div>
                      <p className="truncate">{item.name}</p>
                      <Badge
                        variant={
                          item.itemType === "recipe" ? "default" : "secondary"
                        }
                        className="text-xs mt-1"
                      >
                        {item.itemType}
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Recipe Metrics */}
              {COMPARISON_METRICS.map((metric) => (
                <tr key={metric.key} className="border-b hover:bg-slate-50">
                  <td className="p-2 text-sm font-medium">{metric.label}</td>
                  {items.map((item, idx) => {
                    const value = metric.getValue(item);
                    const formatted = metric.format(value);
                    const diff =
                      idx > 0 &&
                      metric.calculateDiff &&
                      typeof value === "number"
                        ? metric.calculateDiff(
                            value,
                            metric.getValue(baseline) as number
                          )
                        : null;

                    return (
                      <td key={item.id} className="p-2 text-sm font-mono">
                        <div className="flex items-center gap-2">
                          {metric.key === "uniqueSuppliers" ? (
                            <div className="flex items-center gap-2">
                              <span>{formatted}</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">
                                    {item.supplierNames &&
                                    item.supplierNames.length > 0 ? (
                                      item.supplierNames.map((name, i) => (
                                        <div key={i}>{name}</div>
                                      ))
                                    ) : (
                                      <div>No suppliers</div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          ) : (
                            <span>{formatted}</span>
                          )}
                          {diff && diff.trend !== "neutral" && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                diff.trend === "up" &&
                                  "text-red-600 border-red-200",
                                diff.trend === "down" &&
                                  "text-green-600 border-green-200"
                              )}
                            >
                              {diff.trend === "up" ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              )}
                              {diff.value}
                            </Badge>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Ingredient Comparison Section */}
              <tr className="bg-slate-50">
                <td
                  colSpan={items.length + 1}
                  className="p-2 text-sm font-semibold bg-accent/20"
                >
                  Ingredients
                </td>
              </tr>

              {ingredientComparison.map((ing) => (
                <tr key={ing.materialId} className="border-b hover:bg-slate-50">
                  <td className="p-2 text-sm font-medium">
                    {ing.materialName}
                  </td>
                  {items.map((item) => {
                    const value = ing.values[item.id];
                    // DEFENSIVE CHECK: Ensure value exists
                    if (!value) {
                      return (
                        <td key={item.id} className="p-2 text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Minus className="w-3 h-3" />
                            Loading...
                          </span>
                        </td>
                      );
                    }
                    return (
                      <td key={item.id} className="p-2 text-sm">
                        {value.present ? (
                          <div>
                            <p className="font-mono">
                              {value.quantity.toFixed(2)} {value.unit}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {value.supplier}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ₹{value.cost.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Minus className="w-3 h-3" />
                            Not used
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </TooltipProvider>
    </Card>
  );
}
