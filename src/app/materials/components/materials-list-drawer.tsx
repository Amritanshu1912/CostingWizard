// src/app/materials/components/materials-list-drawer.tsx
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
import { AlertCircle, Loader2, Package, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Hooks
import { useMaterialsWithSuppliers } from "@/hooks/material-hooks/use-materials-queries";
import { useMaterialMutations } from "@/hooks/material-hooks/use-materials-mutations";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

// Types
import type { MaterialWithSuppliers } from "@/types/material-types";

// Components
import { MaterialsListTable } from "./materials-list-table";

interface MaterialsListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Drawer for managing the master materials list
 * Shows all materials with their supplier counts
 * Allows inline editing and deletion
 */
export function MaterialsListDrawer({
  open,
  onOpenChange,
}: MaterialsListDrawerProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(
    null
  );
  const [editForm, setEditForm] = useState({ name: "", category: "" });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] =
    useState<MaterialWithSuppliers | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // ============================================================================
  // DATA HOOKS
  // ============================================================================

  // Fetch materials with supplier info
  const materials = useMaterialsWithSuppliers();

  // Fetch categories for combobox
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  // Mutation hooks
  const { createMaterial, updateMaterial, deleteMaterial } =
    useMaterialMutations();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Add empty row for new material if adding
  const displayMaterials = isAddingNew
    ? [
        {
          id: "new",
          name: "",
          category: "",
          categoryColor: "#6366f1",
          notes: "",
          supplierCount: 0,
          suppliers: [],
          createdAt: new Date().toISOString(),
        } as MaterialWithSuppliers,
        ...materials,
      ]
    : materials;

  const activeMaterialsCount = materials.length;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Start editing a material
   */
  const startEdit = (material: MaterialWithSuppliers) => {
    setEditingMaterialId(material.id);
    setEditForm({ name: material.name, category: material.category });
  };

  /**
   * Start adding a new material
   */
  const startAddingNew = () => {
    setIsAddingNew(true);
    setEditingMaterialId("new");
    setEditForm({ name: "", category: "" });
  };

  /**
   * Cancel editing or adding
   */
  const cancelEdit = () => {
    setEditingMaterialId(null);
    setIsAddingNew(false);
    setEditForm({ name: "", category: "" });
  };

  /**
   * Save material (create or update)
   */
  const saveEdit = async () => {
    if (!editingMaterialId) return;

    const trimmedName = editForm.name.trim();
    const trimmedCategory = editForm.category.trim();

    if (!trimmedName || !trimmedCategory) {
      toast.error("Name and category are required");
      return;
    }

    setLoading(true);
    try {
      if (isAddingNew) {
        // Create new material
        await createMaterial({
          name: trimmedName,
          category: trimmedCategory,
        });
        toast.success("Material added successfully");
      } else {
        // Update existing material
        await updateMaterial(editingMaterialId, {
          name: trimmedName,
          category: trimmedCategory,
        });
        toast.success("Material updated successfully");
      }

      cancelEdit();
    } catch (error) {
      console.error("Error saving material:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save material"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiate delete (show confirmation dialog)
   */
  const initiateDelete = (material: MaterialWithSuppliers) => {
    setMaterialToDelete(material);
    setDeleteConfirmOpen(true);
  };

  /**
   * Confirm and execute delete
   */
  const confirmDelete = async () => {
    if (!materialToDelete) return;

    setLoading(true);
    try {
      await deleteMaterial(materialToDelete.id);
      toast.success("Material deleted successfully");
      setDeleteConfirmOpen(false);
      setMaterialToDelete(null);
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete material"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

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
                    Materials Management
                  </SheetTitle>
                  <SheetDescription className="text-base">
                    Manage your master materials list and specifications
                  </SheetDescription>
                </div>
                <Button
                  onClick={startAddingNew}
                  disabled={isAddingNew}
                  className="bg-primary hover:bg-primary/90"
                  size="default"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {activeMaterialsCount}{" "}
                    {activeMaterialsCount === 1 ? "Material" : "Materials"}
                  </span>
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Content Section - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!materials ? (
              // Loading state
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Loading materials...
                  </p>
                </div>
              </div>
            ) : materials.length === 0 && !isAddingNew ? (
              // Empty state
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4 max-w-md">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No materials yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Get started by adding your first material. You can link
                      them to suppliers later.
                    </p>
                  </div>
                  <Button onClick={startAddingNew} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Material
                  </Button>
                </div>
              </div>
            ) : (
              // Materials table
              <div className="space-y-4">
                {isAddingNew && (
                  <Alert className="border-primary/50 bg-primary/5">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      Fill in the details in the first row to add a new material
                    </AlertDescription>
                  </Alert>
                )}

                <MaterialsListTable
                  data={displayMaterials}
                  editingMaterialId={editingMaterialId}
                  editForm={editForm}
                  loading={loading}
                  categories={categories || []}
                  onEditFormChange={setEditForm}
                  onStartEdit={startEdit}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEdit}
                  onInitiateDelete={initiateDelete}
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {materialToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              material and remove it from all supplier material entries.
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
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
