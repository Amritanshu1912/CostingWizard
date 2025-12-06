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
import { usePackagingMutations } from "@/hooks/packaging-hooks/use-packaging-mutations";
import { usePackagingsWithSupplierCount } from "@/hooks/packaging-hooks/use-packaging-queries";
import type {
  PackagingFormData,
  PackagingWithSupplierCount,
} from "@/types/packaging-types";
import { AlertCircle, Loader2, Package, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DEFAULT_PACKAGING_FORM } from "./packaging-constants";
import { PackagingTable } from "./packaging-table";

interface PackagingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

/**
 * PackagingDrawer component manages the side panel for packaging inventory
 * Provides CRUD operations for packaging items with inline editing capabilities
 */
export function PackagingDrawer({
  open,
  onOpenChange,
  onRefresh,
}: PackagingDrawerProps) {
  const [editingPackagingId, setEditingPackagingId] = useState<string | null>(
    null
  );

  const [editForm, setEditForm] = useState<PackagingFormData>(
    DEFAULT_PACKAGING_FORM
  );

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [packagingToDelete, setPackagingToDelete] =
    useState<PackagingWithSupplierCount | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [shakeFields, setShakeFields] = useState(false);

  const packagingWithSuppliers = usePackagingsWithSupplierCount();

  const { createPackaging, updatePackaging, deletePackaging } =
    usePackagingMutations();

  // Prepare display data, adding a placeholder row when creating new items
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
      // Always put the new row at the top for immediate editing
      return [newRow, ...packagingWithSuppliers];
    }
    return packagingWithSuppliers;
  }, [packagingWithSuppliers, isAddingNew]);

  // Initialize editing mode for an existing packaging item
  const startEdit = (packaging: PackagingWithSupplierCount) => {
    setEditingPackagingId(packaging.id);
    setEditForm({
      name: packaging.name,
      type: packaging.type,
      capacity: packaging.capacity,
      capacityUnit: packaging.capacityUnit,
      buildMaterial: packaging.buildMaterial,
    });
  };

  // Initialize adding mode for a new packaging item
  const startAddingNew = () => {
    setIsAddingNew(true);
    setEditingPackagingId("new");
    setEditForm(DEFAULT_PACKAGING_FORM);
  };

  // Cancel current editing operation and reset form state
  const cancelEdit = () => {
    setEditingPackagingId(null);
    setIsAddingNew(false);
    setShakeFields(false);
    setEditForm(DEFAULT_PACKAGING_FORM);
  };

  // Save the current edit, either creating new or updating existing
  const saveEdit = async () => {
    if (!editingPackagingId) return;

    setLoading(true);
    try {
      if (isAddingNew) {
        await createPackaging(editForm);
        toast.success("Packaging added successfully");
      } else {
        await updatePackaging(editingPackagingId, editForm);
        toast.success("Packaging updated successfully");
      }

      cancelEdit();

      // Trigger refresh of parent components
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error saving packaging:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save packaging"
      );

      // Handle duplicate name error with visual feedback
      if (error instanceof Error && error.message.includes("already exists")) {
        setShakeFields(true);
        setTimeout(() => setShakeFields(false), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation dialog for a packaging item
  const initiateDelete = (packaging: PackagingWithSupplierCount) => {
    setPackagingToDelete(packaging);
    setDeleteConfirmOpen(true);
  };

  // Execute the delete operation after confirmation
  const confirmDelete = async () => {
    if (!packagingToDelete) return;

    setLoading(true);
    try {
      await deletePackaging(packagingToDelete.id);
      toast.success("Packaging deleted successfully");
      setDeleteConfirmOpen(false);
      setPackagingToDelete(null);
    } catch (error) {
      console.error("Error deleting packaging:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete packaging"
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate the count of active packaging items (excluding placeholder)
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
