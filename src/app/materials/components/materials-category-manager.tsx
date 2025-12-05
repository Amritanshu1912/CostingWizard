// src/app/materials/components/materials-category-manager.tsx
"use client";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types/material-types";
import { Check, Edit, Loader2, Plus, Settings, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (data: {
    name: string;
    description?: string;
    color?: string;
  }) => Promise<void>;
  onUpdate: (
    id: string,
    data: { name: string; description?: string; color?: string }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface EditingCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

/**
 * Dialog for managing material categories with inline editing
 */
export function CategoryManager({
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditingCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    category: Category | null;
  }>({ open: false, category: null });

  const nameInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Focus name input when adding new or editing
  useEffect(() => {
    if ((isAddingNew || editingId) && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isAddingNew, editingId]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Start adding new category
   */
  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditForm({
      id: "new",
      name: "",
      description: "",
      color: "#6366f1", // Default indigo
    });
  };

  /**
   * Start editing existing category
   */
  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm({
      id: category.id,
      name: category.name,
      description: category.description || "",
      color: category.color,
    });
  };

  /**
   * Cancel add/edit
   */
  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setEditForm(null);
  };

  /**
   * Save (create or update)
   */
  const handleSave = async () => {
    if (!editForm || !editForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    // Check for duplicates
    const normalized = editForm.name.trim().toLowerCase();
    const isDuplicate = categories.some(
      (cat) => cat.id !== editForm.id && cat.name.toLowerCase() === normalized
    );

    if (isDuplicate) {
      toast.error("A category with this name already exists");
      return;
    }

    setLoading(true);
    try {
      if (isAddingNew) {
        await onAdd({
          name: editForm.name.trim(),
          description: editForm.description.trim() || undefined,
          color: editForm.color,
        });
        toast.success("Category added successfully");
      } else {
        await onUpdate(editForm.id, {
          name: editForm.name.trim(),
          description: editForm.description.trim() || undefined,
          color: editForm.color,
        });
        toast.success("Category updated successfully");
      }
      handleCancel();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save category"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiate delete
   */
  const handleInitiateDelete = (category: Category) => {
    setDeleteConfirm({ open: true, category });
  };

  /**
   * Confirm delete
   */
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.category) return;

    setLoading(true);
    try {
      await onDelete(deleteConfirm.category.id);
      toast.success("Category deleted successfully");
      setDeleteConfirm({ open: false, category: null });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update form field
   */
  const updateField = (field: keyof EditingCategory, value: string) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render edit form row
   */
  const renderEditRow = () => {
    if (!editForm) return null;

    return (
      <div className="border-2 border-primary/30 rounded-lg p-4 bg-primary/5 animate-in fade-in-0 slide-in-from-top-2 duration-200">
        <div className="grid grid-cols-12 gap-3 mb-3">
          {/* Name - 4 cols */}
          <div className="col-span-4">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              ref={nameInputRef}
              value={editForm.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Enter category name"
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
            />
          </div>

          {/* Color - 2 cols */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Color
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={editForm.color}
                onChange={(e) => updateField("color", e.target.value)}
                className="h-9 w-16 p-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Description - 6 cols */}
          <div className="col-span-6">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Description
            </label>
            <Input
              value={editForm.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Optional description"
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              Enter
            </kbd>{" "}
            to save,{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              Esc
            </kbd>{" "}
            to cancel
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
              className="h-8 border"
            >
              <X className="h-4 w-4 mr-1.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={loading || !editForm.name.trim()}
              className="h-8 bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render category item row
   */
  const renderCategoryRow = (category: Category) => {
    return (
      <div
        key={category.id}
        className="group border rounded-lg p-3 hover:border-primary/30 hover:bg-accent/5 transition-all duration-150"
      >
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Color indicator - 1 col */}
          <div className="col-span-1 flex justify-center">
            <div
              className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
              style={{ backgroundColor: category.color }}
              title={category.color}
            />
          </div>

          {/* Name - 3 cols */}
          <div className="col-span-3">
            <div className="font-medium text-foreground">{category.name}</div>
          </div>

          {/* Description - 6 cols */}
          <div className="col-span-6">
            {category.description ? (
              <div className="text-sm text-muted-foreground">
                {category.description}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground/50 italic">
                No description
              </div>
            )}
          </div>

          {/* Actions - 2 cols */}
          <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStartEdit(category)}
              disabled={loading || isAddingNew || editingId !== null}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
              title="Edit category"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleInitiateDelete(category)}
              disabled={loading || isAddingNew || editingId !== null}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              title="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Settings className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
          {/* Header - Fixed */}
          <div className="px-6 pt-6 pb-4 border-b">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    Manage Categories
                  </DialogTitle>
                </div>
                <Button
                  onClick={handleStartAdd}
                  disabled={isAddingNew || editingId !== null || loading}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 mr-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </DialogHeader>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium">
                {categories.length}{" "}
                {categories.length === 1 ? "category" : "categories"}
              </span>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-3">
              {/* Edit form at top when adding/editing */}
              {(isAddingNew || editingId) && renderEditRow()}

              {/* Category list */}
              {categories.length === 0 && !isAddingNew ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Settings className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No categories yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first category to start organizing materials
                  </p>
                  <Button onClick={handleStartAdd} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Category
                  </Button>
                </div>
              ) : (
                categories.map((category) =>
                  editingId === category.id ? null : renderCategoryRow(category)
                )
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          {categories.length > 0 && (
            <div className="px-6 py-4 border-t bg-muted/30">
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="text-red-500">*</span>
                <span> Categories in use cannot be deleted</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, category: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &quot;{deleteConfirm.category?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              category.{" "}
              <span className="font-medium text-foreground">
                Materials using this category will need to be reassigned.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Category"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
