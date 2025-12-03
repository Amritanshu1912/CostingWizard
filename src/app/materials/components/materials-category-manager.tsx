// src/app/materials/components/materials-category-manager.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/types/material-types";
import { Edit, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (data: { name: string; description?: string }) => Promise<void>;
  onUpdate: (
    id: string,
    data: { name: string; description?: string }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

/**
 * Dialog for managing material categories
 * Allows CRUD operations on categories
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Add new category
   */
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    // Check for duplicates
    if (
      categories.some(
        (cat) => cat.name.toLowerCase() === newCategory.name.toLowerCase()
      )
    ) {
      toast.error("Category already exists");
      return;
    }

    try {
      await onAdd({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || undefined,
      });
      setNewCategory({ name: "", description: "" });
      toast.success("Category added successfully");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error already handled by parent
    }
  };

  /**
   * Start editing a category
   */
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
  };

  /**
   * Update category
   */
  const handleUpdateCategory = async () => {
    if (!editingCategory?.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await onUpdate(editingCategory.id, {
        name: editingCategory.name.trim(),
        description: editingCategory.description?.trim() || undefined,
      });
      setEditingCategory(null);
      toast.success("Category updated successfully");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error already handled by parent
    }
  };

  /**
   * Delete category
   */
  const handleDeleteCategory = async (id: string) => {
    try {
      await onDelete(id);
      toast.success("Category deleted successfully");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error already handled by parent
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 sm:flex-none">
          <Settings className="h-4 w-4 mr-2" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Manage Categories
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove material categoriess
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Category */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-foreground">Add New Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="category-name"
                  className="text-foreground mb-2 ml-1"
                >
                  Category Name *
                </Label>
                <Input
                  id="category-name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="Enter category name"
                  className="focus-enhanced"
                />
              </div>
              <div>
                <Label
                  htmlFor="category-desc"
                  className="text-foreground mb-2 ml-1"
                >
                  Description
                </Label>
                <Input
                  id="category-desc"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Optional description"
                  className="focus-enhanced"
                />
              </div>
            </div>
            <Button onClick={handleAddCategory} className="btn-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Existing Categories */}
          <div className="space-y-4 bg-gray-100 p-2">
            <h3 className="font-medium text-foreground ">
              Existing Categories ({categories.length})
            </h3>
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Category Dialog */}
        {editingCategory && (
          <Dialog
            open={!!editingCategory}
            onOpenChange={() => setEditingCategory(null)}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Edit Category
                </DialogTitle>
                <DialogDescription>Update category details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="text-foreground">
                    Category Name *
                  </Label>
                  <Input
                    id="edit-name"
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                      })
                    }
                    className="focus-enhanced"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-desc" className="text-foreground">
                    Description
                  </Label>
                  <Input
                    id="edit-desc"
                    value={editingCategory.description || ""}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        description: e.target.value,
                      })
                    }
                    className="focus-enhanced"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleUpdateCategory}
                    className="flex-1 btn-secondary"
                  >
                    Update Category
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingCategory(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
