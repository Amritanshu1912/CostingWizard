"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SortableTable } from "@/components/ui/sortable-table";
import { Star } from "lucide-react";
import type { SupplierMaterial, Supplier } from "@/lib/types";

interface PriceComparisonProps {
  supplierMaterials: SupplierMaterial[];
  suppliers: Supplier[];
}

export function PriceComparison({
  supplierMaterials,
  suppliers,
}: PriceComparisonProps) {
  const materials = Array.from(
    new Set(supplierMaterials.map((m) => (m as any).materialName))
  );

  const getAlternativeSuppliers = (materialName: string) => {
    return supplierMaterials.filter(
      (m) => (m as any).materialName === materialName
    );
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Price Comparison by Material</CardTitle>
        <CardDescription>
          Compare prices from different suppliers for the same materials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {materials.map((materialName) => {
            const alternatives = getAlternativeSuppliers(materialName);
            if (alternatives.length < 2) return null;

            const sortedAlternatives = alternatives.sort(
              (a, b) => a.unitPrice - b.unitPrice
            );
            const cheapest = sortedAlternatives[0];
            const mostExpensive =
              sortedAlternatives[sortedAlternatives.length - 1];
            const savings = mostExpensive.unitPrice - cheapest.unitPrice;
            const savingsPercent = (savings / mostExpensive.unitPrice) * 100;

            return (
              <div
                key={materialName}
                className="border border-border/50 rounded-lg p-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground">
                      {materialName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {alternatives.length} suppliers available
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Potential Savings
                    </div>
                    <div className="font-medium text-accent">
                      ₹{savings.toFixed(2)} ({savingsPercent.toFixed(1)}%)
                    </div>
                  </div>
                </div>

                <SortableTable
                  data={sortedAlternatives}
                  columns={[
                    {
                      key: "supplierName",
                      label: "Supplier",
                      sortable: true,
                      render: (value: any, row: SupplierMaterial) => {
                        const supplier = suppliers.find(
                          (s) => s.id === row.supplierId
                        );
                        const isCheapest = row.id === cheapest.id;
                        return (
                          <div className="font-medium text-foreground">
                            {supplier?.name}
                            {isCheapest && (
                              <Badge variant="default" className="ml-2 text-xs">
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
                      render: (value: number, row: SupplierMaterial) => (
                        <span className="text-foreground font-medium">
                          ₹{value.toFixed(2)}/{row.unit}
                        </span>
                      ),
                    },
                    {
                      key: "moq",
                      label: "MOQ",
                      sortable: true,
                      render: (value: number, row: SupplierMaterial) => (
                        <span className="text-muted-foreground">
                          {value} {row.unit}
                        </span>
                      ),
                    },
                    {
                      key: "leadTime",
                      label: "Lead Time",
                      sortable: true,
                      render: (value: number) => (
                        <span className="text-muted-foreground">
                          {value} days
                        </span>
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
                      label: "Rating",
                      sortable: true,
                      render: (value: any, row: SupplierMaterial) => {
                        const supplier = suppliers.find(
                          (s) => s.id === row.supplierId
                        );
                        return (
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm">{supplier?.rating}</span>
                          </div>
                        );
                      },
                    },
                  ]}
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
