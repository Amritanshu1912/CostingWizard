// src/app/suppliers/components/suppliers-items-tab/suppliers-items-table.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { Box, Package, Pencil, Plus, Tag } from "lucide-react";

interface SuppliersItemsTableProps {
  supplierMaterials: any[];
  supplierPackaging: any[];
  supplierLabels: any[];
  onAddItem: () => void;
  onEditMaterial: (material: any) => void;
  onEditPackaging: (packaging: any) => void;
  onEditLabel: (label: any) => void;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onAddItem,
}: {
  icon: any;
  title: string;
  description: string;
  buttonText: string;
  onAddItem: () => void;
}) => (
  <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
    <div className="rounded-full bg-muted p-6 w-fit mx-auto mb-4">
      <Icon className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm mb-6 max-w-sm mx-auto">{description}</p>
    <Button onClick={onAddItem} size="lg" className="shadow-sm">
      <Plus className="h-4 w-4 mr-2" />
      {buttonText}
    </Button>
  </div>
);

export function SuppliersItemsTable({
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
          <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-sm">
            In Stock
          </Badge>
        );
      case "limited":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 shadow-sm">
            Limited
          </Badge>
        );
      case "out-of-stock":
        return (
          <Badge variant="destructive" className="shadow-sm">
            Out of Stock
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <>
      {/* Materials Tab */}
      <TabsContent value="materials" className="mt-0">
        {supplierMaterials.length > 0 ? (
          <div className="border-2 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">
                      Material Name
                    </TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Unit</TableHead>
                    <TableHead className="font-semibold">Unit Price</TableHead>
                    <TableHead className="font-semibold">
                      Price with Tax
                    </TableHead>
                    <TableHead className="font-semibold">Tax %</TableHead>
                    <TableHead className="font-semibold">MOQ</TableHead>
                    <TableHead className="font-semibold">Lead Time</TableHead>
                    <TableHead className="font-semibold">
                      Availability
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierMaterials.map((sm) => (
                    <TableRow key={sm.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {sm.displayName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="shadow-sm">
                          {sm.displayCategory}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sm.unit}
                      </TableCell>
                      <TableCell>{formatPrice(sm.unitPrice)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(sm.priceWithTax)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sm.tax}%
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sm.moq || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sm.leadTime || "-"} days
                      </TableCell>
                      <TableCell>
                        {getAvailabilityBadge(sm.availability)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditMaterial(sm)}
                          className="hover:bg-muted"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No Materials Found"
            description="Add materials that this supplier provides to start tracking inventory and pricing"
            buttonText="Add First Material"
            onAddItem={onAddItem}
          />
        )}
      </TabsContent>

      {/* Packaging Tab */}
      <TabsContent value="packaging" className="mt-0">
        {supplierPackaging.length > 0 ? (
          <div className="border-2 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">
                      Packaging Name
                    </TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Unit Price</TableHead>
                    <TableHead className="font-semibold">
                      Price with Tax
                    </TableHead>
                    <TableHead className="font-semibold">Tax %</TableHead>
                    <TableHead className="font-semibold">MOQ</TableHead>
                    <TableHead className="font-semibold">Bulk Price</TableHead>
                    <TableHead className="font-semibold">Lead Time</TableHead>
                    <TableHead className="font-semibold">
                      Availability
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierPackaging.map((sp) => (
                    <TableRow key={sp.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {sp.displayName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="shadow-sm">
                          {sp.displayType}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatPrice(sp.unitPrice)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(sp.priceWithTax)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sp.tax || 0}%
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sp.moq || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {sp.bulkPrice
                          ? `${formatPrice(sp.bulkPrice)} @ ${
                              sp.quantityForBulkPrice
                            }`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sp.leadTime || "-"} days
                      </TableCell>
                      <TableCell>
                        {getAvailabilityBadge(sp.availability)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditPackaging(sp)}
                          className="hover:bg-muted"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Box}
            title="No Packaging Found"
            description="Add packaging options that this supplier provides for your products"
            buttonText="Add First Packaging"
            onAddItem={onAddItem}
          />
        )}
      </TabsContent>

      {/* Labels Tab */}
      <TabsContent value="labels" className="mt-0">
        {supplierLabels.length > 0 ? (
          <div className="border-2 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Label Name</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Printing</TableHead>
                    <TableHead className="font-semibold">Material</TableHead>
                    <TableHead className="font-semibold">Unit</TableHead>
                    <TableHead className="font-semibold">Unit Price</TableHead>
                    <TableHead className="font-semibold">
                      Price with Tax
                    </TableHead>
                    <TableHead className="font-semibold">Tax %</TableHead>
                    <TableHead className="font-semibold">MOQ</TableHead>
                    <TableHead className="font-semibold">Lead Time</TableHead>
                    <TableHead className="font-semibold">
                      Availability
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierLabels.map((sl) => (
                    <TableRow key={sl.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {sl.displayName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="shadow-sm">
                          {sl.displayType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="shadow-sm">
                          {sl.displayPrintingType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sl.displayMaterial}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sl.unit}
                      </TableCell>
                      <TableCell>{formatPrice(sl.unitPrice)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(sl.priceWithTax)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sl.tax || 0}%
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sl.moq}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sl.leadTime} days
                      </TableCell>
                      <TableCell>
                        {getAvailabilityBadge(sl.availability)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditLabel(sl)}
                          className="hover:bg-muted"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Tag}
            title="No Labels Found"
            description="Add labels that this supplier provides for product branding and information"
            buttonText="Add First Label"
            onAddItem={onAddItem}
          />
        )}
      </TabsContent>
    </>
  );
}
