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
import { Loader2, Plus, Tag, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import type { LabelsWithSuppliers } from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";
import { normalizeText } from "@/lib/text-utils";
import { nanoid } from "nanoid";
import { LabelsTableDrawer } from "./labels-table";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LabelsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LabelsDrawer({ open, onOpenChange }: LabelsDrawerProps) {
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    printingType: "",
    material: "",
    shape: "",
    size: "",
    labelFor: "",
    notes: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] =
    useState<LabelsWithSuppliers | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Fetch labels with supplier count
  const labelsWithSuppliers = useLiveQuery(async () => {
    const [labels, supplierLabels] = await Promise.all([
      db.labels.toArray(),
      db.supplierLabels.toArray(),
    ]);

    const result = labels.map((label) => {
      const supplierLabelList = supplierLabels.filter(
        (sl) => sl.labelId === label.id
      );

      return {
        ...label,
        supplierCount: supplierLabelList.length,
        suppliersList: [], // We'll populate this if needed
      } as LabelsWithSuppliers;
    });

    // Add empty row for new label if adding
    if (isAddingNew) {
      result.unshift({
        id: "new",
        name: "",
        type: "sticker",
        printingType: "color",
        material: "paper",
        shape: "rectangular",
        size: "",
        labelFor: "",
        notes: "",
        supplierCount: 0,
        suppliersList: [],
        createdAt: new Date().toISOString(),
      } as LabelsWithSuppliers);
    }

    return result;
  }, [isAddingNew]);

  // Start editing
  const startEdit = (label: LabelsWithSuppliers) => {
    setEditingLabelId(label.id);
    setEditForm({
      name: label.name,
      type: label.type,
      printingType: label.printingType,
      material: label.material,
      shape: label.shape,
      size: label.size || "",
      labelFor: label.labelFor || "",
      notes: label.notes || "",
    });
  };

  // Start adding new label
  const startAddingNew = () => {
    setIsAddingNew(true);
    setEditingLabelId("new");
    setEditForm({
      name: "",
      type: "sticker",
      printingType: "color",
      material: "paper",
      shape: "rectangular",
      size: "",
      labelFor: "",
      notes: "",
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingLabelId(null);
    setIsAddingNew(false);
    setEditForm({
      name: "",
      type: "",
      printingType: "",
      material: "",
      shape: "",
      size: "",
      labelFor: "",
      notes: "",
    });
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingLabelId) return;

    const trimmedName = editForm.name.trim();

    if (!trimmedName) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toISOString();

      if (isAddingNew) {
        // Check for duplicate name
        const normalized = normalizeText(trimmedName);
        const duplicate = await db.labels
          .filter((l) => normalizeText(l.name) === normalized)
          .first();

        if (duplicate) {
          toast.error(`Label "${duplicate.name}" already exists`);
          return;
        }

        // Create new label
        await db.labels.add({
          id: nanoid(),
          name: trimmedName,
          type: editForm.type as "sticker" | "label" | "tag",
          printingType: editForm.printingType as
            | "bw"
            | "color"
            | "foil"
            | "embossed",
          material: editForm.material as
            | "paper"
            | "vinyl"
            | "plastic"
            | "other",
          shape: editForm.shape as "rectangular" | "custom",
          size: editForm.size || undefined,
          labelFor: editForm.labelFor || undefined,
          notes: editForm.notes || undefined,
          createdAt: now,
        });

        toast.success("Label added successfully");
      } else {
        // Check for duplicate name (excluding current label)
        const normalized = normalizeText(trimmedName);
        const duplicate = await db.labels
          .filter(
            (l) =>
              l.id !== editingLabelId && normalizeText(l.name) === normalized
          )
          .first();

        if (duplicate) {
          toast.error(`Label "${duplicate.name}" already exists`);
          return;
        }

        // Update label
        await db.labels.update(editingLabelId, {
          name: trimmedName,
          type: editForm.type as "sticker" | "label" | "tag",
          printingType: editForm.printingType as
            | "bw"
            | "color"
            | "foil"
            | "embossed",
          material: editForm.material as
            | "paper"
            | "vinyl"
            | "plastic"
            | "other",
          shape: editForm.shape as "rectangular" | "custom",
          size: editForm.size || undefined,
          labelFor: editForm.labelFor || undefined,
          notes: editForm.notes || undefined,
          updatedAt: now,
        });

        toast.success("Label updated successfully");
      }

      cancelEdit();
    } catch (error) {
      console.error("Error saving label:", error);
      toast.error("Failed to save label");
    } finally {
      setLoading(false);
    }
  };

  // Initiate delete
  const initiateDelete = (label: LabelsWithSuppliers) => {
    setLabelToDelete(label);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!labelToDelete) return;

    setLoading(true);
    try {
      // Double-check no supplier labels reference it
      const supplierLabelCount = await db.supplierLabels
        .where("labelId")
        .equals(labelToDelete.id)
        .count();

      if (supplierLabelCount > 0) {
        toast.error("Cannot delete label that is used by suppliers");
        return;
      }

      await db.labels.delete(labelToDelete.id);
      toast.success("Label deleted successfully");
      setDeleteConfirmOpen(false);
      setLabelToDelete(null);
    } catch (error) {
      console.error("Error deleting label:", error);
      toast.error("Failed to delete label");
    } finally {
      setLoading(false);
    }
  };

  const totalLabels = labelsWithSuppliers?.length || 0;
  const activeLabels =
    labelsWithSuppliers?.filter((l) => l.id !== "new").length || 0;

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
                    <Tag className="h-6 w-6 text-primary" />
                    Labels Management
                  </SheetTitle>
                  <SheetDescription className="text-base">
                    Manage your label inventory and specifications
                  </SheetDescription>
                </div>
                <Button
                  onClick={startAddingNew}
                  disabled={isAddingNew}
                  className="bg-primary hover:bg-primary/90"
                  size="default"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Label
                </Button>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {activeLabels} {activeLabels === 1 ? "Item" : "Items"}
                  </span>
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Content Section - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!labelsWithSuppliers ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Loading labels...
                  </p>
                </div>
              </div>
            ) : labelsWithSuppliers.length === 0 ||
              (labelsWithSuppliers.length === 1 && isAddingNew) ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4 max-w-md">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Tag className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No labels yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Get started by adding your first label. You can link them
                      to suppliers later.
                    </p>
                  </div>
                  {!isAddingNew && (
                    <Button onClick={startAddingNew} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Label
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
                      Fill in the details in the first row to add a new label
                      item
                    </AlertDescription>
                  </Alert>
                )}

                <LabelsTableDrawer
                  data={labelsWithSuppliers}
                  editingLabelId={editingLabelId}
                  editForm={editForm}
                  loading={loading}
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
            <AlertDialogTitle>Delete {labelToDelete?.name}?</AlertDialogTitle>
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
