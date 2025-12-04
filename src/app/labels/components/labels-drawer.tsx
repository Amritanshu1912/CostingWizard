// src/app/labels/components/labels-drawer.tsx
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
import { useLabelMutations } from "@/hooks/label-hooks/use-labels-mutations";
import { useLabelsWithSuppliers } from "@/hooks/label-hooks/use-labels-queries";
import type { LabelFormData, LabelWithSuppliers } from "@/types/label-types";

import { AlertCircle, Loader2, Plus, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LabelsTableDrawer } from "./labels-table";

interface LabelsDrawerProps {
  onRefresh?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LabelsDrawer({
  open,
  onOpenChange,
  onRefresh,
}: LabelsDrawerProps) {
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<LabelFormData>({
    name: "",
    type: "sticker",
    printingType: "bw",
    material: "paper",
    shape: "rectangular",
    size: "",
    notes: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<LabelWithSuppliers | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [shakeFields, setShakeFields] = useState(false);

  // Fetch labels with supplier count using optimized hook
  const allLabelsWithSuppliers = useLabelsWithSuppliers();

  // Mutation hooks
  const { createLabel, updateLabel, deleteLabel } = useLabelMutations();

  // Add empty row for new label if adding
  const labelsWithSuppliers = useMemo(() => {
    if (!allLabelsWithSuppliers) return [];

    const result = [...allLabelsWithSuppliers];

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
        notes: "",
        supplierCount: 0,
        suppliers: [],
        createdAt: new Date().toISOString(),
      } as LabelWithSuppliers);
    }

    return result;
  }, [allLabelsWithSuppliers, isAddingNew]);

  // Start editing
  const startEdit = (label: LabelWithSuppliers) => {
    setEditingLabelId(label.id);
    setEditForm({
      name: label.name,
      type: label.type,
      printingType: label.printingType,
      material: label.material,
      shape: label.shape,
      size: label.size || "",
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
      notes: "",
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingLabelId(null);
    setIsAddingNew(false);
    setShakeFields(false);
    setEditForm({
      name: "",
      type: "sticker",
      printingType: "bw",
      material: "paper",
      shape: "rectangular",
      size: "",
      notes: "",
    });
  };

  // Save edit using mutation hooks
  const saveEdit = async () => {
    if (!editingLabelId) return;

    const trimmedName = editForm.name.trim();
    const trimmedType = editForm.type.trim();

    if (!trimmedName || !trimmedType) {
      toast.error("Name and type are required");
      return;
    }

    setLoading(true);
    try {
      if (isAddingNew) {
        await createLabel({
          name: trimmedName,
          type: editForm.type,
          printingType: editForm.printingType,
          material: editForm.material,
          shape: editForm.shape,
          size: editForm.size?.trim() || undefined,
          notes: editForm.notes || undefined,
        });
        toast.success("Label added successfully");
      } else {
        await updateLabel(editingLabelId, {
          name: trimmedName,
          type: editForm.type,
          printingType: editForm.printingType,
          material: editForm.material,
          shape: editForm.shape,
          size: editForm.size?.trim() || undefined,
          notes: editForm.notes || undefined,
        });
        toast.success("Label updated successfully");
      }

      cancelEdit();

      // Trigger refresh of other components
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error("Error saving label:", error);
      toast.error(error.message || "Failed to save label");
    } finally {
      setLoading(false);
    }
  };

  // Initiate delete
  const initiateDelete = (label: LabelWithSuppliers) => {
    setLabelToDelete(label);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete using mutation hook
  const confirmDelete = async () => {
    if (!labelToDelete) return;

    setLoading(true);
    try {
      await deleteLabel(labelToDelete.id);
      toast.success("Label deleted successfully");
      setDeleteConfirmOpen(false);
      setLabelToDelete(null);
    } catch (error: any) {
      console.error("Error deleting label:", error);
      toast.error(error.message || "Failed to delete label");
    } finally {
      setLoading(false);
    }
  };

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

                <div className="border rounded-lg overflow-hidden bg-card">
                  <LabelsTableDrawer
                    data={labelsWithSuppliers}
                    editingLabelId={editingLabelId}
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
              Delete {labelToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The label item will be permanently
              removed from your inventory.
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
