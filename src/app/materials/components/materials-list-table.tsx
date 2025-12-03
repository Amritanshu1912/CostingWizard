// src/app/materials/components/materials-list-table.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SortableTable } from "@/components/ui/sortable-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  Category,
  MaterialWithSupplierCount,
} from "@/types/material-types";
import { cn } from "@/utils/shared-utils";
import { format } from "date-fns";
import {
  Check,
  ChevronsUpDown,
  Edit,
  Info,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface MaterialsListTableProps {
  data: MaterialWithSupplierCount[];
  editingMaterialId: string | null;
  editForm: { name: string; category: string };
  loading: boolean;
  categories: Category[];
  onEditFormChange: (form: { name: string; category: string }) => void;
  onStartEdit: (material: MaterialWithSupplierCount) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onInitiateDelete: (material: MaterialWithSupplierCount) => void;
}

/**
 * Table component for displaying and editing materials list
 * Supports inline editing with category combobox
 */
export function MaterialsListTable({
  data,
  editingMaterialId,
  editForm,
  loading,
  categories,
  onEditFormChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onInitiateDelete,
}: MaterialsListTableProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [categorySearch, setCategorySearch] = useState("");
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Check if user is creating a new category
  const isNewCategory = useMemo(() => {
    if (!categorySearch) return false;
    return !categories.some(
      (c) => c.name.toLowerCase() === categorySearch.toLowerCase()
    );
  }, [categorySearch, categories]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectCategory = useCallback(
    (category: Category) => {
      onEditFormChange({ ...editForm, category: category.name });
      setCategorySearch(category.name);
      setOpenCategoryCombobox(false);
    },
    [editForm, onEditFormChange]
  );

  const handleNewCategory = useCallback(() => {
    onEditFormChange({ ...editForm, category: categorySearch });
    setOpenCategoryCombobox(false);
  }, [editForm, categorySearch, onEditFormChange]);

  // ============================================================================
  // TABLE COLUMNS
  // ============================================================================

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Material Name",
        sortable: true,
        render: (_: any, row: MaterialWithSupplierCount) => {
          if (editingMaterialId === row.id) {
            return (
              <Input
                value={editForm.name}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, name: e.target.value })
                }
                className="h-8"
                placeholder="Enter material name"
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
        render: (_: any, row: MaterialWithSupplierCount) => {
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
                            Create &quot;{categorySearch}&quot;
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
        render: (_: any, row: MaterialWithSupplierCount) => {
          if (editingMaterialId === row.id) {
            return <span className="text-muted-foreground">—</span>;
          }

          if (row.supplierCount === 0) {
            return (
              <span className="text-muted-foreground text-sm">
                No suppliers
              </span>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <span className="font-medium">{row.supplierCount}</span>
              {row.suppliers && row.suppliers.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <ul>
                        {row.suppliers.map((supplier) => (
                          <li key={supplier.id}>{supplier.name}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      },
      {
        key: "updatedAt",
        label: "Last Updated",
        sortable: true,
        render: (_: any, row: MaterialWithSupplierCount) => {
          if (editingMaterialId === row.id) {
            return <span className="text-muted-foreground">—</span>;
          }

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
        render: (_: any, row: MaterialWithSupplierCount) => {
          if (editingMaterialId === row.id) {
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onSaveEdit}
                  disabled={
                    loading ||
                    !editForm.name.trim() ||
                    !editForm.category.trim()
                  }
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
                  onClick={onCancelEdit}
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
                onClick={() => onStartEdit(row)}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                title="Edit material"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onInitiateDelete(row)}
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
      onEditFormChange,
      openCategoryCombobox,
      categorySearch,
      filteredCategories,
      isNewCategory,
      handleNewCategory,
      handleSelectCategory,
      onSaveEdit,
      loading,
      onCancelEdit,
      onStartEdit,
      onInitiateDelete,
    ]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <SortableTable
        data={data}
        columns={columns}
        className="table-enhanced"
        showSerialNumber={true}
      />
    </div>
  );
}
