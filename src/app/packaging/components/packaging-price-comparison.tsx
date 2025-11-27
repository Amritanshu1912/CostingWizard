// src/app/packaging/components/packaging-price-comparison.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SortableTable } from "@/components/ui/sortable-table";
import { usePackagingPriceComparison } from "@/hooks/use-supplier-packaging-with-details";
import type { SupplierPackagingWithDetails } from "@/lib/types";
import { AlertCircle, Star, TrendingDown } from "lucide-react";

export function PackagingPriceComparison() {
  // Use the smart hook that groups by packaging automatically
  const packagingGroups = usePackagingPriceComparison();

  // Table columns
  const columns = [
    {
      key: "supplierName",
      label: "Supplier",
      sortable: true,
      render: (value: any, row: SupplierPackagingWithDetails) => {
        const supplier = row.supplier;
        const alternatives = packagingGroups
          .find((g) => g.packagingName === row.displayName)
          ?.alternatives.sort((a, b) => a.unitPrice - b.unitPrice);
        const isCheapest = alternatives?.[0]?.id === row.id;

        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {supplier?.name}
            </span>
            {isCheapest && (
              <Badge variant="default" className="text-xs">
                <TrendingDown className="h-3 w-3 mr-1" />
                Best Price
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "unitPrice",
      label: "Price",
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-foreground">
          <div>₹{value.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">per unit</div>
        </div>
      ),
    },
    {
      key: "moq",
      label: "MOQ",
      sortable: true,
      render: (value: number) => (
        <span className="text-muted-foreground">{value}</span>
      ),
    },
    {
      key: "leadTime",
      label: "Lead Time",
      sortable: true,
      render: (value: number) => (
        <span className="text-muted-foreground">{value} days</span>
      ),
    },
    {
      key: "availability",
      label: "Availability",
      sortable: true,
      render: (value: string) => (
        <Badge
          variant={
            value === "in-stock"
              ? "default"
              : value === "limited"
                ? "secondary"
                : "destructive"
          }
          className="text-xs"
        >
          {value.replace("-", " ")}
        </Badge>
      ),
    },
    {
      key: "rating",
      label: "Supplier Rating",
      sortable: true,
      render: (value: any, row: SupplierPackagingWithDetails) => {
        const supplier = row.supplier;
        return (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{supplier?.rating}</span>
          </div>
        );
      },
    },
  ];

  if (packagingGroups.length === 0) {
    return (
      <Card className="card-enhanced">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No packaging with multiple suppliers found.
            <br />
            Add more suppliers for the same packaging to compare prices.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Price Comparison by Packaging</CardTitle>
        <CardDescription>
          Compare prices from different suppliers for the same packaging
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {packagingGroups.map((group) => {
            const sortedAlternatives = group.alternatives.sort(
              (a, b) => a.unitPrice - b.unitPrice
            );
            const cheapest = sortedAlternatives[0];
            const mostExpensive =
              sortedAlternatives[sortedAlternatives.length - 1];
            const savings = mostExpensive.unitPrice - cheapest.unitPrice;
            const savingsPercent = (savings / mostExpensive.unitPrice) * 100;

            return (
              <div
                key={group.packagingName}
                className="border border-border/50 rounded-xl p-6 bg-gradient-to-br from-card/50 to-muted/20"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">
                      {group.packagingName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {group.alternatives.length} suppliers available
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-accent/10 px-4 py-3 rounded-lg border border-accent/20">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Potential Savings
                      </div>
                      <div className="text-xl font-bold text-accent">
                        ₹{savings.toFixed(2)}
                      </div>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Percentage
                      </div>
                      <div className="text-xl font-bold text-accent">
                        {savingsPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison Table */}
                <SortableTable
                  data={sortedAlternatives}
                  columns={columns}
                  className="table-enhanced"
                  showSerialNumber={true}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
