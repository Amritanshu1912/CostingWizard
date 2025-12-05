// src/app/materials/components/materials-supplier-dialog.tsx
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

// Hooks
import { validateSupplierMaterialForm } from "@/hooks/material-hooks/use-materials-validation";
import { useDuplicateCheck } from "@/hooks/use-duplicate-check";

// Utils
import { CAPACITY_UNITS } from "@/lib/constants";
import { calculateUnitPrice } from "@/utils/unit-conversion-utils";
import { normalizeText } from "@/utils/text-utils";

// Types
import type {
  Category,
  Material,
  MaterialFormErrors,
  SupplierMaterialFormData,
} from "@/types/material-types";
import type { Supplier } from "@/types/shared-types";
import { cn } from "@/utils/shared-utils";

interface MaterialsSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierMaterial?: SupplierMaterialFormData;
  isEditing?: boolean;
  onSave: (data: SupplierMaterialFormData) => Promise<void>;
  suppliers: Supplier[];
  materials: Material[];
  categories: Category[];
}

/**
 * Dialog for creating/editing supplier materials
 * Handles material creation inline with smart duplicate detection
 */
export function MaterialsSupplierDialog({
  open,
  onOpenChange,
  supplierMaterial,
  isEditing = false,
  onSave,
  suppliers,
  materials,
  categories,
}: MaterialsSupplierDialogProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  // Form data
  const [formData, setFormData] = useState<SupplierMaterialFormData>({
    supplierId: "",
    materialName: "",
    materialCategory: "",
    bulkPrice: 0,
    quantityForBulkPrice: 1,
    capacityUnit: "kg",
    tax: 0,
    moq: 1,
    leadTime: 7,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<MaterialFormErrors>({});
  const [materialSearch, setMaterialSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [openMaterialCombobox, setOpenMaterialCombobox] = useState(false);
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);

  // Duplicate checking
  const materialDuplicateCheck = useDuplicateCheck(
    materials,
    formData.materialId
  );
  const categoryDuplicateCheck = useDuplicateCheck(categories, undefined);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initialize form when dialog opens or data changes
  useEffect(() => {
    if (open && supplierMaterial) {
      setFormData(supplierMaterial);
      setMaterialSearch(supplierMaterial.materialName || "");
      setCategorySearch(supplierMaterial.materialCategory || "");
    } else if (open && !supplierMaterial) {
      // Reset to defaults
      setFormData({
        supplierId: "",
        materialName: "",
        materialCategory: "",
        bulkPrice: 0,
        quantityForBulkPrice: 1,
        capacityUnit: "kg",
        tax: 0,
        moq: 1,
        leadTime: 7,
      });
      setMaterialSearch("");
      setCategorySearch("");
      setErrors({});
    }
  }, [open, supplierMaterial]);

  useEffect(() => {
    if (!materialSearch) {
      materialDuplicateCheck.clearCheck();
    }
  }, [materialSearch, materialDuplicateCheck]);

  useEffect(() => {
    if (!categorySearch) {
      categoryDuplicateCheck.clearCheck();
    }
  }, [categorySearch, categoryDuplicateCheck]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Filtered materials based on search
  const filteredMaterials = useMemo(() => {
    if (!materialSearch) return materials;
    return materials.filter((m) =>
      m.name.toLowerCase().includes(materialSearch.toLowerCase())
    );
  }, [materialSearch, materials]);

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categorySearch, categories]);

  // Check if we're creating new material/category (only prevent if exact match exists)
  const hasExactMaterialMatch = materials.some(
    (m) => normalizeText(m.name) === normalizeText(materialSearch)
  );
  const isNewMaterial = !hasExactMaterialMatch && materialSearch.length > 0;

  const hasExactCategoryMatch = categories.some(
    (c) => normalizeText(c.name) === normalizeText(categorySearch)
  );
  const isNewCategory = !hasExactCategoryMatch && categorySearch.length > 0;

  // Calculate unit price from bulk price
  const calculatedUnitPrice = useMemo(() => {
    return calculateUnitPrice(
      formData.bulkPrice,
      formData.quantityForBulkPrice
    );
  }, [formData.bulkPrice, formData.quantityForBulkPrice]);

  // Check if form is valid for submission
  const canSubmit = useMemo(() => {
    return (
      formData.supplierId &&
      formData.materialName?.trim() &&
      formData.materialCategory?.trim() &&
      formData.bulkPrice > 0 &&
      formData.quantityForBulkPrice > 0
    );
  }, [formData]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Update form field
   */
  const updateField = <K extends keyof SupplierMaterialFormData>(
    field: K,
    value: SupplierMaterialFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof MaterialFormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof MaterialFormErrors];
        return newErrors;
      });
    }
  };

  /**
   * Select existing material
   */
  const handleSelectMaterial = (material: Material) => {
    setFormData((prev) => ({
      ...prev,
      materialId: material.id,
      materialName: material.name,
      materialCategory: material.category,
    }));
    setMaterialSearch(material.name);
    setCategorySearch(material.category);
    setOpenMaterialCombobox(false);
    materialDuplicateCheck.clearCheck();
    categoryDuplicateCheck.clearCheck();
  };

  /**
   * Create new material (set form to create mode)
   */
  const handleNewMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materialId: undefined,
      materialName: materialSearch,
      materialCategory: prev.materialCategory || categorySearch || "Other",
    }));
    setOpenMaterialCombobox(false);
  };

  /**
   * Select existing category
   */
  const handleSelectCategory = (category: Category) => {
    setFormData((prev) => ({
      ...prev,
      materialCategory: category.name,
    }));
    setCategorySearch(category.name);
    setOpenCategoryCombobox(false);
    categoryDuplicateCheck.clearCheck();
  };

  /**
   * Create new category (set form to create mode)
   */
  const handleNewCategory = () => {
    setFormData((prev) => ({
      ...prev,
      materialCategory: categorySearch,
    }));
    setOpenCategoryCombobox(false);
  };

  /**
   * Handle material search change
   */
  const handleMaterialSearchChange = (value: string) => {
    setMaterialSearch(value);
    materialDuplicateCheck.checkDuplicate(value);

    // Update form data if manually typing
    if (!formData.materialId) {
      setFormData((prev) => ({ ...prev, materialName: value }));
    }
  };

  /**
   * Handle category search change
   */
  const handleCategorySearchChange = (value: string) => {
    setCategorySearch(value);
    categoryDuplicateCheck.checkDuplicate(value);
    setFormData((prev) => ({ ...prev, materialCategory: value }));
  };

  /**
   * Save form
   */
  const handleSave = async () => {
    // Validate
    const validation = validateSupplierMaterialForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving:", error);
      // Error is handled by parent component
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

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
                {isEditing ? "Edit Supplier Material" : "Add Supplier Material"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update material pricing and details."
                  : "Add material from supplier. New materials will be created automatically."}
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
            <div className="flex flex-col gap-4 pl-6">
              <div className="space-y-2 flex-1">
                <Label htmlFor="supplier">
                  Supplier <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => updateField("supplierId", value)}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moq">MOQ</Label>
                  <Input
                    id="moq"
                    type="number"
                    min="1"
                    value={formData.moq || ""}
                    onChange={(e) => updateField("moq", Number(e.target.value))}
                    placeholder="1"
                    className="focus-enhanced"
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="leadTime">Lead Time (days)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="leadTime"
                      type="number"
                      min="1"
                      value={formData.leadTime || ""}
                      onChange={(e) =>
                        updateField("leadTime", Number(e.target.value))
                      }
                      placeholder="7"
                      className="pl-10 focus-enhanced"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Material Selection */}
          <div className="dialog-section">
            <div className="section-header">
              <Package className="h-4 w-4" />
              Material Details
            </div>
            <div className="gap-4 pl-6">
              <div className="grid grid-cols-2 gap-4 mb-2">
                {/* Material Name */}
                <div className="space-y-2 ">
                  <Label htmlFor="materialName">
                    Material Name <span className="text-destructive">*</span>
                  </Label>

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
                        {formData.materialName || "Select or type"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search materials..."
                          value={materialSearch}
                          onValueChange={handleMaterialSearchChange}
                        />
                        <CommandList>
                          {filteredMaterials.length > 0 && (
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
                                      formData.materialId === mat.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {mat.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {mat.category}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                          {isNewMaterial && materialSearch && (
                            <CommandGroup heading="Create New">
                              <CommandItem onSelect={handleNewMaterial}>
                                <Plus className="mr-2 h-4 w-4 text-primary" />
                                <span>
                                  Create &quot;<strong>{materialSearch}</strong>
                                  &quot;
                                </span>
                              </CommandItem>
                            </CommandGroup>
                          )}
                          {!materialSearch &&
                            filteredMaterials.length === 0 && (
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

                {/* Category */}
                <div className="space-y-2 ">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  {categoryDuplicateCheck.warning && (
                    <Alert
                      variant="default"
                      className="mb-2 border-yellow-500 bg-yellow-50"
                    >
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        {categoryDuplicateCheck.warning}
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
                        {formData.materialCategory ||
                          "Select or create category"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search categories..."
                          value={categorySearch}
                          onValueChange={handleCategorySearchChange}
                        />
                        <CommandList>
                          {filteredCategories.length > 0 && (
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
                                      formData.materialCategory === cat.name
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
                          )}
                          {isNewCategory && categorySearch && (
                            <CommandGroup heading="Create New">
                              <CommandItem onSelect={handleNewCategory}>
                                <Plus className="mr-2 h-4 w-4 text-primary" />
                                <span>
                                  Create category &quot;
                                  <strong>{categorySearch}</strong>&quot;
                                </span>
                              </CommandItem>
                            </CommandGroup>
                          )}
                          {!categorySearch &&
                            filteredCategories.length === 0 && (
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
              </div>
              {materialDuplicateCheck.warning && (
                <Alert
                  variant="default"
                  className="mb-2 border-yellow-500 bg-yellow-50"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    {materialDuplicateCheck.warning}
                  </AlertDescription>
                </Alert>
              )}

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
                      value={formData.tax || ""}
                      onChange={(e) =>
                        updateField("tax", Number(e.target.value))
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
                      value={formData.bulkPrice || ""}
                      onChange={(e) =>
                        updateField("bulkPrice", Number(e.target.value))
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
                      value={formData.quantityForBulkPrice || 1}
                      onChange={(e) =>
                        updateField(
                          "quantityForBulkPrice",
                          Number(e.target.value) || 1
                        )
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
                      value={formData.capacityUnit}
                      onValueChange={(value) =>
                        updateField("capacityUnit", value as any)
                      }
                    >
                      <SelectTrigger className="focus-enhanced">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {CAPACITY_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Unit Price Display */}
                {formData.quantityForBulkPrice > 1 &&
                  formData.bulkPrice > 0 && (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      Unit price: ₹{calculatedUnitPrice.toFixed(2)} per{" "}
                      {formData.capacityUnit}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => updateField("notes", e.target.value)}
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
              disabled={!canSubmit || loading}
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
