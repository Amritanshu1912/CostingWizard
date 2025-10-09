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
import { Edit, Trash2, Star } from "lucide-react";
import type { Supplier, SupplierMaterial } from "@/lib/types";

interface SuppliersGridProps {
  suppliers: Supplier[];
  supplierMaterials: SupplierMaterial[];
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
}

export function SuppliersGrid({
  suppliers,
  supplierMaterials,
  onEditSupplier,
  onDeleteSupplier,
}: SuppliersGridProps) {
  const getMaterialsBySupplier = (supplierId: string) => {
    return supplierMaterials.filter((m) => m.supplierId === supplierId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {suppliers.map((supplier, index) => (
        <Card key={supplier.id} className="card-enhanced">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{supplier.name}</CardTitle>
                <CardDescription>{supplier.contactPerson}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium ml-1">
                    {supplier.rating}
                  </span>
                </div>
                <Badge
                  variant={supplier.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {supplier.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground">
                  {supplier.email || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="text-foreground">
                  {supplier.phone || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Terms:</span>
                <span className="text-foreground">{supplier.paymentTerms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lead Time:</span>
                <span className="text-foreground">
                  {supplier.leadTime} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Materials:</span>
                <span className="text-accent font-medium">
                  {getMaterialsBySupplier(supplier.id).length}
                </span>
              </div>
            </div>

            {supplier.notes && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {supplier.notes}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => onEditSupplier(supplier)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive bg-transparent"
                onClick={() => onDeleteSupplier(supplier.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
