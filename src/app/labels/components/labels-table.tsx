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
import type { Label, Supplier } from "@/lib/types";

interface LabelsTableProps {
  labels: Label[];
  suppliers: Supplier[];
  onEditLabel: (label: Label) => void;
  onDeleteLabel: (id: string) => void;
}

export function LabelsTable({
  labels,
  suppliers,
  onEditLabel,
  onDeleteLabel,
}: LabelsTableProps) {
  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Label Items</CardTitle>
        <CardDescription>
          {labels.length} label items from {suppliers.length} suppliers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SortableTable
          data={labels}
          columns={[
            {
              key: "name",
              label: "Label Name",
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
              key: "printingType",
              label: "Printing",
              sortable: true,
              render: (value: string) => (
                <Badge variant="secondary" className="text-xs">
                  {value}
                </Badge>
              ),
            },
            {
              key: "material",
              label: "Material",
              sortable: true,
              render: (value: string) => (
                <span className="text-muted-foreground">{value}</span>
              ),
            },
            {
              key: "shape",
              label: "Shape",
              sortable: true,
              render: (value: string) => (
                <span className="text-muted-foreground">{value}</span>
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
              key: "actions",
              label: "Actions",
              sortable: false,
              render: (value: any, row: Label) => (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-transparent"
                    onClick={() => onEditLabel(row)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive bg-transparent"
                    onClick={() => onDeleteLabel(row.id)}
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
