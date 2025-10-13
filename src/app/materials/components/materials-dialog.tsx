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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Package,
  Truck,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import type {
  SupplierMaterial,
  Supplier,
  Material,
  Category,
} from "@/lib/types";
import { UNITS, AVAILABILITY_OPTIONS } from "./materials-config";
import { cn } from "@/lib/utils";
import { useDuplicateCheck } from "@/hooks/use-duplicate-check";

// Form-specific type
export interface MaterialFormData extends Partial<SupplierMaterial> {
  materialName?: string;
  materialCategory?: string;
  bulkPrice?: number;
  quantityForBulkPrice?: number;
}

interface EnhancedMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: MaterialFormData;
  setMaterial: React.Dispatch<React.SetStateAction<MaterialFormData>>;
  onSave: () => Promise<void>;
  suppliers: Supplier[];
  materials: Material[];
  categories: Category[];
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
  categories,
  isEditing = false,
}: EnhancedMaterialDialogProps) {
  const [materialSearch, setMaterialSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [openMaterialCombobox, setOpenMaterialCombobox] = useState(false);
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isNewMaterial, setIsNewMaterial] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Duplicate check for materials
  const { warning: materialWarning, checkDuplicate: checkMaterialDuplicate } =
    useDuplicateCheck(materials, material.materialId);

  // Duplicate check for categories
  const currentCategoryId = categories.find(
    (c) => c.name === material.materialCategory
  )?.id;
  const { warning: categoryWarning, checkDuplicate: checkCategoryDuplicate } =
    useDuplicateCheck(categories, currentCategoryId);

  // Filter materials based on search
  useEffect(() => {
    if (materialSearch) {
      const filtered = materials.filter((m) =>
        m.name.toLowerCase().includes(materialSearch.toLowerCase())
      );
      setFilteredMaterials(filtered);
      setIsNewMaterial(filtered.length === 0);

      // Check for duplicates
      if (!material.materialId) {
        checkMaterialDuplicate(materialSearch);
      }
    } else {
      setFilteredMaterials(materials);
      setIsNewMaterial(false);
    }
  }, [materialSearch, materials, material.materialId]);
  // Filter categories based on search
  useEffect(() => {
    if (categorySearch) {
      const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(categorySearch.toLowerCase())
      );
      setFilteredCategories(filtered);
      setIsNewCategory(filtered.length === 0);

      // Check for duplicates
      checkCategoryDuplicate(categorySearch);
    } else {
      setFilteredCategories(categories);
      setIsNewCategory(false);
    }
  }, [categorySearch, categories]);

  // Initialize searches when editing
  useEffect(() => {
    if (isEditing && material.materialId) {
      const existingMaterial = materials.find(
        (m) => m.id === material.materialId
      );
      if (existingMaterial) {
        setMaterialSearch(existingMaterial.name);
        setCategorySearch(existingMaterial.category);
      }
    }
  }, [isEditing, material.materialId, materials]);

  // Calculate unit price when bulk fields change
  const calculatedUnitPrice = useMemo(() => {
    const qty = material.quantityForBulkPrice || 1;
    const price = material.bulkPrice || 0;
    return qty > 0 ? price / qty : 0;
  }, [material.bulkPrice, material.quantityForBulkPrice]);

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
    setCategorySearch(selectedMaterial.category);
    setOpenMaterialCombobox(false);
  };

  // Handle new material
  const handleNewMaterial = () => {
    setMaterial({
      ...material,
      materialId: "",
      materialName: materialSearch,
      materialCategory: material.materialCategory || categorySearch || "Other",
    });
    setOpenMaterialCombobox(false);
  };

  // Handle category selection
  const handleSelectCategory = (selectedCategory: Category) => {
    setMaterial({
      ...material,
      materialCategory: selectedCategory.name,
    });
    setCategorySearch(selectedCategory.name);
    setOpenCategoryCombobox(false);
  };

  // Handle new category
  const handleNewCategory = () => {
    setMaterial({
      ...material,
      materialCategory: categorySearch,
    });
    setOpenCategoryCombobox(false);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!material.supplierId) {
      newErrors.supplierId = "Supplier is required";
    }

    if (!material.materialName || material.materialName.trim().length === 0) {
      newErrors.materialName = "Material name is required";
    }

    if (!material.bulkPrice || material.bulkPrice <= 0) {
      newErrors.bulkPrice = "Valid price is required";
    }

    if (!material.unit) {
      newErrors.unit = "Unit is required";
    }

    if (material.tax && (material.tax < 0 || material.tax > 100)) {
      newErrors.tax = "Tax must be between 0 and 100";
    }

    if (material.moq && material.moq < 1) {
      newErrors.moq = "MOQ must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save with validation
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
    material.supplierId &&
    material.materialName &&
    material.bulkPrice !== undefined &&
    material.bulkPrice > 0;

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
                  <SelectTrigger
                    id="supplier"
                    className={cn(
                      "focus-enhanced w-72",
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

              <div className="space-y-2 w-24">
                <Label htmlFor="moq">MOQ (Kg or L)</Label>
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

          {/* Material Selection */}
          <div className="dialog-section">
            <div className="section-header">
              <Package className="h-4 w-4" />
              Material Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="materialName">
                  Material Name <span className="text-destructive">*</span>
                </Label>
                {materialWarning && (
                  <Alert
                    variant="default"
                    className="mb-2 border-yellow-500 bg-yellow-50"
                  >
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {materialWarning}
                    </AlertDescription>
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
                      className={cn(
                        "w-full justify-between focus-enhanced",
                        errors.materialName && "border-destructive"
                      )}
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
                                    {mat.category}
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
                {errors.materialName && (
                  <p className="text-sm text-destructive">
                    {errors.materialName}
                  </p>
                )}
                {isNewMaterial && materialSearch && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    New material will be created
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                {categoryWarning && (
                  <Alert
                    variant="default"
                    className="mb-2 border-yellow-500 bg-yellow-50"
                  >
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {categoryWarning}
                    </AlertDescription>
                  </Alert>
                )}
                <Popover
                  open={openCategoryCombobox}
                  onOpenChange={setOpenCategoryCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCategoryCombobox}
                      className="w-full justify-between focus-enhanced"
                    >
                      {material.materialCategory || "Select or create category"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search categories..."
                        value={categorySearch}
                        onValueChange={setCategorySearch}
                      />
                      <CommandList>
                        {filteredCategories.length > 0 ? (
                          <CommandGroup heading="Existing Categories">
                            {filteredCategories.map((cat) => (
                              <CommandItem
                                key={cat.id}
                                value={cat.name}
                                onSelect={() => handleSelectCategory(cat)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    material.materialCategory === cat.name
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                  />
                                  <span>{cat.name}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ) : null}
                        {isNewCategory && categorySearch && (
                          <CommandGroup heading="Create New">
                            <CommandItem onSelect={handleNewCategory}>
                              <Plus className="mr-2 h-4 w-4 text-primary" />
                              <span>
                                Create category "
                                <strong>{categorySearch}</strong>"
                              </span>
                            </CommandItem>
                          </CommandGroup>
                        )}
                        {!categorySearch && filteredCategories.length === 0 && (
                          <CommandEmpty>
                            Start typing to search or create...
                          </CommandEmpty>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {isNewCategory && categorySearch && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    New category will be created
                  </p>
                )}
              </div>

              {/* Pricing Section */}
              <div className="space-y-2 md:col-span-2">
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-0">
                    <Label className="text-sm font-medium">Tax (%)</Label>
                    <Input
                      type="number"
                      step="1"
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
                      value={material.bulkPrice || ""}
                      onChange={(e) =>
                        setMaterial({
                          ...material,
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
                      value={material.quantityForBulkPrice || 1}
                      onChange={(e) =>
                        setMaterial({
                          ...material,
                          quantityForBulkPrice: Number(e.target.value) || 1,
                        })
                      }
                      placeholder="1"
                      className="focus-enhanced"
                    />
                  </div>
                  <div className="space-y-0">
                    <Label className="text-sm font-medium">
                      Unit <span className="text-destructive">*</span>
                    </Label>
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
                </div>

                {/* Unit Price Display */}
                {(material.quantityForBulkPrice || 1) > 1 &&
                  material.bulkPrice && (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      Unit price: ₹{calculatedUnitPrice.toFixed(2)} per{" "}
                      {material.unit}
                    </div>
                  )}
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
                `${isEditing ? "Update" : "Add"} Material`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
