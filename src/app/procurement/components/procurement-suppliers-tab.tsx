"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Package, Search } from "lucide-react";
import type { Supplier, SupplierMaterial } from "@/lib/types";
import { AddSupplierDialog } from "./procurement-dialogs";
import { SuppliersTable } from "./procurement-tables";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SuppliersTabProps {
  suppliers: Supplier[];
  materialsBySupplier: Record<string, number>;
  supplierMaterials: SupplierMaterial[];
  onAddSupplier: (supplier: Supplier) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
}

export function SuppliersTab({
  suppliers,
  materialsBySupplier,
  supplierMaterials,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
}: SuppliersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteSupplierId, setDeleteSupplierId] = useState<string | null>(null);

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      supplier.isActive !== false
  );

  return (
    <div className="space-y-6">
      {/* Top Suppliers */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Top Suppliers</CardTitle>
          <CardDescription>
            Best performing suppliers by rating and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suppliers
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 3)
              .map((supplier) => {
                const materialCount = materialsBySupplier[supplier.id] || 0;

                return (
                  <div
                    key={supplier.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {supplier.name}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {materialCount} materials • {supplier.contactPerson}
                        </div>

                        <div className="flex items-center space-x-4 mt-2">
                          <div className="text-xs">
                            <span className="text-muted-foreground">
                              On-time:{" "}
                            </span>
                            <span className="font-medium">
                              {supplier.performance?.onTimeDelivery ?? "-"}%
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">
                              Quality:{" "}
                            </span>
                            <span className="font-medium">
                              {supplier.performance?.qualityScore ?? "-"}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{supplier.rating}</span>
                      </div>
                      <Badge
                        variant={supplier.isActive ? "default" : "secondary"}
                      >
                        {supplier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Supplier Directory</CardTitle>
              <CardDescription>
                Manage your supplier relationships and materials
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddSupplier(true)}>
                Add Supplier
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <SuppliersTable
            suppliers={filteredSuppliers}
            showIndex
            onEdit={(supplier) => {
              setEditingSupplier(supplier);
              setShowAddSupplier(true);
            }}
            onDelete={(supplier) => setDeleteSupplierId(supplier.id)}
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteSupplierId}
        onOpenChange={() => setDeleteSupplierId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this supplier? This action will
              mark the supplier as inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteSupplierId) onDeleteSupplier(deleteSupplierId);
                setDeleteSupplierId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddSupplierDialog
        isOpen={showAddSupplier}
        setIsOpen={setShowAddSupplier}
        isEdit={!!editingSupplier}
        initialData={editingSupplier}
        onSave={(supplier) => {
          if (editingSupplier) {
            onEditSupplier(supplier);
          } else {
            onAddSupplier(supplier);
          }
          setEditingSupplier(null);
          setShowAddSupplier(false);
        }}
      />
    </div>
  );
}
