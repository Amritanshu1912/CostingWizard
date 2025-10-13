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
import type { SupplierPackagingWithDetails } from "@/hooks/use-supplier-packaging-with-details";

interface SupplierPackagingTableProps {
  supplierPackaging: SupplierPackagingWithDetails[];
  onEditPackaging: (packaging: SupplierPackagingWithDetails) => void;
  onDeletePackaging: (id: string) => void;
}

export function SupplierPackagingTable({
  supplierPackaging,
  onEditPackaging,
  onDeletePackaging,
}: SupplierPackagingTableProps) {
  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Supplier Packaging</CardTitle>
        <CardDescription>
          {supplierPackaging.length} supplier packaging relationships from{" "}
          {new Set(supplierPackaging.map((sp) => sp.supplierId)).size} suppliers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SortableTable
          data={supplierPackaging}
          columns={[
            {
              key: "displayName",
              label: "Packaging Name",
              sortable: true,
              render: (value: string) => (
                <span className="font-medium text-foreground">{value}</span>
              ),
            },
            {
              key: "displayType",
              label: "Type",
              sortable: true,
              render: (value: string) => (
                <Badge variant="outline" className="text-xs">
                  {value}
                </Badge>
              ),
            },
            {
              key: "supplier",
              label: "Supplier",
              sortable: true,
              render: (value: any, row: SupplierPackagingWithDetails) => (
                <span className="text-foreground">
                  {row.supplier?.name || "N/A"}
                </span>
              ),
            },
            {
              key: "unitPrice",
              label: "Unit Price",
              sortable: true,
              render: (value: number) => (
                <span className="font-medium text-green-600">
                  ₹{value.toFixed(2)}
                </span>
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
              key: "actions",
              label: "Actions",
              sortable: false,
              render: (value: any, row: SupplierPackagingWithDetails) => (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-transparent"
                    onClick={() => onEditPackaging(row)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive bg-transparent"
                    onClick={() => onDeletePackaging(row.id)}
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
