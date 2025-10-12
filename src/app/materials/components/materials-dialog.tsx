"use client";

import { useState, useMemo, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SupplierMaterial, Supplier, Material } from "@/lib/types";
import {
  MATERIAL_CATEGORIES,
  UNITS,
  AVAILABILITY_OPTIONS,
} from "./materials-constants";

interface MaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMaterial: Partial<SupplierMaterial>;
  setNewMaterial: React.Dispatch<
    React.SetStateAction<Partial<SupplierMaterial>>
  >;
  onSubmit: () => void;
  isEditing: boolean;
  suppliers: Supplier[];
  materials: Material[];
  addMaterial: (material: Omit<Material, "id">) => Promise<string>;
}

export function MaterialDialog({
  open,
  onOpenChange,
  newMaterial,
  setNewMaterial,
  onSubmit,
  isEditing,
  suppliers,
  materials,
  addMaterial,
}: MaterialDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMaterialName, setSelectedMaterialName] = useState(
    (newMaterial as any).materialName || ""
  );
  const [isNewMaterial, setIsNewMaterial] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setSelectedMaterialName((newMaterial as any).materialName || "");
    setIsNewMaterial(false);
    setPopoverOpen(false);
  }, [newMaterial]);

  const filteredMaterials = useMemo(() => {
    return materials
      .filter((material) =>
        material.name.toLowerCase().includes(selectedMaterialName.toLowerCase())
      )
      .slice(0, 10);
  }, [materials, selectedMaterialName]);

  const handleMaterialSelect = (material: Material) => {
    setSelectedMaterialName(material.name);
    setNewMaterial({
      ...newMaterial,
      materialId: material.id,
      materialName: material.name.trim(),
      materialCategory: material.category,
    } as any);
    setIsNewMaterial(false);
  };

  const handleMaterialNameChange = (value: string) => {
    setSelectedMaterialName(value);
    const existingMaterial = materials.find(
      (m) => m.name.toLowerCase() === value.toLowerCase()
    );
    if (existingMaterial) {
      setNewMaterial({
        ...newMaterial,
        materialId: existingMaterial.id,
        materialName: value.trim(),
        materialCategory: existingMaterial.category,
      } as any);
      setIsNewMaterial(false);
    } else {
      setNewMaterial({
        ...newMaterial,
        materialId: "",
        materialName: value.trim(),
        materialCategory: (newMaterial as any).materialCategory || "",
      } as any);
      setIsNewMaterial(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let materialId = newMaterial.materialId;
      if (isNewMaterial && selectedMaterialName.trim()) {
        const existingMaterial = materials.find(
          (m) => m.name.toLowerCase() === selectedMaterialName.toLowerCase()
        );
        if (existingMaterial) {
          materialId = existingMaterial.id;
        } else {
          materialId = await addMaterial({
            name: selectedMaterialName.trim(),
            category: (newMaterial as any).materialCategory || "Other",
            createdAt: new Date().toISOString(),
          } as any);
        }
      }
      setNewMaterial({
        ...newMaterial,
        materialId,
      } as any);
      onSubmit();
    } catch (error) {
      console.error("Error adding material:", error);
      toast.error("Failed to add material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Supplier Material" : "Add Supplier Material"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update material pricing and MOQ information."
              : "Select an existing material or type to add a new one with category."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Material Name *</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between focus-enhanced"
                >
                  {selectedMaterialName
                    ? filteredMaterials.find(
                        (material) => material.name === selectedMaterialName
                      )?.name || selectedMaterialName
                    : "Select or type material name..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search material..."
                    value={selectedMaterialName}
                    onValueChange={handleMaterialNameChange}
                  />
                  <CommandEmpty>No material found.</CommandEmpty>
                  <CommandGroup>
                    {filteredMaterials.map((material) => (
                      <CommandItem
                        key={material.id}
                        value={material.name}
                        onSelect={() => {
                          handleMaterialSelect(material);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedMaterialName === material.name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {material.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {isNewMaterial && selectedMaterialName && (
                    <CommandItem onSelect={() => setIsNewMaterial(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add "{selectedMaterialName}" as new material
                    </CommandItem>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Category</Label>
            <Select
              value={(newMaterial as any).materialCategory || ""}
              onValueChange={(value) =>
                setNewMaterial({
                  ...newMaterial,
                  materialCategory: value,
                } as any)
              }
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue placeholder="Select category (optional)" />
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

          <div>
            <Label>Supplier *</Label>
            <Select
              value={newMaterial.supplierId}
              onValueChange={(value: any) =>
                setNewMaterial({ ...newMaterial, supplierId: value })
              }
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers
                  .filter((s) => s.isActive)
                  .map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Unit Price (₹) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={newMaterial.unitPrice}
              onChange={(e) =>
                setNewMaterial({
                  ...newMaterial,
                  unitPrice: Number(e.target.value),
                })
              }
              placeholder="0.00"
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Tax (%)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={newMaterial.tax}
              onChange={(e) =>
                setNewMaterial({
                  ...newMaterial,
                  tax: Number(e.target.value),
                })
              }
              placeholder="0.00"
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>MOQ *</Label>
            <Input
              type="number"
              min="1"
              value={newMaterial.moq}
              onChange={(e) =>
                setNewMaterial({
                  ...newMaterial,
                  moq: Number(e.target.value),
                })
              }
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Unit</Label>
            <Select
              value={newMaterial.unit}
              onValueChange={(value: any) =>
                setNewMaterial({ ...newMaterial, unit: value })
              }
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue />
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
          <div>
            <Label>Lead Time (days)</Label>
            <Input
              type="number"
              min="1"
              value={newMaterial.leadTime}
              onChange={(e) =>
                setNewMaterial({
                  ...newMaterial,
                  leadTime: Number(e.target.value),
                })
              }
              className="focus-enhanced"
            />
          </div>
          <div>
            <Label>Availability</Label>
            <Select
              value={newMaterial.availability}
              onValueChange={(value: any) =>
                setNewMaterial({
                  ...newMaterial,
                  availability: value as any,
                })
              }
            >
              <SelectTrigger className="focus-enhanced">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={newMaterial.notes}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, notes: e.target.value })
              }
              placeholder="Additional notes about the material"
              className="focus-enhanced"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Material"
              : "Add Material"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
