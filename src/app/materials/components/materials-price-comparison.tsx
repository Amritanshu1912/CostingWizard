// src/app/materials/components/materials-price-comparison.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMaterialPriceComparison } from "@/hooks/material-hooks/use-materials-queries";
import { AlertCircle, Clock, Star, TrendingDown } from "lucide-react";

/**
 * MaterialsPriceComparison displays a comparison of prices across different suppliers for materials.
 * Shows materials that have multiple supplier options with detailed pricing, lead times, and potential savings.
 */
export function MaterialsPriceComparison() {
  const priceComparisons = useMaterialPriceComparison();

  if (priceComparisons.length === 0) {
    return (
      <Card className="card-enhanced">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No materials with multiple suppliers found.
            <br />
            Add more suppliers for the same materials to compare prices.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Material Comparison Cards */}
      <div className="space-y-6">
        {priceComparisons.map((comparison) => {
          const cheapest = comparison.cheapest;
          const mostExpensive = comparison.mostExpensive;

          return (
            <Card
              key={comparison.materialName}
              className="card-enhanced border-2 border-border/50 hover:border-primary/30 transition-all"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-foreground flex items-center gap-2">
                      {comparison.materialName}
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: comparison.categoryColor + "20",
                          color: comparison.categoryColor,
                          borderColor: comparison.categoryColor,
                        }}
                      >
                        {comparison.materialCategory}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {comparison.alternatives.length} suppliers available •
                      Comparing prices and terms
                    </CardDescription>
                  </div>

                  <div className="flex flex-col items-end gap-1 bg-accent/10 px-4 py-3 rounded-lg border border-accent/20">
                    <div className="text-xs text-muted-foreground">
                      Potential Savings
                    </div>
                    <div className="text-2xl font-bold text-accent">
                      ₹{comparison.savings.toFixed(2)}
                    </div>
                    <div className="text-xs text-accent font-medium">
                      {comparison.savingsPercentage.toFixed(1)}% cheaper
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Supplier
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          Price / Unit
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          Price + Tax
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                          MOQ
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                          Lead Time
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                          Stock
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          Difference
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.alternatives.map((supplier) => {
                        const isCheapest = supplier.id === cheapest.id;
                        const priceDiff =
                          supplier.unitPrice - cheapest.unitPrice;

                        return (
                          <tr
                            key={supplier.id}
                            className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                              isCheapest
                                ? "bg-green-50 dark:bg-green-950/20"
                                : ""
                            }`}
                          >
                            {/* Supplier */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="font-medium text-foreground flex items-center gap-2">
                                    {supplier.supplierName}
                                    {isCheapest && (
                                      <Badge
                                        variant="default"
                                        className="text-xs bg-green-600"
                                      >
                                        <TrendingDown className="h-3 w-3 mr-1" />
                                        Best Price
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    {supplier.supplierRating.toFixed(1)}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="py-4 px-4 text-right">
                              <div className="font-semibold text-foreground">
                                ₹{supplier.unitPrice.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                per {supplier.capacityUnit}
                              </div>
                            </td>

                            {/* Price + Tax */}
                            <td className="py-4 px-4 text-right">
                              <div className="font-medium text-foreground">
                                ₹{supplier.priceWithTax.toFixed(2)}
                              </div>
                            </td>

                            {/* MOQ */}
                            <td className="py-4 px-4 text-center">
                              <div className="text-sm text-muted-foreground">
                                {supplier.moq} {supplier.capacityUnit}
                              </div>
                            </td>

                            {/* Lead Time */}
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {supplier.leadTime}d
                              </div>
                            </td>

                            {/* Stock */}
                            <td className="py-4 px-4 text-center">
                              <div className="text-sm font-medium text-foreground">
                                {supplier.currentStock}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {supplier.capacityUnit}
                              </div>
                            </td>

                            {/* Difference */}
                            <td className="py-4 px-4 text-right">
                              {isCheapest ? (
                                <span className="text-sm font-medium text-green-600">
                                  Cheapest
                                </span>
                              ) : (
                                <div className="text-right">
                                  <div className="text-sm font-medium text-red-600">
                                    +₹{priceDiff.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    +
                                    {(
                                      (priceDiff / cheapest.unitPrice) *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Quick Summary */}
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    Average price across all suppliers:{" "}
                    <span className="font-medium text-foreground">
                      ₹{comparison.averagePrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    Price range:{" "}
                    <span className="font-medium text-foreground">
                      ₹{cheapest.unitPrice.toFixed(2)} - ₹
                      {mostExpensive.unitPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
