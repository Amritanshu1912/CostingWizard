import { useMemo, useState } from "react";
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
import { format } from "date-fns";
import type { PackagingWithSuppliers } from "@/lib/types";
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

interface PackagingTableProps {
  data: PackagingWithSuppliers[];
  editingPackagingId: string | null;
  editForm: {
    name: string;
    type: string;
    capacity: string;
    unit: string;
    buildMaterial: string;
  };
  loading: boolean;
  shakeFields?: boolean;
  onEditFormChange: (form: any) => void;
  onStartEdit: (packaging: PackagingWithSuppliers) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onInitiateDelete: (packaging: PackagingWithSuppliers) => void;
}

import {
  PACKAGING_TYPE_LABELS,
  BUILD_MATERIAL_LABELS,
  CAPACITY_UNIT_VALUES,
  getPackagingTypeLabel,
} from "./packaging-constants";

const packagingTypes = PACKAGING_TYPE_LABELS;
const capacityUnits = CAPACITY_UNIT_VALUES;
const buildMaterials = BUILD_MATERIAL_LABELS;

export function PackagingTable({
  data,
  editingPackagingId,
  editForm,
  loading,
  shakeFields = false,
  onEditFormChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onInitiateDelete,
}: PackagingTableProps) {
  const [typeSearch, setTypeSearch] = useState("");
  const [buildMaterialSearch, setBuildMaterialSearch] = useState("");
  const [openTypeCombobox, setOpenTypeCombobox] = useState(false);
  const [openBuildMaterialCombobox, setOpenBuildMaterialCombobox] =
    useState(false);

  const filteredTypes = useMemo(() => {
    if (!typeSearch) return packagingTypes;
    return packagingTypes.filter((type) =>
      type.toLowerCase().includes(typeSearch.toLowerCase())
    );
  }, [typeSearch]);

  const filteredBuildMaterials = useMemo(() => {
    if (!buildMaterialSearch) return buildMaterials;
    return buildMaterials.filter((material) =>
      material.toLowerCase().includes(buildMaterialSearch.toLowerCase())
    );
  }, [buildMaterialSearch]);

  const isNewType = useMemo(() => {
    if (!typeSearch) return false;
    return !packagingTypes.some(
      (type) => type.toLowerCase() === typeSearch.toLowerCase()
    );
  }, [typeSearch]);

  const isNewBuildMaterial = useMemo(() => {
    if (!buildMaterialSearch) return false;
    return !buildMaterials.some(
      (material) => material.toLowerCase() === buildMaterialSearch.toLowerCase()
    );
  }, [buildMaterialSearch]);

  const handleSelectType = (type: string) => {
    onEditFormChange({ ...editForm, type });
    setTypeSearch(type);
    setOpenTypeCombobox(false);
  };

  const handleNewType = () => {
    onEditFormChange({ ...editForm, type: typeSearch });
    setOpenTypeCombobox(false);
  };

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
                  onEditFormChange({ ...editForm, name: e.target.value })
                }
                className="h-9"
                placeholder="Enter packaging name"
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
                    className={cn(
                      "h-9 w-full justify-between",
                      shakeFields &&
                        "animate-pulse border-destructive bg-destructive/5"
                    )}
                  >
                    {editForm.type || "Select type"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search type..."
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
            <Badge variant="secondary" className="text-xs font-medium">
              {getPackagingTypeLabel(row.type)}
            </Badge>
          );
        },
      },
      {
        key: "buildMaterial",
        label: "Material",
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
                    className={cn(
                      "h-9 w-full justify-between",
                      shakeFields &&
                        "animate-pulse border-destructive bg-destructive/5"
                    )}
                  >
                    {editForm.buildMaterial || "Select material"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search material..."
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
                                onEditFormChange({
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
                              onEditFormChange({
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
            <span className="text-sm text-muted-foreground">
              {row.buildMaterial || "—"}
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
              <div className="flex gap-1.5">
                <Input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) =>
                    onEditFormChange({ ...editForm, capacity: e.target.value })
                  }
                  className={cn(
                    "h-9 flex-1",
                    shakeFields &&
                      "animate-pulse border-destructive bg-destructive/5"
                  )}
                  placeholder="500"
                  min="0"
                  step="0.01"
                />
                <Select
                  value={editForm.unit}
                  onValueChange={(value) =>
                    onEditFormChange({ ...editForm, unit: value })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "h-9 w-[70px]",
                      shakeFields &&
                        "animate-pulse border-destructive bg-destructive/5"
                    )}
                  >
                    <SelectValue placeholder="Unit" />
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
            row.capacity && row.unit ? `${row.capacity} ${row.unit}` : "—";
          return (
            <span className="text-sm text-muted-foreground font-medium">
              {displayCapacity}
            </span>
          );
        },
      },
      {
        key: "supplierCount",
        label: "# Suppliers",
        sortable: true,
        render: (_: any, row: PackagingWithSuppliers) => {
          if (row.supplierCount === 0) {
            return <span className="text-sm text-muted-foreground">—</span>;
          }

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-1.5 cursor-help">
                    <Badge variant="outline" className="font-medium">
                      {row.supplierCount}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="text-sm">
                    <div className="font-semibold mb-1">
                      Linked Suppliers ({row.supplierCount})
                    </div>
                    <div className="space-y-1">
                      {row.suppliersList.map((s, index) => (
                        <div key={`${s.id}-${index}`} className="text-white">
                          • {s.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        key: "updatedAt",
        label: "Last Updated",
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
        label: "",
        sortable: false,
        render: (_: any, row: PackagingWithSuppliers) => {
          if (editingPackagingId === row.id) {
            return (
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  onClick={onSaveEdit}
                  disabled={loading}
                  className="h-8 px-3"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCancelEdit}
                  disabled={loading}
                  className="h-8 px-3"
                >
                  Cancel
                </Button>
              </div>
            );
          }

          return (
            <div className="flex gap-1 justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStartEdit(row)}
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit packaging</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onInitiateDelete(row)}
                      disabled={row.supplierCount > 0}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {row.supplierCount > 0
                      ? "Cannot delete packaging linked to suppliers"
                      : "Delete packaging"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
      typeSearch,
      buildMaterialSearch,
      filteredTypes,
      filteredBuildMaterials,
      isNewType,
      isNewBuildMaterial,
    ]
  );

  return (
    <SortableTable
      data={data}
      columns={columns}
      className="table-enhanced"
      showSerialNumber={true}
    />
  );
}
