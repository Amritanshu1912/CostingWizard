"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { usePackagingPriceComparison } from "@/hooks/use-supplier-packaging-with-details";

export function PackagingPriceComparison() {
  const priceComparisons = usePackagingPriceComparison();

  if (priceComparisons.length === 0) {
    return (
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Price Comparison</CardTitle>
          <CardDescription>
            Compare packaging prices across suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No packaging with multiple suppliers found for comparison
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {priceComparisons.map((comparison) => (
        <Card key={comparison.packagingName} className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {comparison.packagingName}
              <Badge variant="outline" className="text-xs">
                {comparison.alternatives.length} suppliers
              </Badge>
            </CardTitle>
            <CardDescription>
              Price range: ₹{comparison.cheapest.unitPrice.toFixed(2)} - ₹
              {comparison.mostExpensive.unitPrice.toFixed(2)}
              <span className="text-green-600 font-medium ml-2">
                Save ₹{comparison.savings.toFixed(2)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparison.alternatives.map((alternative, index) => (
                <div
                  key={alternative.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index === 0
                      ? "border-green-200 bg-green-50"
                      : index === comparison.alternatives.length - 1
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {index === 0 && (
                      <TrendingDown className="h-5 w-5 text-green-600" />
                    )}
                    {index === comparison.alternatives.length - 1 && (
                      <TrendingUp className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {alternative.supplier?.name || "Unknown Supplier"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        MOQ: {alternative.moq} | Lead time:{" "}
                        {alternative.leadTime} days
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      ₹{alternative.unitPrice.toFixed(2)}
                    </p>
                    <Badge
                      variant={
                        alternative.availability === "in-stock"
                          ? "default"
                          : alternative.availability === "limited"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs mt-1"
                    >
                      {alternative.availability.replace("-", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
