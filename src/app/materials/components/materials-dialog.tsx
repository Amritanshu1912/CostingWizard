"use client";

import { useState, useEffect, useMemo } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Package,
  TrendingUp,
  Clock,
  Truck,
} from "lucide-react";

import type { SupplierMaterial, Supplier, Material } from "@/lib/types";
import {
  MATERIAL_CATEGORIES,
  UNITS,
  AVAILABILITY_OPTIONS,
} from "./materials-config";
import { cn, debounce, checkForSimilarItems } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Form-specific type that includes temporary fields for the form
export interface MaterialFormData extends Partial<SupplierMaterial> {
  materialName?: string;
  materialCategory?: string;
}

interface EnhancedMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: MaterialFormData;
  setMaterial: React.Dispatch<React.SetStateAction<MaterialFormData>>;
  onSave: () => Promise<void>;
  suppliers: Supplier[];
  materials: Material[];
  isEditing?: boolean;
}

export function EnhancedMaterialDialog({
  open,
  onOpenChange,
  material,
  setMaterial,
  onSave,
  suppliers,
  materials,
  isEditing = false,
}: EnhancedMaterialDialogProps) {
  const [materialSearch, setMaterialSearch] = useState("");
  const [openMaterialCombobox, setOpenMaterialCombobox] = useState(false);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [isNewMaterial, setIsNewMaterial] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Filter materials based on search
  useEffect(() => {
    if (materialSearch) {
      const filtered = materials.filter((m) =>
        m.name.toLowerCase().includes(materialSearch.toLowerCase())
      );
      setFilteredMaterials(filtered);
      setIsNewMaterial(filtered.length === 0);
    } else {
      setFilteredMaterials(materials);
      setIsNewMaterial(false);
    }
  }, [materialSearch, materials]);

  // Debounced fuzzy match check for duplicate warnings
  const debouncedCheck = useMemo(
    () =>
      debounce((searchTerm: string) => {
        const warning = checkForSimilarItems(searchTerm, materials, "material");
        setDuplicateWarning(warning);
      }, 300),
    [materials]
  );

  // Call fuzzy match check when material search changes
  useEffect(() => {
    if (materialSearch && !material.materialId) {
      debouncedCheck(materialSearch);
    } else {
      setDuplicateWarning(null);
    }
  }, [materialSearch, material.materialId, debouncedCheck]);

  // Initialize material search when editing
  useEffect(() => {
    if (isEditing && material.materialId) {
      const existingMaterial = materials.find(
        (m) => m.id === material.materialId
      );
      if (existingMaterial) {
        setMaterialSearch(existingMaterial.name);
      }
    }
  }, [isEditing, material.materialId, materials]);

  // Handle material selection
  const handleSelectMaterial = (selectedMaterial: Material) => {
    setMaterial({
      ...material,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      materialCategory: selectedMaterial.category,
      unit: material.unit || "kg",
    });
    setMaterialSearch(selectedMaterial.name);
    setOpenMaterialCombobox(false);
    setDuplicateWarning(null); // Clear warning when selecting existing material
  };

  // Handle new material creation
  const handleNewMaterial = () => {
    setMaterial({
      ...material,
      materialId: "", // Will be created on save
      materialName: materialSearch,
      materialCategory: material.materialCategory || "Other",
    });
    setOpenMaterialCombobox(false);
    setDuplicateWarning(null); // Clear warning when creating new material
  };

  const isValid =
    material.supplierId &&
    material.materialName &&
    material.unitPrice !== undefined &&
    material.unitPrice > 0;

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
                {isEditing ? "Edit Material" : "Add New Material"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update material pricing and details."
                  : "Add material information. New materials will be created automatically."}
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
            <div className="flex gap-4 pl-6">
              <div className="space-y-2 flex-1">
                <Label htmlFor="supplier">
                  Supplier <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={material.supplierId}
                  onValueChange={(value) =>
                    setMaterial({ ...material, supplierId: value })
                  }
                >
                  <SelectTrigger id="supplier" className="focus-enhanced w-72">
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
              </div>

              <div className="space-y-2 w-20">
                <Label htmlFor="moq">MOQ</Label>
                <Input
                  id="moq"
                  type="number"
                  min="1"
                  value={material.moq || ""}
                  onChange={(e) =>
                    setMaterial({ ...material, moq: Number(e.target.value) })
                  }
                  placeholder="1"
                  className="focus-enhanced"
                />
              </div>
            </div>
          </div>

          {/* Material Selection with Auto-complete */}
          <div className="dialog-section">
            <div className="section-header">
              <Package className="h-4 w-4" />
              Material Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="materialName">
                  Material Name <span className="text-destructive">*</span>
                </Label>
                {/* Duplicate Warning Alert */}
                {duplicateWarning && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{duplicateWarning}</AlertDescription>
                  </Alert>
                )}
                <Popover
                  open={openMaterialCombobox}
                  onOpenChange={setOpenMaterialCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openMaterialCombobox}
                      className="w-full justify-between focus-enhanced"
                    >
                      {material.materialName || "Select or type"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search materials..."
                        value={materialSearch}
                        onValueChange={setMaterialSearch}
                      />
                      <CommandList>
                        {filteredMaterials.length > 0 ? (
                          <CommandGroup heading="Existing Materials">
                            {filteredMaterials.map((mat) => (
                              <CommandItem
                                key={mat.id}
                                value={mat.name}
                                onSelect={() => handleSelectMaterial(mat)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    material.materialId === mat.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{mat.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {mat.category} {/* • {mat.unit} */}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ) : null}
                        {isNewMaterial && materialSearch && (
                          <CommandGroup heading="Create New">
                            <CommandItem onSelect={handleNewMaterial}>
                              <Plus className="mr-2 h-4 w-4 text-primary" />
                              <span>
                                Create "<strong>{materialSearch}</strong>"
                              </span>
                            </CommandItem>
                          </CommandGroup>
                        )}
                        {!materialSearch && filteredMaterials.length === 0 && (
                          <CommandEmpty>
                            Start typing to search or create...
                          </CommandEmpty>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {isNewMaterial && materialSearch && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    New material will be created
                  </p>
                )}
              </div>

              <div className="space-y-2 w-32">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={material.materialCategory}
                  onValueChange={(value) =>
                    setMaterial({ ...material, materialCategory: value })
                  }
                >
                  <SelectTrigger id="category" className="focus-enhanced">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Unit</Label>
                    <Select
                      value={material.unit}
                      onValueChange={(value) =>
                        setMaterial({ ...material, unit: value as any })
                      }
                    >
                      <SelectTrigger className="focus-enhanced">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Unit Price (₹) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={material.unitPrice || ""}
                      onChange={(e) =>
                        setMaterial({
                          ...material,
                          unitPrice: Number(e.target.value),
                        })
                      }
                      placeholder="0.00"
                      className="focus-enhanced"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Tax (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={material.tax || ""}
                      onChange={(e) =>
                        setMaterial({
                          ...material,
                          tax: Number(e.target.value),
                        })
                      }
                      placeholder="0"
                      className="focus-enhanced"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logistics */}
          <div className="dialog-section">
            <div className="section-header">
              <Truck className="h-4 w-4" />
              Logistics & Availability
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-2 relative">
                <Label htmlFor="leadTime">Lead Time (days)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="leadTime"
                    type="number"
                    min="1"
                    value={material.leadTime || ""}
                    onChange={(e) =>
                      setMaterial({
                        ...material,
                        leadTime: Number(e.target.value),
                      })
                    }
                    placeholder="7"
                    className="pl-10 focus-enhanced"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select
                  value={material.availability}
                  onValueChange={(value) =>
                    setMaterial({ ...material, availability: value as any })
                  }
                >
                  <SelectTrigger id="availability" className="focus-enhanced">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              option === "in-stock"
                                ? "bg-green-500"
                                : option === "limited"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                          {option.replace("-", " ")}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={material.notes}
              onChange={(e) =>
                setMaterial({ ...material, notes: e.target.value })
              }
              placeholder="Add any additional information..."
              className="focus-enhanced min-h-[100px] resize-none"
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
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={!isValid}
              className="btn-primary min-w-[100px]"
            >
              {isEditing ? "Update" : "Add"} Material
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
