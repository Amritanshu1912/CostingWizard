"use client";

import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Loader2, Plus, Package, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import type { MaterialWithSuppliers, Category } from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";
import { normalizeText } from "@/lib/text-utils";
import { nanoid } from "nanoid";
import { MaterialsTableDrawer } from "./materials-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { assignCategoryColor } from "@/lib/color-utils";
import { Input } from "@/components/ui/input";
import { SortableTable } from "@/components/ui/sortable-table";

interface MaterialsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export function MaterialsDrawer({
  open,
  onOpenChange,
  onRefresh,
}: MaterialsDrawerProps) {
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(
    null
  );
  const [editForm, setEditForm] = useState({ name: "", category: "" });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] =
    useState<MaterialWithSuppliers | null>(null);
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Fetch materials with supplier count
  const materialsWithSuppliers = useLiveQuery(async () => {
    const [materials, supplierMaterials, suppliers, categories] =
      await Promise.all([
        db.materials.toArray(),
        db.supplierMaterials.toArray(),
        db.suppliers.toArray(),
        db.categories.toArray(),
      ]);

    const result = materials.map((material) => {
      const supplierMatList = supplierMaterials.filter(
        (sm) => sm.materialId === material.id
      );

      const suppliersList = supplierMatList
        .map((sm) => suppliers.find((s) => s.id === sm.supplierId))
        .filter((s): s is (typeof suppliers)[0] => s !== undefined);

      const category = categories.find((c) => c.name === material.category);

      return {
        ...material,
        supplierCount: suppliersList.length,
        suppliersList: suppliersList,
        categoryColor:
          category?.color || assignCategoryColor(material.category),
      } as MaterialWithSuppliers & { categoryColor: string };
    });

    // Add empty row for new material if adding
    if (isAddingNew) {
      result.unshift({
        id: "new",
        name: "",
        category: "",
        supplierCount: 0,
        suppliersList: [],
        createdAt: new Date().toISOString(),
        categoryColor: assignCategoryColor("Other"),
      } as MaterialWithSuppliers & { categoryColor: string });
    }

    return result;
  }, [isAddingNew]);

  // Fetch categories for combobox
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  // Filter categories based on search
  const filteredCategories =
    categories?.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    ) || [];

  const isNewCategory = !categories?.some(
    (c) => normalizeText(c.name) === normalizeText(categorySearch)
  );

  // Start editing
  const startEdit = (material: MaterialWithSuppliers) => {
    setEditingMaterialId(material.id);
    setEditForm({ name: material.name, category: material.category });
    setCategorySearch(material.category);
  };

  // Start adding new material
  const startAddingNew = () => {
    setIsAddingNew(true);
    setEditingMaterialId("new");
    setEditForm({
      name: "",
      category: "",
    });
    setCategorySearch("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingMaterialId(null);
    setIsAddingNew(false);
    setEditForm({ name: "", category: "" });
    setCategorySearch("");
  };

  // Handle category selection in edit
  const handleSelectCategory = (category: Category) => {
    setEditForm({ ...editForm, category: category.name });
    setCategorySearch(category.name);
    setOpenCategoryCombobox(false);
  };

  // Handle new category creation
  const handleNewCategory = () => {
    setEditForm({ ...editForm, category: categorySearch });
    setOpenCategoryCombobox(false);
  };

  // Save edit
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
      const now = new Date().toISOString();

      if (isAddingNew) {
        // Check for duplicate name
        const normalized = normalizeText(trimmedName);
        const duplicate = await db.materials
          .filter((m) => normalizeText(m.name) === normalized)
          .first();

        if (duplicate) {
          toast.error(`Material "${duplicate.name}" already exists`);
          return;
        }

        // Create new material
        await db.materials.add({
          id: nanoid(),
          name: trimmedName,
          category: trimmedCategory,
          createdAt: now,
        });

        toast.success("Material added successfully");
      } else {
        // Check for duplicate name (excluding current material)
        const normalized = normalizeText(trimmedName);
        const duplicate = await db.materials
          .filter(
            (m) =>
              m.id !== editingMaterialId && normalizeText(m.name) === normalized
          )
          .first();

        if (duplicate) {
          toast.error(`Material "${duplicate.name}" already exists`);
          return;
        }

        // Create/update category if needed
        const existingCategory = await db.categories
          .filter(
            (c) => normalizeText(c.name) === normalizeText(trimmedCategory)
          )
          .first();

        if (!existingCategory) {
          await db.categories.add({
            id: nanoid(),
            name: trimmedCategory,
            color: assignCategoryColor(trimmedCategory),
            createdAt: now,
          });
        }

        // Update material
        await db.materials.update(editingMaterialId, {
          name: trimmedName,
          category: trimmedCategory,
          updatedAt: now,
        });

        toast.success("Material updated successfully");
      }

      cancelEdit();

      // Trigger refresh of other components
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error saving material:", error);
      toast.error("Failed to save material");
    } finally {
      setLoading(false);
    }
  };

  // Initiate delete
  const initiateDelete = (material: MaterialWithSuppliers) => {
    setMaterialToDelete(material);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!materialToDelete) return;

    setLoading(true);
    try {
      // Double-check no supplier materials reference it
      const supplierMatCount = await db.supplierMaterials
        .where("materialId")
        .equals(materialToDelete.id)
        .count();

      if (supplierMatCount > 0) {
        toast.error("Cannot delete material that is used by suppliers");
        return;
      }

      await db.materials.delete(materialToDelete.id);
      toast.success("Material deleted successfully");
      setDeleteConfirmOpen(false);
      setMaterialToDelete(null);
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("Failed to delete material");
    } finally {
      setLoading(false);
    }
  };

  const totalMaterials = materialsWithSuppliers?.length || 0;
  const activeMaterials =
    materialsWithSuppliers?.filter((m) => m.id !== "new").length || 0;

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
                    Manage your raw materials inventory and specifications
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
                    {activeMaterials} {activeMaterials === 1 ? "Item" : "Items"}
                  </span>
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Content Section - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!materialsWithSuppliers ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Loading materials...
                  </p>
                </div>
              </div>
            ) : materialsWithSuppliers.length === 0 ||
              (materialsWithSuppliers.length === 1 && isAddingNew) ? (
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
                  {!isAddingNew && (
                    <Button onClick={startAddingNew} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Material
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
                      Fill in the details in the first row to add a new material
                      item
                    </AlertDescription>
                  </Alert>
                )}

                <MaterialsTableDrawer
                  data={materialsWithSuppliers}
                  editingMaterialId={editingMaterialId}
                  editForm={editForm}
                  loading={loading}
                  categories={categories}
                  categorySearch={categorySearch}
                  openCategoryCombobox={openCategoryCombobox}
                  onEditFormChange={setEditForm}
                  onStartEdit={startEdit}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEdit}
                  onInitiateDelete={initiateDelete}
                  onCategorySearchChange={setCategorySearch}
                  onSelectCategory={handleSelectCategory}
                  onNewCategory={handleNewCategory}
                  onOpenCategoryComboboxChange={setOpenCategoryCombobox}
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
              This action cannot be undone.
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
