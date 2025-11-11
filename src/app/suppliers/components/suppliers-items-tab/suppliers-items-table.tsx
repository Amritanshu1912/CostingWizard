"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Box, Tag, Plus, Pencil } from "lucide-react";
import type { Supplier } from "@/lib/types";

interface SuppliersItemsTableProps {
  activeTab: string;
  supplierMaterials: any[];
  supplierPackaging: any[];
  supplierLabels: any[];
  onAddItem: () => void;
  onEditMaterial: (material: any) => void;
  onEditPackaging: (packaging: any) => void;
  onEditLabel: (label: any) => void;
}

export function SuppliersItemsTable({
  activeTab,
  supplierMaterials,
  supplierPackaging,
  supplierLabels,
  onAddItem,
  onEditMaterial,
  onEditPackaging,
  onEditLabel,
}: SuppliersItemsTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getAvailabilityBadge = (availability?: string) => {
    switch (availability) {
      case "in-stock":
        return (
          <Badge variant="default" className="bg-green-500">
            In Stock
          </Badge>
        );
      case "limited":
        return <Badge variant="secondary">Limited</Badge>;
      case "out-of-stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const EmptyState = ({ icon, title, description, onAdd }: any) => (
    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
      {icon}
      <p className="font-medium">{title}</p>
      <p className="text-sm">{description}</p>
      <Button className="mt-4" variant="outline" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" /> Add First {title.split(" ")[1]}
      </Button>
    </div>
  );

  return (
    <Tabs value={activeTab}>
      {/* Materials Tab */}
      <TabsContent value="materials" className="mt-6">
        {supplierMaterials.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Price with Tax</TableHead>
                  <TableHead>Tax %</TableHead>
                  <TableHead>MOQ</TableHead>
                  <TableHead>Lead Time</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierMaterials.map((sm) => (
                  <TableRow key={sm.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {sm.displayName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sm.displayCategory}</Badge>
                    </TableCell>
                    <TableCell>{sm.unit}</TableCell>
                    <TableCell>{formatPrice(sm.unitPrice)}</TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(sm.priceWithTax)}
                    </TableCell>
                    <TableCell>{sm.tax}%</TableCell>
                    <TableCell>{sm.moq || "-"}</TableCell>
                    <TableCell>{sm.leadTime || "-"} days</TableCell>
                    <TableCell>
                      {getAvailabilityBadge(sm.availability)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditMaterial(sm)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={<Package className="h-12 w-12 mx-auto mb-3 opacity-50" />}
            title="No Materials Found"
            description="Add materials that this supplier provides"
            onAdd={onAddItem}
          />
        )}
      </TabsContent>

      {/* Packaging Tab */}
      <TabsContent value="packaging" className="mt-6">
        {supplierPackaging.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Packaging Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Price with Tax</TableHead>
                  <TableHead>Tax %</TableHead>
                  <TableHead>MOQ</TableHead>
                  <TableHead>Bulk Price</TableHead>
                  <TableHead>Lead Time</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierPackaging.map((sp) => (
                  <TableRow key={sp.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium ">
                      {sp.displayName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sp.displayType}</Badge>
                    </TableCell>
                    <TableCell>{formatPrice(sp.unitPrice)}</TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(sp.priceWithTax)}
                    </TableCell>
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
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditPackaging(sp)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={<Box className="h-12 w-12 mx-auto mb-3 opacity-50" />}
            title="No Packaging Found"
            description="Add packaging that this supplier provides"
            onAdd={onAddItem}
          />
        )}
      </TabsContent>

      {/* Labels Tab */}
      <TabsContent value="labels" className="mt-6">
        {supplierLabels.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Printing</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Price with Tax</TableHead>
                  <TableHead>Tax %</TableHead>
                  <TableHead>MOQ</TableHead>
                  <TableHead>Lead Time</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierLabels.map((sl) => (
                  <TableRow key={sl.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {sl.displayName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sl.displayType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {sl.displayPrintingType}
                      </Badge>
                    </TableCell>
                    <TableCell>{sl.displayMaterial}</TableCell>
                    <TableCell>{sl.unit}</TableCell>
                    <TableCell>{formatPrice(sl.unitPrice)}</TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(sl.priceWithTax)}
                    </TableCell>
                    <TableCell>{sl.tax || 0}%</TableCell>
                    <TableCell>{sl.moq}</TableCell>
                    <TableCell>{sl.leadTime} days</TableCell>
                    <TableCell>
                      {getAvailabilityBadge(sl.availability)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditLabel(sl)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={<Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />}
            title="No Labels Found"
            description="Add labels that this supplier provides"
            onAdd={onAddItem}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
