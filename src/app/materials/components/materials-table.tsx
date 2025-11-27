// src/app/materials/components/materials-table.tsx
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
import type { Category, MaterialWithSuppliers } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Check,
  ChevronsUpDown,
  Edit,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";

interface MaterialsTableDrawerProps {
  data: (MaterialWithSuppliers & { categoryColor: string })[];
  editingMaterialId: string | null;
  editForm: { name: string; category: string };
  loading: boolean;
  categories: Category[] | undefined;
  categorySearch: string;
  openCategoryCombobox: boolean;
  onEditFormChange: (form: { name: string; category: string }) => void;
  onStartEdit: (material: MaterialWithSuppliers) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onInitiateDelete: (material: MaterialWithSuppliers) => void;
  onCategorySearchChange: (search: string) => void;
  onSelectCategory: (category: Category) => void;
  onNewCategory: () => void;
  onOpenCategoryComboboxChange: (open: boolean) => void;
}

export function MaterialsTableDrawer({
  data,
  editingMaterialId,
  editForm,
  loading,
  categories,
  categorySearch,
  openCategoryCombobox,
  onEditFormChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onInitiateDelete,
  onCategorySearchChange,
  onSelectCategory,
  onNewCategory,
  onOpenCategoryComboboxChange,
}: MaterialsTableDrawerProps) {
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
      (c) => c.name.toLowerCase() === categorySearch.toLowerCase()
    );
  }, [categorySearch, categories]);

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
                  onEditFormChange({ ...editForm, name: e.target.value })
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
                onOpenChange={onOpenCategoryComboboxChange}
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
                      onValueChange={onCategorySearchChange}
                    />
                    <CommandList>
                      {filteredCategories.length > 0 && (
                        <CommandGroup>
                          {filteredCategories.map((cat) => (
                            <CommandItem
                              key={cat.id}
                              onSelect={() => onSelectCategory(cat)}
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
                          <CommandItem onSelect={onNewCategory}>
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
        render: (_: any, row: MaterialWithSuppliers) => {
          if (row.supplierCount === 0) {
            return <span className="text-muted-foreground">0</span>;
          }

          return <span className="font-medium">{row.supplierCount}</span>;
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
                  onClick={onSaveEdit}
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
      loading,
      openCategoryCombobox,
      categorySearch,
      filteredCategories,
      isNewCategory,
      onEditFormChange,
      onStartEdit,
      onSaveEdit,
      onCancelEdit,
      onInitiateDelete,
      onCategorySearchChange,
      onSelectCategory,
      onNewCategory,
      onOpenCategoryComboboxChange,
    ]
  );

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