"use client";

import { useState, useMemo } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SortableTable } from "@/components/ui/sortable-table";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { db } from "@/lib/db";
import type { MaterialWithSuppliers, Category, Supplier } from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";
import { normalizeText } from "@/lib/text-utils";
import { nanoid } from "nanoid";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { assignCategoryColor } from "@/lib/color-utils";

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

  // Fetch materials with supplier count
  const materialsWithSuppliers = useLiveQuery(async () => {
    const [materials, supplierMaterials, suppliers, categories] =
      await Promise.all([
        db.materials.toArray(),
        db.supplierMaterials.toArray(),
        db.suppliers.toArray(),
        db.categories.toArray(),
      ]);

    return materials.map((material) => {
      const supplierMatList = supplierMaterials.filter(
        (sm) => sm.materialId === material.id
      );

      const suppliersList = supplierMatList
        .map((sm) => suppliers.find((s) => s.id === sm.supplierId))
        .filter((s): s is Supplier => s !== undefined);

      const category = categories.find((c) => c.name === material.category);

      return {
        ...material,
        supplierCount: suppliersList.length,
        suppliers: suppliersList,
        categoryColor:
          category?.color || assignCategoryColor(material.category),
      } as MaterialWithSuppliers & { categoryColor: string };
    });
  }, []);

  // Fetch categories for combobox
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!categorySearch) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const isNewCategory = useMemo(() => {
    if (!categorySearch || !categories) return false;
    return !categories.some(
      (c) => normalizeText(c.name) === normalizeText(categorySearch)
    );
  }, [categorySearch, categories]);

  // Start editing
  const startEdit = (material: MaterialWithSuppliers) => {
    setEditingMaterialId(material.id);
    setEditForm({ name: material.name, category: material.category });
    setCategorySearch(material.category);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingMaterialId(null);
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
        .filter((c) => normalizeText(c.name) === normalizeText(trimmedCategory))
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
      cancelEdit();

      // Trigger refresh of other components
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error updating material:", error);
      toast.error("Failed to update material");
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

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Material Name",
        sortable: true,
        render: (_: any, row: MaterialWithSuppliers) => {
          if (editingMaterialId === row.id) {
            return (
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="h-8"
                autoFocus
              />
            );
          }
          return (
            <span className="font-medium text-foreground">{row.name}</span>
          );
        },
      },
      {
        key: "category",
        label: "Category",
        sortable: true,
        render: (
          _: any,
          row: MaterialWithSuppliers & { categoryColor: string }
        ) => {
          if (editingMaterialId === row.id) {
            return (
              <Popover
                open={openCategoryCombobox}
                onOpenChange={setOpenCategoryCombobox}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    size="sm"
                    className="h-8 w-full justify-between"
                  >
                    {editForm.category || "Select"}
                    <ChevronsUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search..."
                      value={categorySearch}
                      onValueChange={setCategorySearch}
                    />
                    <CommandList>
                      {filteredCategories.length > 0 && (
                        <CommandGroup>
                          {filteredCategories.map((cat) => (
                            <CommandItem
                              key={cat.id}
                              onSelect={() => handleSelectCategory(cat)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  editForm.category === cat.name
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: cat.color }}
                                />
                                {cat.name}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                      {isNewCategory && categorySearch && (
                        <CommandGroup>
                          <CommandItem onSelect={handleNewCategory}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create "{categorySearch}"
                          </CommandItem>
                        </CommandGroup>
                      )}
                      {!categorySearch && filteredCategories.length === 0 && (
                        <CommandEmpty>Start typing...</CommandEmpty>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            );
          }
          return (
            <Badge
              variant="secondary"
              style={{
                backgroundColor: row.categoryColor + "20",
                color: row.categoryColor,
                borderColor: row.categoryColor,
              }}
            >
              {row.category}
            </Badge>
          );
        },
      },
      {
        key: "supplierCount",
        label: "# Suppliers",
        sortable: true,
        render: (_: any, row: MaterialWithSuppliers) => {
          if (row.supplierCount === 0) {
            return <span className="text-muted-foreground">0</span>;
          }

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help font-medium">
                    {row.supplierCount}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">Suppliers:</div>
                    {row.suppliers.map((s) => (
                      <div key={s.id}>{s.name}</div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        key: "updatedAt",
        label: "Updated At",
        sortable: true,
        render: (_: any, row: MaterialWithSuppliers) => {
          const displayDate = row.updatedAt || row.createdAt;
          return (
            <span className="text-sm text-muted-foreground">
              {format(new Date(displayDate), "MMM dd, yyyy")}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_: any, row: MaterialWithSuppliers) => {
          if (editingMaterialId === row.id) {
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={saveEdit}
                  disabled={loading}
                  className="h-7 text-xs"
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
              </div>
            );
          }

          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEdit(row)}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => initiateDelete(row)}
                disabled={row.supplierCount > 0}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                title={
                  row.supplierCount > 0
                    ? "Cannot delete material used by suppliers"
                    : "Delete material"
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      editingMaterialId,
      editForm,
      loading,
      openCategoryCombobox,
      categorySearch,
      filteredCategories,
      isNewCategory,
    ]
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:w-[800px] sm:max-w-[90vw] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Materials Management</SheetTitle>
            <SheetDescription>
              View and manage all raw materials. Edit names/categories or delete
              unused materials.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {!materialsWithSuppliers ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : materialsWithSuppliers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No materials found. Add supplier materials to create materials.
              </div>
            ) : (
              <SortableTable
                data={materialsWithSuppliers}
                columns={columns}
                className="table-enhanced"
                showSerialNumber={true}
              />
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
