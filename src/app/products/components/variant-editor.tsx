// src/app/products/components/variant-editor.tsx
"use client";

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
import { db } from "@/lib/db";
import type { CapacityUnit, ProductVariant } from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, Package, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";

interface VariantEditorProps {
  productId: string;
  initialVariant?: ProductVariant;
  onSave: (variant: ProductVariant) => void;
  onCancel: () => void;
}

export function VariantEditor({
  productId,
  initialVariant,
  onSave,
  onCancel,
}: VariantEditorProps) {
  const [formData, setFormData] = useState<Partial<ProductVariant>>(
    initialVariant || {
      productId,
      name: "",
      sku: generateSKU(),
      fillQuantity: 1000,
      fillUnit: "gm",
      labelsPerUnit: 2,
      sellingPricePerUnit: 0,
      targetProfitMargin: 30,
      isActive: true,
    }
  );

  const supplierPackagings = useLiveQuery(() => db.supplierPackaging.toArray());
  const supplierLabels = useLiveQuery(() => db.supplierLabels.toArray());

  const [packagingDetails, setPackagingDetails] = useState<any[]>([]);
  const [labelDetails, setLabelDetails] = useState<any[]>([]);

  // Load packaging details
  useEffect(() => {
    if (supplierPackagings) {
      Promise.all(
        supplierPackagings.map(async (sp) => {
          const packaging = await db.packaging.get(sp.packagingId);
          const supplier = await db.suppliers.get(sp.supplierId);
          return {
            ...sp,
            packaging,
            supplier,
            displayName: `${packaging?.name} - ${packaging?.capacity}${packaging?.unit} (${supplier?.name})`,
          };
        })
      ).then(setPackagingDetails);
    }
  }, [supplierPackagings]);

  // Load label details
  useEffect(() => {
    if (supplierLabels) {
      Promise.all(
        supplierLabels.map(async (sl) => {
          const label = sl.labelId ? await db.labels.get(sl.labelId) : null;
          const supplier = await db.suppliers.get(sl.supplierId);
          return {
            ...sl,
            label,
            supplier,
            displayName: `${label?.name || "Custom Label"} (${supplier?.name})`,
          };
        })
      ).then(setLabelDetails);
    }
  }, [supplierLabels]);

  function generateSKU() {
    const timestamp = Date.now().toString().slice(-6);
    return `VAR-${timestamp}`;
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.sku || !formData.packagingSelectionId) {
      alert("Please fill in all required fields");
      return;
    }

    onSave({
      id: initialVariant?.id || crypto.randomUUID(),
      productId,
      name: formData.name,
      sku: formData.sku,
      fillQuantity: formData.fillQuantity || 1000,
      fillUnit: formData.fillUnit || "gm",
      packagingSelectionId: formData.packagingSelectionId,
      frontLabelSelectionId: formData.frontLabelSelectionId,
      backLabelSelectionId: formData.backLabelSelectionId,
      labelsPerUnit: formData.labelsPerUnit || 2,
      sellingPricePerUnit: formData.sellingPricePerUnit || 0,
      targetProfitMargin: formData.targetProfitMargin,
      minimumProfitMargin: formData.minimumProfitMargin,
      distributionChannels: formData.distributionChannels,
      unitsPerCase: formData.unitsPerCase,
      sellingPricePerCase: formData.sellingPricePerCase,
      isActive: formData.isActive ?? true,
      notes: formData.notes,
      createdAt: initialVariant?.createdAt || new Date().toISOString(),
    } as ProductVariant);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Variant Name *</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., 1kg Bottle, 500gm Pouch"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            value={formData.sku || ""}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="Unique product code"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="fillQty">Fill Quantity *</Label>
            <Input
              id="fillQty"
              type="number"
              value={formData.fillQuantity || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fillQuantity: Number(e.target.value),
                })
              }
              placeholder="1000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fillUnit">Unit</Label>
            <Select
              value={formData.fillUnit}
              onValueChange={(value) =>
                setFormData({ ...formData, fillUnit: value as CapacityUnit })
              }
            >
              <SelectTrigger id="fillUnit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gm">gm</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
                <SelectItem value="L">L</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Packaging Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Packaging *
        </Label>
        <Select
          value={formData.packagingSelectionId}
          onValueChange={(value) =>
            setFormData({ ...formData, packagingSelectionId: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select packaging from supplier" />
          </SelectTrigger>
          <SelectContent>
            {packagingDetails.map((pd) => (
              <SelectItem key={pd.id} value={pd.id}>
                {pd.displayName} - ₹{pd.unitPrice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Labels Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Front Label (Optional)
          </Label>
          <Select
            value={formData.frontLabelSelectionId || ""}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                frontLabelSelectionId: value || undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select front label" />
            </SelectTrigger>
            <SelectContent>
              {labelDetails.map((ld) => (
                <SelectItem key={ld.id} value={ld.id}>
                  {ld.displayName} - ₹{ld.unitPrice}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Back Label (Optional)
          </Label>
          <Select
            value={formData.backLabelSelectionId || ""}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                backLabelSelectionId: value || undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select back label" />
            </SelectTrigger>
            <SelectContent>
              {labelDetails.map((ld) => (
                <SelectItem key={ld.id} value={ld.id}>
                  {ld.displayName} - ₹{ld.unitPrice}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price per Unit *</Label>
          <Input
            id="sellingPrice"
            type="number"
            value={formData.sellingPricePerUnit || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                sellingPricePerUnit: Number(e.target.value),
              })
            }
            placeholder="₹150"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetMargin">Target Margin (%)</Label>
          <Input
            id="targetMargin"
            type="number"
            value={formData.targetProfitMargin || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                targetProfitMargin: Number(e.target.value),
              })
            }
            placeholder="30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minMargin">Minimum Margin (%)</Label>
          <Input
            id="minMargin"
            type="number"
            value={formData.minimumProfitMargin || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                minimumProfitMargin: Number(e.target.value),
              })
            }
            placeholder="20"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button onClick={handleSubmit} className="flex-1">
          <Check className="h-4 w-4 mr-2" />
          {initialVariant ? "Update Variant" : "Create Variant"}
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
