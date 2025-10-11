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
import type { Packaging, Supplier } from "@/lib/types";

interface PackagingTableProps {
  filteredPackaging: Packaging[];
  suppliers: Supplier[];
  onEditPackaging: (packaging: Packaging) => void;
  onDeletePackaging: (id: string) => void;
}

export function PackagingTable({
  filteredPackaging,
  suppliers,
  onEditPackaging,
  onDeletePackaging,
}: PackagingTableProps) {
  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Packaging Items</CardTitle>
        <CardDescription>
          {filteredPackaging.length} packaging items from {suppliers.length} suppliers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SortableTable
          data={filteredPackaging}
          columns={[
            {
              key: "name",
              label: "Packaging Name",
              sortable: true,
              render: (value: string) => (
                <span className="font-medium text-foreground">{value}</span>
              ),
            },
            {
              key: "type",
              label: "Type",
              sortable: true,
              render: (value: string) => (
                <Badge variant="outline" className="text-xs">
                  {value}
                </Badge>
              ),
            },
            {
              key: "size",
              label: "Size",
              sortable: true,
              render: (value: string) => (
                <span className="text-muted-foreground">{value || "N/A"}</span>
              ),
            },
            {
              key: "unit",
              label: "Unit",
              sortable: true,
              render: (value: string) => (
                <span className="text-muted-foreground">{value}</span>
              ),
            },
            {
              key: "supplierName",
              label: "Supplier",
              sortable: true,
              render: (value: any, row: Packaging) => {
                const supplier = suppliers.find((s) => s.id === row.supplierId);
                return (
                  <span className="text-foreground">{supplier?.name || "N/A"}</span>
                );
              },
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
              render: (value: any, row: Packaging) => (
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
