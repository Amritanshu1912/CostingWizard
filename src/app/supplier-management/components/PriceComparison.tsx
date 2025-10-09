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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    new Set(supplierMaterials.map((m) => m.materialName))
  );

  const getAlternativeSuppliers = (materialName: string) => {
    return supplierMaterials.filter((m) => m.materialName === materialName);
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

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-foreground font-medium">
                          #
                        </TableHead>
                        <TableHead className="text-foreground font-medium">
                          Supplier
                        </TableHead>
                        <TableHead className="text-foreground font-medium">
                          Price
                        </TableHead>
                        <TableHead className="text-foreground font-medium">
                          MOQ
                        </TableHead>
                        <TableHead className="text-foreground font-medium">
                          Lead Time
                        </TableHead>
                        <TableHead className="text-foreground font-medium">
                          Availability
                        </TableHead>
                        <TableHead className="text-foreground font-medium">
                          Rating
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAlternatives.map((material, index) => {
                        const supplier = suppliers.find(
                          (s) => s.id === material.supplierId
                        );
                        const isCheapest = material.id === cheapest.id;
                        return (
                          <TableRow
                            key={material.id}
                            className={isCheapest ? "bg-accent/10" : ""}
                          >
                            <TableCell className="text-muted-foreground font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {supplier?.name}
                              {isCheapest && (
                                <Badge
                                  variant="default"
                                  className="ml-2 text-xs"
                                >
                                  Best Price
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-foreground font-medium">
                              ₹{material.unitPrice.toFixed(2)}/{material.unit}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {material.moq} {material.unit}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {material.leadTime} days
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  material.availability === "in-stock"
                                    ? "default"
                                    : material.availability === "limited"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {material.availability.replace("-", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                                <span className="text-sm">
                                  {supplier?.rating}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
