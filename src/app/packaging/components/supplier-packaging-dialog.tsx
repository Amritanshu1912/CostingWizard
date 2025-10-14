import React, { useState, useEffect, useMemo } from "react";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { SupplierPackaging, Supplier, Packaging } from "@/lib/types";
import type { SupplierPackagingWithDetails } from "@/hooks/use-supplier-packaging-with-details";
import { PACKAGING_AVAILABILITY, PACKAGING_TYPES } from "./packaging-constants";

interface SupplierPackagingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (packaging: SupplierPackaging) => void;
  suppliers: Supplier[];
  packaging: Packaging[];
  initialPackaging?: SupplierPackagingWithDetails | null;
}

export function SupplierPackagingDialog({
  isOpen,
  onClose,
  onSave,
  suppliers,
  packaging,
  initialPackaging,
}: SupplierPackagingDialogProps) {
  const [packagingSearch, setPackagingSearch] = useState("");
  const [openPackagingCombobox, setOpenPackagingCombobox] = useState(false);
  const [filteredPackaging, setFilteredPackaging] = useState<Packaging[]>([]);

  const [formData, setFormData] = useState<Partial<SupplierPackaging>>({
    supplierId: "",
    packagingId: "",
    unitPrice: 0,
    tax: 0,
    moq: 1,
    bulkPrice: 0,
    quantityForBulkPrice: 1,
    leadTime: 7,
    availability: "in-stock",
    notes: "",
  });

  const isEditing = !!initialPackaging;
  const title = isEditing
    ? "Edit Supplier Packaging"
    : "Add Supplier Packaging";
  const description = isEditing
    ? "Update the supplier packaging details."
    : "Enter the details for the supplier packaging relationship.";

  // Filter packaging based on search
  useEffect(() => {
    if (packagingSearch) {
      const filtered = packaging.filter((pkg) =>
        pkg.name.toLowerCase().includes(packagingSearch.toLowerCase())
      );
      setFilteredPackaging(filtered);
    } else {
      setFilteredPackaging(packaging);
    }
  }, [packagingSearch, packaging]);

  // Initialize searches when editing
  useEffect(() => {
    if (isEditing && initialPackaging?.packagingId) {
      const existingPackaging = packaging.find(
        (pkg) => pkg.id === initialPackaging.packagingId
      );
      if (existingPackaging) {
        setPackagingSearch(existingPackaging.name);
      }
    }
  }, [isEditing, initialPackaging?.packagingId, packaging]);

  useEffect(() => {
    if (initialPackaging) {
      setFormData(initialPackaging);
    } else {
      setFormData({
        supplierId: "",
        packagingId: "",
        unitPrice: 0,
        tax: 0,
        moq: 1,
        bulkPrice: 0,
        quantityForBulkPrice: 1,
        leadTime: 7,
        availability: "in-stock",
        notes: "",
      });
    }
  }, [initialPackaging]);

  // Get selected packaging details
  const selectedPackaging = useMemo(() => {
    return packaging.find((pkg) => pkg.id === formData.packagingId);
  }, [packaging, formData.packagingId]);

  const handleChange = (
    field: keyof SupplierPackaging,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle packaging selection
  const handleSelectPackaging = (selectedPkg: Packaging) => {
    setFormData({
      ...formData,
      packagingId: selectedPkg.id,
    });
    setPackagingSearch(selectedPkg.name);
    setOpenPackagingCombobox(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId || !formData.packagingId || !formData.bulkPrice) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Calculate unit price from bulk price and quantity
    const bulkPrice = formData.bulkPrice || 0;
    const quantity = formData.quantityForBulkPrice || 1;
    const calculatedUnitPrice = quantity > 1 ? bulkPrice / quantity : bulkPrice;

    let savedPackaging: SupplierPackaging;

    if (isEditing) {
      savedPackaging = {
        ...(formData as SupplierPackaging),
        unitPrice: calculatedUnitPrice,
        updatedAt: new Date().toISOString(),
      };
    } else {
      const newId = Date.now().toString();
      savedPackaging = {
        ...formData,
        id: newId,
        unitPrice: calculatedUnitPrice,
        createdAt: new Date().toISOString(),
      } as SupplierPackaging;
    }

    onSave(savedPackaging);
    onClose();
    if (!isEditing) {
      setFormData({
        supplierId: "",
        packagingId: "",
        unitPrice: 0,
        tax: 0,
        moq: 1,
        bulkPrice: 0,
        quantityForBulkPrice: 1,
        leadTime: 7,
        availability: "in-stock",
        notes: "",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="supplier" className="text-foreground">
              Supplier *
            </Label>
            <Select
              value={formData.supplierId || ""}
              onValueChange={(value) => handleChange("supplierId", value)}
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="packaging" className="text-foreground">
              Packaging *
            </Label>
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
                    !formData.packagingId && "text-muted-foreground"
                  )}
                >
                  {formData.packagingId
                    ? packaging.find((pkg) => pkg.id === formData.packagingId)
                        ?.name
                    : "Select packaging"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search packaging..."
                    value={packagingSearch}
                    onValueChange={setPackagingSearch}
                  />
                  <CommandList>
                    {filteredPackaging.length > 0 ? (
                      <CommandGroup heading="Packaging">
                        {filteredPackaging.map((pkg) => (
                          <CommandItem
                            key={pkg.id}
                            value={pkg.name}
                            onSelect={() => handleSelectPackaging(pkg)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.packagingId === pkg.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{pkg.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {pkg.type}
                                </Badge>
                                {pkg.capacity && pkg.unit && (
                                  <span>
                                    {pkg.capacity} {pkg.unit}
                                  </span>
                                )}
                                {pkg.buildMaterial && (
                                  <span>• {pkg.buildMaterial}</span>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : (
                      <CommandEmpty>No packaging found.</CommandEmpty>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Packaging Details (Read-only) */}
          {selectedPackaging && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Type
                </Label>
                <div className="text-sm font-medium">
                  {PACKAGING_TYPES.find(
                    (t) => t.value === selectedPackaging.type
                  )?.label || selectedPackaging.type}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Capacity
                </Label>
                <div className="text-sm font-medium">
                  {selectedPackaging.capacity && selectedPackaging.unit
                    ? `${selectedPackaging.capacity} ${selectedPackaging.unit}`
                    : "Not specified"}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Build Material
                </Label>
                <div className="text-sm font-medium">
                  {selectedPackaging.buildMaterial || "Not specified"}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bulk-price" className="text-foreground">
                Price (₹) *
              </Label>
              <Input
                id="bulk-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.bulkPrice || ""}
                onChange={(e) =>
                  handleChange("bulkPrice", parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                className="focus-enhanced"
              />
            </div>
            <div>
              <Label htmlFor="quantity" className="text-foreground">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantityForBulkPrice || ""}
                onChange={(e) =>
                  handleChange(
                    "quantityForBulkPrice",
                    parseInt(e.target.value) || 1
                  )
                }
                placeholder="1"
                className="focus-enhanced"
              />
            </div>
            <div>
              <Label htmlFor="tax" className="text-foreground">
                Tax (%)
              </Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                value={formData.tax || ""}
                onChange={(e) =>
                  handleChange("tax", parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                className="focus-enhanced"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Unit Price (₹)</Label>
              <div className="text-sm font-medium text-foreground bg-muted px-3 py-2 rounded-md">
                ₹
                {formData.quantityForBulkPrice &&
                formData.quantityForBulkPrice > 1 &&
                formData.bulkPrice
                  ? (
                      formData.bulkPrice / formData.quantityForBulkPrice
                    ).toFixed(2)
                  : (formData.bulkPrice || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <Label className="text-foreground">Price After Tax (₹)</Label>
              <div className="text-sm font-medium text-foreground bg-muted px-3 py-2 rounded-md">
                ₹
                {(() => {
                  const unitPrice =
                    formData.quantityForBulkPrice &&
                    formData.quantityForBulkPrice > 1 &&
                    formData.bulkPrice
                      ? formData.bulkPrice / formData.quantityForBulkPrice
                      : formData.bulkPrice || 0;
                  return formData.tax
                    ? (unitPrice * (1 + formData.tax / 100)).toFixed(2)
                    : unitPrice.toFixed(2);
                })()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="moq" className="text-foreground">
                MOQ
              </Label>
              <Input
                id="moq"
                type="number"
                min="1"
                value={formData.moq || ""}
                onChange={(e) =>
                  handleChange("moq", parseInt(e.target.value) || 1)
                }
                placeholder="1"
                className="focus-enhanced"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lead-time" className="text-foreground">
                Lead Time (days)
              </Label>
              <Input
                id="lead-time"
                type="number"
                min="0"
                value={formData.leadTime || ""}
                onChange={(e) =>
                  handleChange("leadTime", parseInt(e.target.value) || 7)
                }
                placeholder="7"
                className="focus-enhanced"
              />
            </div>
            <div>
              <Label htmlFor="availability" className="text-foreground">
                Availability
              </Label>
              <Select
                value={formData.availability || "in-stock"}
                onValueChange={(value) => handleChange("availability", value)}
              >
                <SelectTrigger className="focus-enhanced">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGING_AVAILABILITY.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-foreground">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes..."
              className="focus-enhanced"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <Button type="submit" className="flex-1 btn-secondary">
              {isEditing ? "Update Packaging" : "Add Packaging"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
