"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Supplier } from "@/lib/types";
import { useSupplierMaterialsWithDetails } from "@/hooks/use-supplier-materials-with-details";
import { useSupplierPackagingWithDetails } from "@/hooks/use-supplier-packaging-with-details";
import { useSupplierLabelsWithDetails } from "@/hooks/use-supplier-labels-with-details";
import { SuppliersItemsContent } from "./suppliers-items-content";

interface SuppliersItemsTabProps {
  suppliers: Supplier[];
}

export function SuppliersItemsTab({ suppliers }: SuppliersItemsTabProps) {
  // Get active suppliers and select first one by default
  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.isActive),
    [suppliers]
  );

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    activeSuppliers[0]?.id || ""
  );

  // Fetch all data using hooks
  const allSupplierMaterials = useSupplierMaterialsWithDetails();
  const allSupplierPackaging = useSupplierPackagingWithDetails();
  const allSupplierLabels = useSupplierLabelsWithDetails();

  const selectedSupplier = activeSuppliers.find(
    (s) => s.id === selectedSupplierId
  );

  // Filter items for selected supplier
  const supplierMaterials = useMemo(
    () =>
      allSupplierMaterials.filter((sm) => sm.supplierId === selectedSupplierId),
    [allSupplierMaterials, selectedSupplierId]
  );

  const supplierPackaging = useMemo(
    () =>
      allSupplierPackaging.filter((sp) => sp.supplierId === selectedSupplierId),
    [allSupplierPackaging, selectedSupplierId]
  );

  const supplierLabels = useMemo(
    () =>
      allSupplierLabels.filter((sl) => sl.supplierId === selectedSupplierId),
    [allSupplierLabels, selectedSupplierId]
  );

  return (
    <div className="space-y-6">
      {/* Supplier Selector */}
      <Card className="border-2 shadow-sm gap-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Select Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select
                value={selectedSupplierId}
                onValueChange={setSelectedSupplierId}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose a supplier to manage items" />
                </SelectTrigger>
                <SelectContent>
                  {activeSuppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{supplier.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          ⭐ {supplier.rating}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedSupplier && (
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>Managing items for</span>
                <Badge variant="outline" className="font-semibold">
                  {selectedSupplier.name}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedSupplierId ? (
        <SuppliersItemsContent
          selectedSupplierId={selectedSupplierId}
          selectedSupplier={selectedSupplier}
          supplierMaterials={supplierMaterials}
          supplierPackaging={supplierPackaging}
          supplierLabels={supplierLabels}
        />
      ) : (
        <Card className="border-2 border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Supplier Selected</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Choose a supplier from the dropdown above to view and manage their
              materials, packaging, and labels.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
