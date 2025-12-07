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
import { Box, Package, Pencil, Tag } from "lucide-react";
import { EmptyState } from "./empty-state";
import { formatINR, StockStatusBadge } from "./stock-status-badge";

interface SuppliersItemsTableProps {
  supplierMaterials: any[];
  supplierPackaging: any[];
  supplierLabels: any[];
  onAddItem: () => void;
  onEditMaterial: (material: any) => void;
  onEditPackaging: (packaging: any) => void;
  onEditLabel: (label: any) => void;
}

/**
 * Displays supplier items (materials, packaging, labels) in tabbed tables.
 * Supports editing and empty states for each item type.
 */
export function SuppliersItemsTable({
  supplierMaterials,
  supplierPackaging,
  supplierLabels,
  onAddItem,
  onEditMaterial,
  onEditPackaging,
  onEditLabel,
}: SuppliersItemsTableProps) {
  return (
    <>
      {/* Materials Tab */}
      <TabsContent value="materials" className="mt-0">
        {supplierMaterials.length > 0 ? (
          <MaterialsTable
            materials={supplierMaterials}
            onEdit={onEditMaterial}
          />
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
          <PackagingTable
            packaging={supplierPackaging}
            onEdit={onEditPackaging}
          />
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
          <LabelsTable labels={supplierLabels} onEdit={onEditLabel} />
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

/**
 * Materials table component
 */
function MaterialsTable({
  materials,
  onEdit,
}: {
  materials: any[];
  onEdit: (material: any) => void;
}) {
  return (
    <div className="border-2 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Material Name</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Unit</TableHead>
              <TableHead className="font-semibold">Unit Price</TableHead>
              <TableHead className="font-semibold">Price with Tax</TableHead>
              <TableHead className="font-semibold">Tax %</TableHead>
              <TableHead className="font-semibold">MOQ</TableHead>
              <TableHead className="font-semibold">Lead Time</TableHead>
              <TableHead className="font-semibold">Stock Status</TableHead>
              <TableHead className="text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((sm) => (
              <TableRow key={sm.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{sm.displayName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="shadow-sm">
                    {sm.displayCategory}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {sm.unit}
                </TableCell>
                <TableCell>{formatINR(sm.unitPrice)}</TableCell>
                <TableCell className="font-semibold">
                  {formatINR(sm.priceWithTax)}
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
                  <StockStatusBadge status={sm.stockStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(sm)}
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
  );
}

/**
 * Packaging table component
 */
function PackagingTable({
  packaging,
  onEdit,
}: {
  packaging: any[];
  onEdit: (packaging: any) => void;
}) {
  return (
    <div className="border-2 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Packaging Name</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Unit Price</TableHead>
              <TableHead className="font-semibold">Price with Tax</TableHead>
              <TableHead className="font-semibold">Tax %</TableHead>
              <TableHead className="font-semibold">MOQ</TableHead>
              <TableHead className="font-semibold">Bulk Price</TableHead>
              <TableHead className="font-semibold">Lead Time</TableHead>
              <TableHead className="font-semibold">Stock Status</TableHead>
              <TableHead className="text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packaging.map((sp) => (
              <TableRow key={sp.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{sp.displayName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="shadow-sm">
                    {sp.displayType}
                  </Badge>
                </TableCell>
                <TableCell>{formatINR(sp.unitPrice)}</TableCell>
                <TableCell className="font-semibold">
                  {formatINR(sp.priceWithTax)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {sp.tax || 0}%
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {sp.moq || "-"}
                </TableCell>
                <TableCell className="text-sm">
                  {sp.bulkPrice
                    ? `${formatINR(sp.bulkPrice)} @ ${sp.quantityForBulkPrice}`
                    : "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {sp.leadTime || "-"} days
                </TableCell>
                <TableCell>
                  <StockStatusBadge status={sp.stockStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(sp)}
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
  );
}

/**
 * Labels table component
 */
function LabelsTable({
  labels,
  onEdit,
}: {
  labels: any[];
  onEdit: (label: any) => void;
}) {
  return (
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
              <TableHead className="font-semibold">Price with Tax</TableHead>
              <TableHead className="font-semibold">Tax %</TableHead>
              <TableHead className="font-semibold">MOQ</TableHead>
              <TableHead className="font-semibold">Lead Time</TableHead>
              <TableHead className="font-semibold">Stock Status</TableHead>
              <TableHead className="text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labels.map((sl) => (
              <TableRow key={sl.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{sl.displayName}</TableCell>
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
                <TableCell>{formatINR(sl.unitPrice)}</TableCell>
                <TableCell className="font-semibold">
                  {formatINR(sl.priceWithTax)}
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
                  <StockStatusBadge status={sl.stockStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(sl)}
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
  );
}
