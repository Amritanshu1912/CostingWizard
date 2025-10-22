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
  Tag,
  Truck,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import type {
  SupplierLabel,
  Supplier,
  Label as Labels,
  LabelType,
  PrintingType,
  LabelMaterialType,
  ShapeType,
} from "@/lib/types";
import {
  LABEL_TYPES,
  PRINTING_TYPES,
  MATERIAL_TYPES,
  SHAPE_TYPES,
  getLabelTypeColor,
  getPrintingTypeColor,
  getMaterialTypeColor,
  getShapeTypeColor,
  getLabelTypeLabel,
  getPrintingTypeLabel,
  getMaterialTypeLabel,
  getShapeTypeLabel,
} from "./labels-constants";
import { AVAILABILITY_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useDuplicateCheck } from "@/hooks/use-duplicate-check";
import { normalizeText } from "@/lib/text-utils";

// Form-specific type
export interface LabelFormData extends Partial<SupplierLabel> {
  labelName?: string;
  labelType?: LabelType;
  printingType?: PrintingType;
  material?: LabelMaterialType;
  shape?: ShapeType;
  size?: string;
  labelFor?: string;
  bulkPrice?: number;
  quantityForBulkPrice?: number;
}

interface EnhancedSupplierLabelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: LabelFormData;
  setLabel: React.Dispatch<React.SetStateAction<LabelFormData>>;
  onSave: () => Promise<void>;
  suppliers: Supplier[];
  labelsList: Labels[];
  isEditing?: boolean;
}

