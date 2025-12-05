// src/app/packaging/components/packaging-drawer.tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePackagingsWithSupplierCount } from "@/hooks/packaging-hooks/use-packaging-queries";
import { db } from "@/lib/db";
import type {
  BuildMaterial,
  CapacityUnit,
  PackagingType,
  PackagingWithSupplierCount,
} from "@/types/packaging-types";
import { normalizeText } from "@/utils/text-utils";
import { AlertCircle, Loader2, Package, Plus } from "lucide-react";
import { nanoid } from "nanoid";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PackagingTable } from "./packaging-table";

interface PackagingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export function PackagingDrawer({
  open,
  onOpenChange,
  onRefresh,
}: PackagingDrawerProps) {
  const [editingPackagingId, setEditingPackagingId] = useState<string | null>(
    null
  );
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    capacity: "",
    unit: "",
    buildMaterial: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [packagingToDelete, setPackagingToDelete] =
    useState<PackagingWithSupplierCount | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [shakeFields, setShakeFields] = useState(false);

  // Fetch packaging with supplier count
  const packagingWithSuppliers = usePackagingsWithSupplierCount();

  // Add placeholder row for new packaging when adding
  const displayData = useMemo(() => {
    if (isAddingNew) {
      const newRow: PackagingWithSupplierCount = {
        id: "new",
        name: "",
        type: "other",
        capacity: 0,
        capacityUnit: "ml",
        buildMaterial: "Other",
        supplierCount: 0,
        suppliers: [],
        createdAt: new Date().toISOString(),
        updatedAt: undefined,
      };
      // Always put the new row at the top
      return [newRow, ...packagingWithSuppliers];
    }
    return packagingWithSuppliers;
  }, [packagingWithSuppliers, isAddingNew]);

  // Start editing
  const startEdit = (packaging: PackagingWithSupplierCount) => {
    setEditingPackagingId(packaging.id);
    setEditForm({
      name: packaging.name,
      type: packaging.type,
      capacity: packaging.capacity?.toString() || "",
      unit: packaging.capacityUnit || "",
      buildMaterial: packaging.buildMaterial || "",
    });
  };

  // Start adding new packaging
  const startAddingNew = () => {
    setIsAddingNew(true);
    setEditingPackagingId("new");
    setEditForm({
      name: "",
      type: "",
      capacity: "",
      unit: "",
      buildMaterial: "",
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingPackagingId(null);
    setIsAddingNew(false);
    setShakeFields(false);
    setEditForm({
      name: "",
      type: "",
      capacity: "",
      unit: "",
      buildMaterial: "",
    });
  };

  // Save edit with transaction
  const saveEdit = async () => {
    if (!editingPackagingId) return;

    const trimmedName = editForm.name.trim();
    const trimmedType = editForm.type.trim();
    const capacityValue = parseFloat(editForm.capacity);
    const trimmedUnit = editForm.unit.trim();
    const trimmedBuildMaterial = editForm.buildMaterial.trim();

    if (!trimmedName || !trimmedType) {
      toast.error("Name and type are required");
      return;
    }

    if (editForm.capacity && (isNaN(capacityValue) || capacityValue <= 0)) {
      toast.error("Capacity must be a positive number");
      return;
    }

    if (editForm.capacity && !trimmedUnit) {
      toast.error("Unit is required when capacity is specified");
      return;
    }

    setLoading(true);
    try {
      await db.transaction("rw", [db.packaging], async () => {
        const now = new Date().toISOString();

        if (isAddingNew) {
          // Check for duplicate packaging with same properties
          const normalized = normalizeText(trimmedName);
          const existingPackaging = await db.packaging
            .filter((p) => normalizeText(p.name) === normalized)
            .first();

          if (existingPackaging) {
            // Check if all key properties are identical (normalize string comparisons)
            const isExactDuplicate =
              normalizeText(existingPackaging.type || "") ===
                normalizeText(trimmedType) &&
              existingPackaging.capacity === (capacityValue || 0) &&
              normalizeText(existingPackaging.capacityUnit || "") ===
                normalizeText(trimmedUnit) &&
              normalizeText(existingPackaging.buildMaterial || "") ===
                normalizeText(trimmedBuildMaterial);

            if (isExactDuplicate) {
              setShakeFields(true);
              setTimeout(() => setShakeFields(false), 500);
              toast.error(
                "A packaging with this name and identical properties already exists. Please modify at least one property (type, material, or capacity) to create a new entry."
              );
              return;
            }
          }

          // Add new packaging
          await db.packaging.add({
            id: nanoid(),
            name: trimmedName,
            type: trimmedType as PackagingType,
            capacity: capacityValue || 0,
            capacityUnit: (trimmedUnit || "ml") as CapacityUnit,
            buildMaterial: (trimmedBuildMaterial || "Other") as BuildMaterial,
            createdAt: now,
          });

          toast.success("Packaging added successfully");
        } else {
          // Check for duplicate packaging with same properties (excluding current packaging)
          const normalized = normalizeText(trimmedName);
          const existingPackaging = await db.packaging
            .filter(
              (p) =>
                p.id !== editingPackagingId &&
                normalizeText(p.name) === normalized
            )
            .first();

          if (existingPackaging) {
            // Check if all key properties are identical (normalize string comparisons)
            const isExactDuplicate =
              normalizeText(existingPackaging.type || "") ===
                normalizeText(trimmedType) &&
              existingPackaging.capacity === (capacityValue || 0) &&
              normalizeText(existingPackaging.capacityUnit || "") ===
                normalizeText(trimmedUnit) &&
              normalizeText(existingPackaging.buildMaterial || "") ===
                normalizeText(trimmedBuildMaterial);

            if (isExactDuplicate) {
              setShakeFields(true);
              setTimeout(() => setShakeFields(false), 500);
              toast.error(
                "A packaging with this name and identical properties already exists. Please modify at least one property (type, material, or capacity) to create a new entry."
              );
              return;
            }
          }

          // Update packaging
          await db.packaging.update(editingPackagingId, {
            name: trimmedName,
            type: trimmedType as PackagingType,
            capacity: capacityValue || 0,
            capacityUnit: (trimmedUnit || "ml") as CapacityUnit,
            buildMaterial: (trimmedBuildMaterial || "Other") as BuildMaterial,
            updatedAt: now,
          });

          toast.success("Packaging updated successfully");
        }

        cancelEdit();

        // Trigger refresh of other components
        if (onRefresh) onRefresh();
      });
    } catch (error) {
      console.error("Error saving packaging:", error);
      toast.error("Failed to save packaging");
    } finally {
      setLoading(false);
    }
  };

  // Initiate delete
  const initiateDelete = (packaging: PackagingWithSupplierCount) => {
    setPackagingToDelete(packaging);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete with transaction
  const confirmDelete = async () => {
    if (!packagingToDelete) return;

    setLoading(true);
    try {
      await db.transaction(
        "rw",
        [db.packaging, db.supplierPackaging],
        async () => {
          // Double-check no supplier packaging reference it
          const supplierPackCount = await db.supplierPackaging
            .where("packagingId")
            .equals(packagingToDelete.id)
            .count();

          if (supplierPackCount > 0) {
            toast.error("Cannot delete packaging that is used by suppliers");
            return;
          }

          await db.packaging.delete(packagingToDelete.id);
          toast.success("Packaging deleted successfully");
          setDeleteConfirmOpen(false);
          setPackagingToDelete(null);
        }
      );
    } catch (error) {
      console.error("Error deleting packaging:", error);
      toast.error("Failed to delete packaging");
    } finally {
      setLoading(false);
    }
  };

  const activePackaging =
    packagingWithSuppliers?.filter((p) => p.id !== "new").length || 0;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:w-[1200px] sm:max-w-[95vw] flex flex-col p-0"
        >
          {/* Header Section - Fixed */}
          <div className="border-b bg-background px-6 py-4">
            <SheetHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <SheetTitle className="text-2xl flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary" />
                    Packaging Management
                  </SheetTitle>
                  <SheetDescription className="text-base">
                    Manage your packaging inventory and specifications
                  </SheetDescription>
                </div>
                <Button
                  onClick={startAddingNew}
                  disabled={isAddingNew}
                  className="bg-primary hover:bg-primary/90"
                  size="default"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Packaging
                </Button>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {activePackaging} {activePackaging === 1 ? "Item" : "Items"}
                  </span>
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Content Section - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!packagingWithSuppliers ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Loading packaging...
                  </p>
                </div>
              </div>
            ) : packagingWithSuppliers.length === 0 ||
              (packagingWithSuppliers.length === 1 && isAddingNew) ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4 max-w-md">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No packaging yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Get started by adding your first packaging item. You can
                      link them to suppliers later.
                    </p>
                  </div>
                  {!isAddingNew && (
                    <Button onClick={startAddingNew} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Packaging
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {isAddingNew && (
                  <Alert className="border-primary/50 bg-primary/5">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      Fill in the details in the first row to add a new
                      packaging item
                    </AlertDescription>
                  </Alert>
                )}

                <div className="border rounded-lg overflow-hidden bg-card">
                  <PackagingTable
                    data={displayData}
                    editingPackagingId={editingPackagingId}
                    editForm={editForm}
                    loading={loading}
                    shakeFields={shakeFields}
                    onEditFormChange={setEditForm}
                    onStartEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onCancelEdit={cancelEdit}
                    onInitiateDelete={initiateDelete}
                  />
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete {packagingToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The packaging item will be
              permanently removed from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Packaging"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
