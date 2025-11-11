"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Box, Tag, Plus, Star, DollarSign } from "lucide-react";
import type {
  Supplier,
  SupplierMaterial,
  SupplierPackaging,
  SupplierLabel,
  Material,
  Packaging,
  Label,
} from "@/lib/types";

interface SuppliersItemsTabProps {
  suppliers: Supplier[];
  supplierMaterials?: SupplierMaterial[];
  materials?: Material[];
  supplierPackaging?: SupplierPackaging[];
  packaging?: Packaging[];
  supplierLabels?: SupplierLabel[];
  labels?: Label[];
}

export function SuppliersItemsTab({
  suppliers,
  supplierMaterials = [],
  materials = [],
  supplierPackaging = [],
  packaging = [],
  supplierLabels = [],
  labels = [],
}: SuppliersItemsTabProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("materials");

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  // Get items for selected supplier
  const supplierMaterialsFiltered = supplierMaterials.filter(
    (sm) => sm.supplierId === selectedSupplierId
  );
  const supplierPackagingFiltered = supplierPackaging.filter(
    (sp) => sp.supplierId === selectedSupplierId
  );
  const supplierLabelsFiltered = supplierLabels.filter(
    (sl) => sl.supplierId === selectedSupplierId
  );

  // Helper to get material name
  const getMaterialName = (materialId: string) => {
    return materials.find((m) => m.id === materialId)?.name || "Unknown";
  };

  // Helper to get packaging name
  const getPackagingName = (packagingId: string) => {
    return packaging.find((p) => p.id === packagingId)?.name || "Unknown";
  };

  // Helper to get label name
  const getLabelName = (labelId: string) => {
    return labels.find((l) => l.id === labelId)?.name || "Unknown";
  };

  const handleAddItem = (type: string) => {
    // TODO: Implement add item functionality
    console.log(`Add ${type} for supplier ${selectedSupplierId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const getAvailabilityBadge = (availability?: string) => {
    switch (availability) {
      case "in-stock":
        return <Badge variant="default">In Stock</Badge>;
      case "limited":
        return <Badge variant="secondary">Limited</Badge>;
      case "out-of-stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Supplier Selector */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Select Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select
                value={selectedSupplierId}
                onValueChange={setSelectedSupplierId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a supplier to manage items" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers
                    .filter((s) => s.isActive)
                    .map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        <div className="flex items-center gap-2">
                          <span>{supplier.name}</span>
                          <Badge variant="outline" className="text-xs">
                            ⭐ {supplier.rating}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {selectedSupplier && (
              <div className="text-sm text-muted-foreground">
                Managing items for <strong>{selectedSupplier.name}</strong>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedSupplierId ? (
        <Card className="border-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Supplier Items</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage materials, packaging, and labels for{" "}
                  {selectedSupplier?.name}
                </p>
              </div>
              <Button onClick={() => handleAddItem(activeTab)}>
                <Plus className="h-4 w-4 mr-2" />
                Add {activeTab.slice(0, -1)}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="materials"
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Materials ({supplierMaterialsFiltered.length})
                </TabsTrigger>
                <TabsTrigger
                  value="packaging"
                  className="flex items-center gap-2"
                >
                  <Box className="h-4 w-4" />
                  Packaging ({supplierPackagingFiltered.length})
                </TabsTrigger>
                <TabsTrigger value="labels" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Labels ({supplierLabelsFiltered.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="materials" className="mt-6">
                {supplierMaterialsFiltered.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material Name</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Tax</TableHead>
                          <TableHead>MOQ</TableHead>
                          <TableHead>Lead Time</TableHead>
                          <TableHead>Availability</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supplierMaterialsFiltered.map((sm) => (
                          <TableRow key={sm.id}>
                            <TableCell className="font-medium">
                              {getMaterialName(sm.materialId)}
                            </TableCell>
                            <TableCell>{sm.unit}</TableCell>
                            <TableCell>{formatPrice(sm.unitPrice)}</TableCell>
                            <TableCell>{sm.tax}%</TableCell>
                            <TableCell>{sm.moq || "-"}</TableCell>
                            <TableCell>{sm.leadTime || "-"} days</TableCell>
                            <TableCell>
                              {getAvailabilityBadge(sm.availability)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No materials found</p>
                    <p className="text-sm">
                      Add materials that this supplier provides
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="packaging" className="mt-6">
                {supplierPackagingFiltered.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Packaging Name</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Tax</TableHead>
                          <TableHead>MOQ</TableHead>
                          <TableHead>Bulk Price</TableHead>
                          <TableHead>Lead Time</TableHead>
                          <TableHead>Availability</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supplierPackagingFiltered.map((sp) => (
                          <TableRow key={sp.id}>
                            <TableCell className="font-medium">
                              {getPackagingName(sp.packagingId)}
                            </TableCell>
                            <TableCell>{formatPrice(sp.unitPrice)}</TableCell>
                            <TableCell>{sp.tax || 0}%</TableCell>
                            <TableCell>{sp.moq || "-"}</TableCell>
                            <TableCell>
                              {sp.bulkPrice
                                ? `${formatPrice(sp.bulkPrice)} @ ${
                                    sp.quantityForBulkPrice
                                  }`
                                : "-"}
                            </TableCell>
                            <TableCell>{sp.leadTime || "-"} days</TableCell>
                            <TableCell>
                              {getAvailabilityBadge(sp.availability)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
                    <Box className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No packaging found</p>
                    <p className="text-sm">
                      Add packaging that this supplier provides
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="labels" className="mt-6">
                {supplierLabelsFiltered.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Label Name</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Tax</TableHead>
                          <TableHead>MOQ</TableHead>
                          <TableHead>Bulk Price</TableHead>
                          <TableHead>Lead Time</TableHead>
                          <TableHead>Availability</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supplierLabelsFiltered.map((sl) => (
                          <TableRow key={sl.id}>
                            <TableCell className="font-medium">
                              {sl.labelId
                                ? getLabelName(sl.labelId)
                                : "Custom Label"}
                            </TableCell>
                            <TableCell>{sl.unit}</TableCell>
                            <TableCell>{formatPrice(sl.unitPrice)}</TableCell>
                            <TableCell>{sl.tax || 0}%</TableCell>
                            <TableCell>{sl.moq}</TableCell>
                            <TableCell>
                              {sl.bulkPrice
                                ? `${formatPrice(sl.bulkPrice)} @ ${
                                    sl.quantityForBulkPrice
                                  }`
                                : "-"}
                            </TableCell>
                            <TableCell>{sl.leadTime} days</TableCell>
                            <TableCell>
                              {getAvailabilityBadge(sl.availability)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
                    <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No labels found</p>
                    <p className="text-sm">
                      Add labels that this supplier provides
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Select a Supplier
            </h3>
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
