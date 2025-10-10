"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SortableTable } from "@/components/ui/sortable-table";
import { Edit, Trash2 } from "lucide-react";
import type { SupplierMaterial, Supplier } from "@/lib/types";

interface MaterialsTableProps {
  filteredMaterials: SupplierMaterial[];
  suppliers: Supplier[];
  onEditMaterial: (material: SupplierMaterial) => void;
  onDeleteMaterial: (id: string) => void;
}

export function MaterialsTable({
  filteredMaterials,
  suppliers,
  onEditMaterial,
  onDeleteMaterial,
}: MaterialsTableProps) {
  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Materials & Pricing</CardTitle>
        <CardDescription>
          {filteredMaterials.length} materials from {suppliers.length} suppliers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SortableTable
          data={filteredMaterials}
          columns={[
            {
              key: "materialName",
              label: "Material",
              sortable: true,
              render: (value: string) => (
                <span className="font-medium text-foreground">{value}</span>
              ),
            },
            {
              key: "supplierName",
              label: "Supplier",
              sortable: true,
              render: (value: any, row: SupplierMaterial) => {
                const supplier = suppliers.find((s) => s.id === row.supplierId);
                return (
                  <span className="text-foreground">{supplier?.name}</span>
                );
              },
            },
            {
              key: "materialCategory",
              label: "Category",
              sortable: true,
              render: (value: string) => (
                <Badge variant="outline" className="text-xs">
                  {value}
                </Badge>
              ),
            },
            {
              key: "unitPrice",
              label: "Price",
              sortable: true,
              render: (value: number, row: SupplierMaterial) => (
                <span className="text-foreground font-medium">
                  {row.currency} {value.toFixed(2)}/{row.unit}
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
              key: "actions",
              label: "Actions",
              sortable: false,
              render: (value: any, row: SupplierMaterial) => (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-transparent"
                    onClick={() => onEditMaterial(row)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive bg-transparent"
                    onClick={() => onDeleteMaterial(row.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ),
            },
          ]}
          className="table-enhanced"
          showSerialNumber={true}
        />
      </CardContent>
    </Card>
  );
}
