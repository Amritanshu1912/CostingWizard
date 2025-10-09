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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <div className="overflow-x-auto">
          <Table className="table-enhanced">
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground font-medium">#</TableHead>
                <TableHead className="text-foreground font-medium">
                  Material
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Supplier
                </TableHead>
                <TableHead className="text-foreground font-medium">
                  Category
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
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.map((material, index) => {
                const supplier = suppliers.find(
                  (s) => s.id === material.supplierId
                );
                return (
                  <TableRow key={material.id} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {material.materialName}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {supplier?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {material.materialCategory}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground font-medium">
                      {material.currency} {material.unitPrice.toFixed(2)}/
                      {material.unit}
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
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-transparent"
                          onClick={() => onEditMaterial(material)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive bg-transparent"
                          onClick={() => onDeleteMaterial(material.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
