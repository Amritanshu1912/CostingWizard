// src/app/packaging/components/supplier-packaging-dialog.tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Check,
  ChevronsUpDown,
  Clock,
  Loader2,
  Package,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useDuplicateCheck } from "@/hooks/use-duplicate-check";
import { CAPACITY_UNITS } from "@/lib/constants";
import type {
  BuildMaterial,
  CapacityUnit,
  Packaging,
  PackagingType,
  SupplierPackagingFormData,
} from "@/types/packaging-types";
import type { Supplier } from "@/types/shared-types";
import { cn } from "@/utils/shared-utils";
import { normalizeText } from "@/utils/text-utils";
import { BUILD_MATERIALS, PACKAGING_TYPES } from "./packaging-constants";

// Form-specific type

interface SupplierPackagingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packaging: SupplierPackagingFormData;
  setPackaging: React.Dispatch<React.SetStateAction<SupplierPackagingFormData>>;
  onSave: () => Promise<void>;
  suppliers: Supplier[];
  packagingList: Packaging[];
  isEditing?: boolean;
}

export function SupplierPackagingDialog({
  open,
  onOpenChange,
  packaging,
  setPackaging,
  onSave,
  suppliers,
  packagingList,
  isEditing = false,
}: SupplierPackagingDialogProps) {
  const [packagingSearch, setPackagingSearch] = useState("");
  const [openPackagingCombobox, setOpenPackagingCombobox] = useState(false);
  const [filteredPackaging, setFilteredPackaging] = useState<Packaging[]>([]);
  const [isNewPackaging, setIsNewPackaging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [packagingAutoFilled, setPackagingAutoFilled] = useState(false);

  // Duplicate check for packaging
  const {
    warning: packagingWarning,
    checkDuplicate: checkPackagingDuplicate,
    clearCheck: clearPackagingWarning,
  } = useDuplicateCheck(packagingList, packaging.packagingId);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setPackagingSearch("");
      setIsNewPackaging(false);
      // setErrors({});
      clearPackagingWarning();
    }
  }, [open, clearPackagingWarning]);

  // Check for duplicates when typing
  useEffect(() => {
    if (packagingSearch) {
      const filtered = packagingList.filter((m) =>
        normalizeText(m.name).includes(normalizeText(packagingSearch))
      );
      setFilteredPackaging(filtered);

      // Check if normalized packagingSearch exactly matches any existing packaging name
      const normalizedSearch = normalizeText(packagingSearch);
      const exactMatchExists = packagingList.some(
        (p) => normalizeText(p.name) === normalizedSearch
      );
      setIsNewPackaging(!exactMatchExists);

      if (!packagingAutoFilled) {
        checkPackagingDuplicate(packagingSearch);
      }
    } else {
      setFilteredPackaging(packagingList);
      setIsNewPackaging(false);
    }
  }, [
    packagingSearch,
    packagingList,
    packaging.packagingId,
    packagingAutoFilled,
    checkPackagingDuplicate,
  ]);

  // Initialize when editing
  useEffect(() => {
    if (isEditing && packaging.packagingId) {
      const existingPackaging = packagingList.find(
        (p) => p.id === packaging.packagingId
      );
      if (existingPackaging) {
        setPackagingSearch(existingPackaging.name);
        setPackagingAutoFilled(true);
        // When editing, "Create New" should not show for the current packaging name
        setIsNewPackaging(false);
      }
    }
  }, [isEditing, packaging.packagingId, packagingList]);

  // Calculate unit price
  const calculatedUnitPrice = useMemo(() => {
    const qty = packaging.quantityForBulkPrice || 1;
    const price = packaging.bulkPrice || 0;
    return qty > 0 ? price / qty : 0;
  }, [packaging.bulkPrice, packaging.quantityForBulkPrice]);

  // Handle packaging selection
  const handleSelectPackaging = (selectedPackaging: Packaging) => {
    setPackaging({
      ...packaging,
      packagingId: selectedPackaging.id,
      packagingName: selectedPackaging.name,
      packagingType: selectedPackaging.type,
      capacity: selectedPackaging.capacity,
      unit: selectedPackaging.unit,
      buildMaterial: selectedPackaging.buildMaterial,
    });
    setPackagingSearch(selectedPackaging.name);
    setPackagingAutoFilled(true);
    clearPackagingWarning();
    setOpenPackagingCombobox(false);
  };

  // Handle new packaging
  const handleNewPackaging = () => {
    setPackaging({
      ...packaging,
      packagingId: "",
      packagingName: packagingSearch,
      packagingType: packaging.packagingType || "other",
      buildMaterial: packaging.buildMaterial || "Other",
    });
    setPackagingAutoFilled(false);
    setOpenPackagingCombobox(false);
    // Ensure "Create New" stays visible after selection
    setIsNewPackaging(true);
  };

  // Handle manual typing
  const handlePackagingSearchChange = (value: string) => {
    setPackagingSearch(value);
    setPackagingAutoFilled(false);
    // Reset isNewPackaging when user starts typing manually
    if (isEditing) {
      setIsNewPackaging(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!packaging.supplierId) {
      newErrors.supplierId = "Supplier is required";
    }

    if (
      !packaging.packagingName ||
      packaging.packagingName.trim().length === 0
    ) {
      newErrors.packagingName = "Packaging name is required";
    }

    if (!packaging.packagingType) {
      newErrors.packagingType = "Type is required";
    }

    if (!packaging.bulkPrice || packaging.bulkPrice <= 0) {
      newErrors.bulkPrice = "Valid price is required";
    }

    if (packaging.tax && (packaging.tax < 0 || packaging.tax > 100)) {
      newErrors.tax = "Tax must be between 0 and 100";
    }

    if (packaging.moq && packaging.moq < 1) {
      newErrors.moq = "MOQ must be at least 1";
    }

    if (packaging.capacity && packaging.capacity < 0) {
      newErrors.capacity = "Capacity must be positive";
    }

    if (packaging.capacity && !packaging.unit) {
      newErrors.capacityUnit = "Unit is required when capacity is specified";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave();
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    packaging.supplierId &&
    packaging.packagingName &&
    packaging.bulkPrice !== undefined &&
    packaging.bulkPrice > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-xl max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {isEditing
                  ? "Edit Supplier Packaging"
                  : "Add Supplier Packaging"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update supplier packaging details."
                  : "New packaging will be created automatically."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Supplier Selection */}
          <div className="dialog-section">
            <div className="section-header">
              <Package className="h-4 w-4" />
              Supplier Information
            </div>
            <div className="space-y-4 pl-6">
              {/* Row 1: Supplier and MOQ (2:1 ratio) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-0 md:col-span-2">
                  <Label htmlFor="supplier">
                    Supplier <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={packaging.supplierId}
                    onValueChange={(value) =>
                      setPackaging({ ...packaging, supplierId: value })
                    }
                  >
                    <SelectTrigger
                      id="supplier"
                      className={cn(
                        "focus-enhanced w-full",
                        errors.supplierId && "border-destructive"
                      )}
                    >
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers
                        .filter((s) => s.isActive)
                        .map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            <div className="flex items-center">
                              <span>{supplier.name}</span>
                              <Badge variant="outline" className="text-xs ml-4">
                                ⭐ {supplier.rating}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.supplierId && (
                    <p className="text-sm text-destructive">
                      {errors.supplierId}
                    </p>
                  )}
                </div>

                <div className="space-y-0">
                  <Label htmlFor="moq">MOQ</Label>
                  <Input
                    id="moq"
                    type="number"
                    min="1"
                    value={packaging.moq || ""}
                    onChange={(e) =>
                      setPackaging({
                        ...packaging,
                        moq: Number(e.target.value),
                      })
                    }
                    placeholder="1"
                    className="focus-enhanced"
                  />
                  {errors.moq && (
                    <p className="text-xs text-destructive">{errors.moq}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Lead Time and Availability (1:1 ratio) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-0 relative">
                  <Label htmlFor="leadTime">Lead Time (days)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="leadTime"
                      type="number"
                      min="1"
                      value={packaging.leadTime || ""}
                      onChange={(e) =>
                        setPackaging({
                          ...packaging,
                          leadTime: Number(e.target.value),
                        })
                      }
                      placeholder="7"
                      className="pl-10 w-[120px] focus-enhanced"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Packaging Selection */}
          <div className="dialog-section">
            <div className="section-header">
              <Package className="h-4 w-4" />
              Packaging Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
              <div className="space-y-0 md:col-span-2">
                <Label htmlFor="packagingName">
                  Packaging Name <span className="text-destructive">*</span>
                </Label>
                {packagingWarning && (
                  <Alert
                    variant="default"
                    className="mb-2 border-yellow-500 bg-yellow-50"
                  >
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {packagingWarning}
                    </AlertDescription>
                  </Alert>
                )}
                <Popover
                  open={openPackagingCombobox}
                  onOpenChange={setOpenPackagingCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPackagingCombobox}
                      className={cn(
                        "w-full justify-between focus-enhanced",
                        errors.packagingName && "border-destructive"
                      )}
                    >
                      {packaging.packagingName || "Select or type"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search packaging..."
                        value={packagingSearch}
                        onValueChange={handlePackagingSearchChange}
                      />
                      <CommandList>
                        {filteredPackaging.length > 0 ? (
                          <CommandGroup heading="Existing Packaging">
                            {filteredPackaging.map((pkg) => (
                              <CommandItem
                                key={pkg.id}
                                value={pkg.name}
                                onSelect={() => handleSelectPackaging(pkg)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    packaging.packagingId === pkg.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{pkg.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {pkg.type} • {pkg.capacity}
                                    {pkg.unit} • {pkg.buildMaterial}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ) : null}
                        {isNewPackaging && packagingSearch.trim() && (
                          <CommandGroup heading="Create New">
                            <CommandItem onSelect={handleNewPackaging}>
                              <Plus className="mr-2 h-4 w-4 text-primary" />
                              <span>
                                Create &quot;
                                <strong>{packagingSearch.trim()}</strong>&quot;
                              </span>
                            </CommandItem>
                          </CommandGroup>
                        )}
                        {!packagingSearch && filteredPackaging.length === 0 && (
                          <CommandEmpty>
                            Start typing to search or create...
                          </CommandEmpty>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.packagingName && (
                  <p className="text-sm text-destructive">
                    {errors.packagingName}
                  </p>
                )}
                {isNewPackaging && packagingSearch.trim() && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    New packaging will be created
                  </p>
                )}
              </div>

              {/* Type */}
              <div className="space-y-0">
                <Label htmlFor="type">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={packaging.packagingType}
                  onValueChange={(value) =>
                    setPackaging({
                      ...packaging,
                      packagingType: value as PackagingType,
                    })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "focus-enhanced",
                      errors.packagingType && "border-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.packagingType && (
                  <p className="text-xs text-destructive">
                    {errors.packagingType}
                  </p>
                )}
              </div>

              {/* Build Material */}
              <div className="space-y-0">
                <Label className="translate-y-[3px]" htmlFor="buildMaterial">
                  Build Material
                </Label>
                <Select
                  value={packaging.buildMaterial}
                  onValueChange={(value) =>
                    setPackaging({
                      ...packaging,
                      buildMaterial: value as BuildMaterial,
                    })
                  }
                >
                  <SelectTrigger className={"focus-enhanced translate-y-[6px]"}>
                    <SelectValue placeholder="Select mater.." />
                  </SelectTrigger>
                  <SelectContent>
                    {BUILD_MATERIALS.map((material) => (
                      <SelectItem key={material.value} value={material.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: material.color }}
                          />
                          {material.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity */}
              <div className="space-y-0">
                <Label className="text-sm font-medium">Capacity</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={packaging.capacity || ""}
                  onChange={(e) =>
                    setPackaging({
                      ...packaging,
                      capacity: Number(e.target.value),
                    })
                  }
                  placeholder="500"
                  className={cn(
                    "focus-enhanced",
                    errors.capacity && "border-destructive"
                  )}
                />
                {errors.capacity && (
                  <p className="text-xs text-destructive">{errors.capacity}</p>
                )}
              </div>

              {/* Unit */}
              <div className="space-y-0">
                <Label className="text-sm font-medium">Unit</Label>
                <Select
                  value={packaging.unit}
                  onValueChange={(value) =>
                    setPackaging({
                      ...packaging,
                      unit: value as CapacityUnit,
                    })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "focus-enhanced",
                      errors.capacityUnit && "border-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAPACITY_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.capacityUnit && (
                  <p className="text-xs text-destructive">
                    {errors.capacityUnit}
                  </p>
                )}
              </div>

              {/* Pricing Section */}
              <div className="space-y-2 md:col-span-3">
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-0">
                    <Label className="text-sm font-medium">Tax (%)</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={packaging.tax || ""}
                      onChange={(e) =>
                        setPackaging({
                          ...packaging,
                          tax: Number(e.target.value),
                        })
                      }
                      placeholder="0"
                      className={cn(
                        "focus-enhanced",
                        errors.tax && "border-destructive"
                      )}
                    />
                    {errors.tax && (
                      <p className="text-xs text-destructive">{errors.tax}</p>
                    )}
                  </div>
                  <div className="space-y-0">
                    <Label className="text-sm font-medium">
                      Price (₹) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={packaging.bulkPrice || ""}
                      onChange={(e) =>
                        setPackaging({
                          ...packaging,
                          bulkPrice: Number(e.target.value),
                        })
                      }
                      placeholder="0.00"
                      className={cn(
                        "focus-enhanced",
                        errors.bulkPrice && "border-destructive"
                      )}
                    />
                    {errors.bulkPrice && (
                      <p className="text-xs text-destructive">
                        {errors.bulkPrice}
                      </p>
                    )}
                  </div>

                  <div className="space-y-0">
                    <Label className="text-sm font-medium">Quantity</Label>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      value={packaging.quantityForBulkPrice || 1}
                      onChange={(e) =>
                        setPackaging({
                          ...packaging,
                          quantityForBulkPrice: Number(e.target.value) || 1,
                        })
                      }
                      placeholder="1"
                      className="focus-enhanced"
                    />
                  </div>

                  <div className="space-y-0">
                    <Label className="text-sm font-medium">
                      Unit Price (₹)
                    </Label>
                    <div className="flex justify-center items-center h-9 px-3 rounded-md bg-muted text-sm">
                      ₹{calculatedUnitPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={packaging.notes}
              onChange={(e) =>
                setPackaging({ ...packaging, notes: e.target.value })
              }
              placeholder="Add any additional information..."
              className="focus-enhanced min-h-[80px] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            <span className="text-destructive">*</span> Required fields
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid || loading}
              className="btn-primary min-w-[100px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                `${isEditing ? "Update" : "Add"} Packaging`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
