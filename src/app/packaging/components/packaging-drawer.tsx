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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SortableTable } from "@/components/ui/sortable-table";
import {
  Edit,
  Trash2,
  Loader2,
  Plus,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { db } from "@/lib/db";
import type { PackagingWithSuppliers, Packaging, Supplier } from "@/lib/types";
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
import { cn } from "@/lib/utils";

interface PackagingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export function PackagingDrawer({
  open,
  onOpenChange,
  onRefresh,
}: PackagingDrawerProps) {
  const [editingPackagingId, setEditingPackagingId] = useState<string | null>(
    null
  );
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    capacity: "",
    unit: "",
    buildMaterial: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [packagingToDelete, setPackagingToDelete] =
    useState<PackagingWithSuppliers | null>(null);
  const [loading, setLoading] = useState(false);
  const [typeSearch, setTypeSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [openTypeCombobox, setOpenTypeCombobox] = useState(false);
  const [openSupplierCombobox, setOpenSupplierCombobox] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Fetch packaging with supplier count
  const packagingWithSuppliers = useLiveQuery(async () => {
    const [packaging, supplierPackaging, suppliers] = await Promise.all([
      db.packaging.toArray(),
      db.supplierPackaging.toArray(),
      db.suppliers.toArray(),
    ]);

    const result = packaging.map((packaging) => {
      const supplierPackList = supplierPackaging.filter(
        (sp) => sp.packagingId === packaging.id
      );

      const suppliersList = supplierPackList
        .map((sm) => suppliers.find((s) => s.id === sm.supplierId))
        .filter((s): s is Supplier => s !== undefined);

      return {
        ...packaging,
        supplierCount: supplierPackList.length,
        suppliersList,
      };
    });

    // Add empty row for new packaging if adding
    if (isAddingNew) {
      result.unshift({
        id: "new",
        name: "",
        type: "",
        capacity: 0,
        unit: "ml",
        buildMaterial: "",
        supplierCount: 0,
        suppliersList: [],
        createdAt: new Date().toISOString(),
      } as PackagingWithSuppliers);
    }

    return result;
  }, [isAddingNew]);

  // Fetch suppliers for combobox
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);

  // Filter suppliers based on search
  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];
    if (!supplierSearch) return suppliers;
    return suppliers.filter((s) =>
      s.name.toLowerCase().includes(supplierSearch.toLowerCase())
    );
  }, [suppliers, supplierSearch]);

  // Packaging types
  const packagingTypes = ["Bottle", "Jar", "Can", "Box", "Pouch", "Other"];

  // Build materials
  const buildMaterials = ["PET", "HDPE", "Glass", "Plastic", "Paper", "Other"];

  // Capacity units
  const capacityUnits = ["kg", "L", "ml", "gm"];

  // Filter types based on search
  const filteredTypes = useMemo(() => {
    if (!typeSearch) return packagingTypes;
    return packagingTypes.filter((type) =>
      type.toLowerCase().includes(typeSearch.toLowerCase())
    );
  }, [typeSearch]);

  // Filter build materials based on search
  const [buildMaterialSearch, setBuildMaterialSearch] = useState("");
  const [openBuildMaterialCombobox, setOpenBuildMaterialCombobox] =
    useState(false);

  const filteredBuildMaterials = useMemo(() => {
    if (!buildMaterialSearch) return buildMaterials;
    return buildMaterials.filter((material) =>
      material.toLowerCase().includes(buildMaterialSearch.toLowerCase())
    );
  }, [buildMaterialSearch]);

  const isNewBuildMaterial = useMemo(() => {
    if (!buildMaterialSearch) return false;
    return !buildMaterials.some(
      (material) =>
        normalizeText(material) === normalizeText(buildMaterialSearch)
    );
  }, [buildMaterialSearch]);

  const isNewType = useMemo(() => {
    if (!typeSearch) return false;
    return !packagingTypes.some(
      (type) => normalizeText(type) === normalizeText(typeSearch)
    );
  }, [typeSearch]);

  // Start editing
  const startEdit = (packaging: PackagingWithSuppliers) => {
    setEditingPackagingId(packaging.id);
    setEditForm({
      name: packaging.name,
      type: packaging.type,
      capacity: packaging.capacity?.toString() || "",
      unit: packaging.unit || "",
      buildMaterial: packaging.buildMaterial || "",
    });
    setTypeSearch(packaging.type);
    setBuildMaterialSearch(packaging.buildMaterial || "");
  };

  // Start adding new packaging
  const startAddingNew = () => {
    setIsAddingNew(true);
    setEditingPackagingId("new");
    setEditForm({
      name: "",
      type: "",
      capacity: "",
      unit: "",
      buildMaterial: "",
    });
    setTypeSearch("");
    setBuildMaterialSearch("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingPackagingId(null);
    setIsAddingNew(false);
    setEditForm({
      name: "",
      type: "",
      capacity: "",
      unit: "",
      buildMaterial: "",
    });
    setTypeSearch("");
    setBuildMaterialSearch("");
    setSupplierSearch("");
  };

  // Handle type selection in edit
  const handleSelectType = (type: string) => {
    setEditForm({ ...editForm, type });
    setTypeSearch(type);
    setOpenTypeCombobox(false);
  };

  // Handle new type creation
  const handleNewType = () => {
    setEditForm({ ...editForm, type: typeSearch });
    setOpenTypeCombobox(false);
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingPackagingId) return;

    const trimmedName = editForm.name.trim();
    const trimmedType = editForm.type.trim();
    const capacityValue = parseFloat(editForm.capacity);
    const trimmedUnit = editForm.unit.trim();
    const trimmedBuildMaterial = editForm.buildMaterial.trim();

    if (!trimmedName || !trimmedType || !trimmedBuildMaterial) {
      toast.error("Name, type, and build material are required");
      return;
    }

    if (editForm.capacity && (isNaN(capacityValue) || capacityValue <= 0)) {
      toast.error("Capacity must be a positive number");
      return;
    }

    if (editForm.capacity && !trimmedUnit) {
      toast.error("Unit is required when capacity is specified");
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toISOString();

      if (isAddingNew) {
        // Check for duplicate name
        const normalized = normalizeText(trimmedName);
        const duplicate = await db.packaging
          .filter((p) => normalizeText(p.name) === normalized)
          .first();

        if (duplicate) {
          toast.error(`Packaging "${duplicate.name}" already exists`);
          return;
        }

        // Add new packaging
        await db.packaging.add({
          id: nanoid(),
          name: trimmedName,
          type: trimmedType,
          capacity: capacityValue,
          unit: (trimmedUnit as "kg" | "L" | "ml" | "gm") || "L",
          buildMaterial: trimmedBuildMaterial,
          createdAt: now,
        });

        toast.success("Packaging added successfully");
      } else {
        // Check for duplicate name (excluding current packaging)
        const normalized = normalizeText(trimmedName);
        const duplicate = await db.packaging
          .filter(
            (p) =>
              p.id !== editingPackagingId &&
              normalizeText(p.name) === normalized
          )
          .first();

        if (duplicate) {
          toast.error(`Packaging "${duplicate.name}" already exists`);
          return;
        }

        // Update packaging
        await db.packaging.update(editingPackagingId, {
          name: trimmedName,
          type: trimmedType,
          capacity: capacityValue || undefined,
          unit: (trimmedUnit as "kg" | "L" | "ml" | "gm") || undefined,
          buildMaterial: trimmedBuildMaterial,
          updatedAt: now,
        });

        toast.success("Packaging updated successfully");
      }

      cancelEdit();

      // Trigger refresh of other components
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error saving packaging:", error);
      toast.error("Failed to save packaging");
    } finally {
      setLoading(false);
    }
  };

  // Initiate delete
  const initiateDelete = (packaging: PackagingWithSuppliers) => {
    setPackagingToDelete(packaging);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!packagingToDelete) return;

    setLoading(true);
    try {
      // Double-check no supplier packaging reference it
      const supplierPackCount = await db.supplierPackaging
        .where("packagingId")
        .equals(packagingToDelete.id)
        .count();

      if (supplierPackCount > 0) {
        toast.error("Cannot delete packaging that is used by suppliers");
        return;
      }

      await db.packaging.delete(packagingToDelete.id);
      toast.success("Packaging deleted successfully");
      setDeleteConfirmOpen(false);
      setPackagingToDelete(null);
    } catch (error) {
      console.error("Error deleting packaging:", error);
      toast.error("Failed to delete packaging");
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Packaging Name",
        sortable: true,
        render: (_: any, row: PackagingWithSuppliers) => {
          if (editingPackagingId === row.id) {
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
        key: "type",
        label: "Type",
        sortable: true,
        render: (_: any, row: PackagingWithSuppliers) => {
          if (editingPackagingId === row.id) {
            return (
              <Popover
                open={openTypeCombobox}
                onOpenChange={setOpenTypeCombobox}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    size="sm"
                    className="h-8 w-full justify-between"
                  >
                    {editForm.type || "Select"}
                    <ChevronsUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search..."
                      value={typeSearch}
                      onValueChange={setTypeSearch}
                    />
                    <CommandList>
                      {filteredTypes.length > 0 && (
                        <CommandGroup>
                          {filteredTypes.map((type) => (
                            <CommandItem
                              key={type}
                              onSelect={() => handleSelectType(type)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  editForm.type === type
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {type}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                      {isNewType && typeSearch && (
                        <CommandGroup>
                          <CommandItem onSelect={handleNewType}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create "{typeSearch}"
                          </CommandItem>
                        </CommandGroup>
                      )}
                      {!typeSearch && filteredTypes.length === 0 && (
                        <CommandEmpty>Start typing...</CommandEmpty>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            );
          }
          return (
            <Badge variant="secondary" className="text-xs">
              {row.type}
            </Badge>
          );
        },
      },
      {
        key: "buildMaterial",
        label: "Build Material",
        sortable: true,
        render: (_: any, row: PackagingWithSuppliers) => {
          if (editingPackagingId === row.id) {
            return (
              <Popover
                open={openBuildMaterialCombobox}
                onOpenChange={setOpenBuildMaterialCombobox}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    size="sm"
                    className="h-8 w-full justify-between"
                  >
                    {editForm.buildMaterial || "Select"}
                    <ChevronsUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search..."
                      value={buildMaterialSearch}
                      onValueChange={setBuildMaterialSearch}
                    />
                    <CommandList>
                      {filteredBuildMaterials.length > 0 && (
                        <CommandGroup>
                          {filteredBuildMaterials.map((material) => (
                            <CommandItem
                              key={material}
                              onSelect={() => {
                                setEditForm({
                                  ...editForm,
                                  buildMaterial: material,
                                });
                                setBuildMaterialSearch(material);
                                setOpenBuildMaterialCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  editForm.buildMaterial === material
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {material}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                      {isNewBuildMaterial && buildMaterialSearch && (
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setEditForm({
                                ...editForm,
                                buildMaterial: buildMaterialSearch,
                              });
                              setOpenBuildMaterialCombobox(false);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create "{buildMaterialSearch}"
                          </CommandItem>
                        </CommandGroup>
                      )}
                      {!buildMaterialSearch &&
                        filteredBuildMaterials.length === 0 && (
                          <CommandEmpty>Start typing...</CommandEmpty>
                        )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            );
          }
          return (
            <span className="text-muted-foreground">
              {row.buildMaterial || "N/A"}
            </span>
          );
        },
      },
      {
        key: "capacity",
        label: "Capacity",
        sortable: true,
        render: (_: any, row: PackagingWithSuppliers) => {
          if (editingPackagingId === row.id) {
            return (
              <div className="flex gap-1">
                <Input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) =>
                    setEditForm({ ...editForm, capacity: e.target.value })
                  }
                  className="h-8 flex-1"
                  placeholder="500"
                  min="0"
                  step="0.01"
                />
                <Select
                  value={editForm.unit}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, unit: value })
                  }
                >
                  <SelectTrigger className="h-8 w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {capacityUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }
          const displayCapacity =
            row.capacity && row.unit ? `${row.capacity}${row.unit}` : "N/A";
          return (
            <span className="text-muted-foreground">{displayCapacity}</span>
          );
        },
      },
      {
        key: "supplierCount",
        label: "# Suppliers",
        sortable: true,
        render: (_: any, row: PackagingWithSuppliers) => {
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
                    {row.suppliersList.map((s) => (
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
        render: (_: any, row: PackagingWithSuppliers) => {
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
        render: (_: any, row: PackagingWithSuppliers) => {
          if (editingPackagingId === row.id) {
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
                    ? "Cannot delete packaging used by suppliers"
                    : "Delete packaging"
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
      editingPackagingId,
      editForm,
      loading,
      openTypeCombobox,
      openBuildMaterialCombobox,
      openSupplierCombobox,
      typeSearch,
      buildMaterialSearch,
      supplierSearch,
      filteredTypes,
      filteredBuildMaterials,
      filteredSuppliers,
      isNewType,
      isNewBuildMaterial,
      suppliers,
      capacityUnits,
    ]
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:w-[1000px] sm:max-w-[95vw] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Packaging Management</SheetTitle>
            <SheetDescription>
              View and manage all packaging items. Edit details or delete unused
              packaging.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex justify-end">
            <Button onClick={startAddingNew} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              <span className="truncate">Add Packaging</span>
            </Button>
          </div>

          <div className="mt-4">
            {!packagingWithSuppliers ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : packagingWithSuppliers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No packaging found. Add supplier packaging to create packaging
                items.
              </div>
            ) : (
              <SortableTable
                data={packagingWithSuppliers}
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
              Delete {packagingToDelete?.name}?
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