export function EnhancedSupplierLabelsDialog({
  open,
  onOpenChange,
  label,
  setLabel,
  onSave,
  suppliers,
  labelsList,
  isEditing = false,
}: EnhancedSupplierLabelsDialogProps) {
  const [labelSearch, setLabelSearch] = useState("");
  const [openLabelCombobox, setOpenLabelCombobox] = useState(false);
  const [filteredLabels, setFilteredLabels] = useState<Labels[]>([]);
  const [isNewLabel, setIsNewLabel] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [labelAutoFilled, setLabelAutoFilled] = useState(false);

  // Duplicate check for labels
  const {
    warning: labelWarning,
    checkDuplicate: checkLabelDuplicate,
    clearWarning: clearLabelWarning,
  } = useDuplicateCheck(labelsList, label.labelId);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setLabelSearch("");
      setIsNewLabel(false);
      // setErrors({});
      clearLabelWarning();
    }
  }, [open, clearLabelWarning]);

  // Check for duplicates when typing
  useEffect(() => {
    if (labelSearch) {
      const filtered = labelsList.filter((m) =>
        normalizeText(m.name).includes(normalizeText(labelSearch))
      );
      setFilteredLabels(filtered);

      // Check if normalized labelSearch exactly matches any existing label name
      const normalizedSearch = normalizeText(labelSearch);
      const exactMatchExists = labelsList.some(
        (p) => normalizeText(p.name) === normalizedSearch
      );
      setIsNewLabel(!exactMatchExists);

      if (!labelAutoFilled) {
        checkLabelDuplicate(labelSearch);
      }
    } else {
      setFilteredLabels(labelsList);
      setIsNewLabel(false);
    }
  }, [labelSearch, labelsList, label.labelId, labelAutoFilled]);

  // Initialize when editing
  useEffect(() => {
    if (isEditing && label.labelId) {
      const existingLabel = labelsList.find((p) => p.id === label.labelId);
      if (existingLabel) {
        setLabelSearch(existingLabel.name);
        setLabelAutoFilled(true);
        // When editing, "Create New" should not show for the current label name
        setIsNewLabel(false);
      }
    }
  }, [isEditing, label.labelId, labelsList]);

  // Calculate unit price
  const calculatedUnitPrice = useMemo(() => {
    const qty = label.quantityForBulkPrice || 1;
    const price = label.bulkPrice || 0;
    return qty > 0 ? price / qty : 0;
  }, [label.bulkPrice, label.quantityForBulkPrice]);

  // Handle label selection
  const handleSelectLabel = (selectedLabel: Labels) => {
    setLabel({
      ...label,
      labelId: selectedLabel.id,
      labelName: selectedLabel.name,
      labelType: selectedLabel.type,
      printingType: selectedLabel.printingType,
      material: selectedLabel.material,
      shape: selectedLabel.shape,
      size: selectedLabel.size,
      labelFor: selectedLabel.labelFor,
    });
    setLabelSearch(selectedLabel.name);
    setLabelAutoFilled(true);
    clearLabelWarning();
    setOpenLabelCombobox(false);
  };

  // Handle new label
  const handleNewLabel = () => {
    setLabel({
      ...label,
      labelId: "",
      labelName: labelSearch,
      labelType: label.labelType || "sticker",
      printingType: label.printingType || "color",
      material: label.material || "paper",
      shape: label.shape || "rectangular",
    });
    setLabelAutoFilled(false);
    setOpenLabelCombobox(false);
    // Ensure "Create New" stays visible after selection
    setIsNewLabel(true);
  };

  // Handle manual typing
  const handleLabelSearchChange = (value: string) => {
    setLabelSearch(value);
    setLabelAutoFilled(false);
    // Reset isNewLabel when user starts typing manually
    if (isEditing) {
      setIsNewLabel(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!label.supplierId) {
      newErrors.supplierId = "Supplier is required";
    }

    if (!label.labelName || label.labelName.trim().length === 0) {
      newErrors.labelName = "Label name is required";
    }

    if (!label.labelType) {
      newErrors.labelType = "Type is required";
    }

    if (!label.bulkPrice || label.bulkPrice <= 0) {
      newErrors.bulkPrice = "Valid price is required";
    }

    if (label.tax && (label.tax < 0 || label.tax > 100)) {
      newErrors.tax = "Tax must be between 0 and 100";
    }

    if (label.moq && label.moq < 1) {
      newErrors.moq = "MOQ must be at least 1";
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
    label.supplierId &&
    label.labelName &&
    label.bulkPrice !== undefined &&
    label.bulkPrice > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-xl max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {isEditing ? "Edit Supplier Label" : "Add Supplier Label"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update supplier label details."
                  : "New label will be created automatically."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Supplier Selection */}
          <div className="dialog-section">
            <div className="section-header">
              <Tag className="h-4 w-4" />
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
                    value={label.supplierId}
                    onValueChange={(value) =>
                      setLabel({ ...label, supplierId: value })
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
                    value={label.moq || ""}
                    onChange={(e) =>
                      setLabel({
                        ...label,
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
                      value={label.leadTime || ""}
                      onChange={(e) =>
                        setLabel({
                          ...label,
                          leadTime: Number(e.target.value),
                        })
                      }
                      placeholder="7"
                      className="pl-10 w-[120px] focus-enhanced"
                    />
                  </div>
                </div>

                <div className="space-y-0">
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={label.availability}
                    onValueChange={(value) =>
                      setLabel({ ...label, availability: value as any })
                    }
                  >
                    <SelectTrigger id="availability" className="focus-enhanced">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(AVAILABILITY_MAP).map((option) => (
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
          </div>

          {/* Label Selection */}
          <div className="dialog-section">
            <div className="section-header">
              <Tag className="h-4 w-4" />
              Label Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
              <div className="space-y-0 md:col-span-2">
                <Label htmlFor="labelName">
                  Label Name <span className="text-destructive">*</span>
                </Label>
                {labelWarning && (
                  <Alert
                    variant="default"
                    className="mb-2 border-yellow-500 bg-yellow-50"
                  >
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {labelWarning}
                    </AlertDescription>
                  </Alert>
                )}
                <Popover
                  open={openLabelCombobox}
                  onOpenChange={setOpenLabelCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openLabelCombobox}
                      className={cn(
                        "w-full justify-between focus-enhanced",
                        errors.labelName && "border-destructive"
                      )}
                    >
                      {label.labelName || "Select or type"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search labels..."
                        value={labelSearch}
                        onValueChange={handleLabelSearchChange}
                      />
                      <CommandList>
                        {filteredLabels.length > 0 ? (
                          <CommandGroup heading="Existing Labels">
                            {filteredLabels.map((lbl) => (
                              <CommandItem
                                key={lbl.id}
                                value={lbl.name}
                                onSelect={() => handleSelectLabel(lbl)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    label.labelId === lbl.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{lbl.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {lbl.type} • {lbl.printingType} •{" "}
                                    {lbl.material}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ) : null}
                        {isNewLabel && labelSearch.trim() && (
                          <CommandGroup heading="Create New">
                            <CommandItem onSelect={handleNewLabel}>
                              <Plus className="mr-2 h-4 w-4 text-primary" />
                              <span>
                                Create "<strong>{labelSearch.trim()}</strong>"
                              </span>
                            </CommandItem>
                          </CommandGroup>
                        )}
                        {!labelSearch && filteredLabels.length === 0 && (
                          <CommandEmpty>
                            Start typing to search or create...
                          </CommandEmpty>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.labelName && (
                  <p className="text-sm text-destructive">{errors.labelName}</p>
                )}
                {isNewLabel && labelSearch.trim() && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    New label will be created
                  </p>
                )}
              </div>

              {/* Type */}
              <div className="space-y-0">
                <Label htmlFor="type">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={label.labelType}
                  onValueChange={(value) =>
                    setLabel({
                      ...label,
                      labelType: value as LabelType,
                    })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "focus-enhanced",
                      errors.labelType && "border-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LABEL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getLabelTypeColor(type.value),
                            }}
                          />
                          {getLabelTypeLabel(type.value)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.labelType && (
                  <p className="text-xs text-destructive">{errors.labelType}</p>
                )}
              </div>

              {/* Printing Type */}
              <div className="space-y-0">
                <Label className="translate-y-[3px]" htmlFor="printingType">
                  Printing Type
                </Label>
                <Select
                  value={label.printingType}
                  onValueChange={(value) =>
                    setLabel({
                      ...label,
                      printingType: value as PrintingType,
                    })
                  }
                >
                  <SelectTrigger className={"focus-enhanced translate-y-[6px]"}>
                    <SelectValue placeholder="Select printing.." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRINTING_TYPES.map((printing) => (
                      <SelectItem key={printing.value} value={printing.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getPrintingTypeColor(
                                printing.value
                              ),
                            }}
                          />
                          {getPrintingTypeLabel(printing.value)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Material */}
              <div className="space-y-0">
                <Label className="text-sm font-medium">Material</Label>
                <Select
                  value={label.material}
                  onValueChange={(value) =>
                    setLabel({
                      ...label,
                      material: value as LabelMaterialType,
                    })
                  }
                >
                  <SelectTrigger className="focus-enhanced">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_TYPES.map((material) => (
                      <SelectItem key={material.value} value={material.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getMaterialTypeColor(
                                material.value
                              ),
                            }}
                          />
                          {getMaterialTypeLabel(material.value)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Shape */}
              <div className="space-y-0">
                <Label className="text-sm font-medium">Shape</Label>
                <Select
                  value={label.shape}
                  onValueChange={(value) =>
                    setLabel({
                      ...label,
                      shape: value as ShapeType,
                    })
                  }
                >
                  <SelectTrigger className="focus-enhanced">
                    <SelectValue placeholder="Select shape" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHAPE_TYPES.map((shape) => (
                      <SelectItem key={shape.value} value={shape.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getShapeTypeColor(shape.value),
                            }}
                          />
                          {getShapeTypeLabel(shape.value)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size */}
              <div className="space-y-0">
                <Label className="text-sm font-medium">Size</Label>
                <Input
                  type="text"
                  value={label.size || ""}
                  onChange={(e) =>
                    setLabel({
                      ...label,
                      size: e.target.value,
                    })
                  }
                  placeholder="e.g., 50x30mm"
                  className="focus-enhanced"
                />
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
                      value={label.tax || ""}
                      onChange={(e) =>
                        setLabel({
                          ...label,
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
                      value={label.bulkPrice || ""}
                      onChange={(e) =>
                        setLabel({
                          ...label,
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
                      value={label.quantityForBulkPrice || 1}
                      onChange={(e) =>
                        setLabel({
                          ...label,
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
              value={label.notes}
              onChange={(e) => setLabel({ ...label, notes: e.target.value })}
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
                `${isEditing ? "Update" : "Add"} Label`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
