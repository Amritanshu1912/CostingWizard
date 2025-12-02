// src/app/batches/components/batch-form.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { convertToDisplayUnit } from "@/utils/unit-conversion-utils";
import { db } from "@/lib/db";
import type { BatchProductItem, ProductionBatch } from "@/types/shared-types";
import { cn } from "@/utils/shared-utils";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertCircle, Check, Package2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface BatchFormProps {
  initialBatch?: ProductionBatch;
  onSave: (
    batch: Omit<ProductionBatch, "id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function BatchForm({
  initialBatch,
  onSave,
  onCancel,
  onDelete,
}: BatchFormProps) {
  const [formData, setFormData] = useState({
    batchName: initialBatch?.batchName || "",
    description: initialBatch?.description || "",
    startDate: initialBatch?.startDate || "",
    endDate: initialBatch?.endDate || "",
    status: initialBatch?.status || ("draft" as ProductionBatch["status"]),
  });

  const [items, setItems] = useState<BatchProductItem[]>(
    initialBatch?.items || []
  );

  const products = useLiveQuery(() => db.products.toArray(), []);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.batchName.trim()) {
      newErrors.batchName = "Batch name is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    if (items.length === 0) {
      newErrors.items = "Please add at least one product";
    }

    const hasQuantities = items.some((item) =>
      item.variants.some((v) => v.totalFillQuantity > 0)
    );

    if (items.length > 0 && !hasQuantities) {
      newErrors.quantities =
        "Please specify quantities for at least one variant";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = async () => {
    if (!selectedProductId) return;

    if (items.some((item) => item.productId === selectedProductId)) {
      setErrors({ ...errors, product: "Product already added to this batch" });
      return;
    }

    const variants = await db.productVariants
      .where("productId")
      .equals(selectedProductId)
      .toArray();

    if (variants.length === 0) {
      setErrors({
        ...errors,
        product: "This product has no variants. Please add variants first.",
      });
      return;
    }

    const newItem: BatchProductItem = {
      productId: selectedProductId,
      variants: variants.map((v) => ({
        variantId: v.id,
        totalFillQuantity: 0,
        fillUnit: v.fillUnit,
      })),
    };

    setItems([...items, newItem]);
    setSelectedProductId("");
    setErrors({ ...errors, product: "", items: "" });
  };

  const handleRemoveProduct = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const handleVariantQuantityChange = (
    productId: string,
    variantId: string,
    quantity: number
  ) => {
    setItems(
      items.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            variants: item.variants.map((v) =>
              v.variantId === variantId
                ? { ...v, totalFillQuantity: quantity }
                : v
            ),
          };
        }
        return item;
      })
    );
    setErrors({ ...errors, quantities: "" });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const filteredItems = items
      .map((item) => ({
        ...item,
        variants: item.variants.filter((v) => v.totalFillQuantity > 0),
      }))
      .filter((item) => item.variants.length > 0);

    const batch = {
      batchName: formData.batchName,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      items: filteredItems,
    };

    onSave(batch as any);
  };

  const totalProducts = items.length;
  const totalVariants = items.reduce(
    (sum, item) => sum + item.variants.length,
    0
  );
  const variantsWithQuantity = items.reduce(
    (sum, item) =>
      sum + item.variants.filter((v) => v.totalFillQuantity > 0).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Form Stats */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold">{totalProducts}</p>
          <p className="text-xs text-muted-foreground">Products</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{variantsWithQuantity}</p>
          <p className="text-xs text-muted-foreground">Variants Planned</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{totalVariants}</p>
          <p className="text-xs text-muted-foreground">Total Variants</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Batch Name *</Label>
          <Input
            value={formData.batchName}
            onChange={(e) => {
              setFormData({ ...formData, batchName: e.target.value });
              setErrors({ ...errors, batchName: "" });
            }}
            placeholder="e.g., March Production Run"
            className={cn("h-9", errors.batchName && "border-red-500")}
          />
          {errors.batchName && (
            <p className="text-xs text-red-600">{errors.batchName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                status: value as ProductionBatch["status"],
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Start Date *</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              setFormData({ ...formData, startDate: e.target.value });
              setErrors({ ...errors, startDate: "", endDate: "" });
            }}
            className={cn("h-9", errors.startDate && "border-red-500")}
          />
          {errors.startDate && (
            <p className="text-xs text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs">End Date *</Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => {
              setFormData({ ...formData, endDate: e.target.value });
              setErrors({ ...errors, endDate: "" });
            }}
            className={cn("h-9", errors.endDate && "border-red-500")}
          />
          {errors.endDate && (
            <p className="text-xs text-red-600">{errors.endDate}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Batch description..."
          rows={2}
          className="text-sm resize-none"
        />
      </div>

      {/* Add Products */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Products & Variants</Label>
          {errors.items && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.items}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Select
            value={selectedProductId}
            onValueChange={(value) => {
              setSelectedProductId(value);
              setErrors({ ...errors, product: "" });
            }}
          >
            <SelectTrigger
              className={cn("h-9 flex-1", errors.product && "border-red-500")}
            >
              <SelectValue placeholder="Select product to add" />
            </SelectTrigger>
            <SelectContent>
              {products?.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddProduct}
            size="sm"
            disabled={!selectedProductId}
            className="h-9"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        {errors.product && (
          <p className="text-xs text-red-600">{errors.product}</p>
        )}
        {errors.quantities && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.quantities}
          </p>
        )}
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {items.map((item) => (
          <ProductItemCard
            key={item.productId}
            item={item}
            onRemove={() => handleRemoveProduct(item.productId)}
            onVariantChange={handleVariantQuantityChange}
          />
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
            <Package2 className="h-16 w-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium mb-1">No products added yet</p>
            <p className="text-xs">
              Add products above to start planning your batch
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-background py-3">
        <Button onClick={handleSubmit} className="flex-1">
          <Check className="h-4 w-4 mr-2" />
          {initialBatch ? "Update Batch" : "Create Batch"}
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        {onDelete && initialBatch && (
          <Button onClick={onDelete} variant="destructive" className="px-4">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Product Item Card Component (Enhanced)
interface ProductItemCardProps {
  item: BatchProductItem;
  onRemove: () => void;
  onVariantChange: (
    productId: string,
    variantId: string,
    quantity: number
  ) => void;
}

function ProductItemCard({
  item,
  onRemove,
  onVariantChange,
}: ProductItemCardProps) {
  const product = useLiveQuery(
    () => db.products.get(item.productId),
    [item.productId]
  );

  const variants = useLiveQuery(
    async () => {
      const variantData = await Promise.all(
        item.variants.map(async (v) => {
          const variant = await db.productVariants.get(v.variantId);
          return { ...v, variant };
        })
      );
      return variantData;
    },
    [item.variants],
    []
  );

  if (!product) return null;

  const variantsWithQty = item.variants.filter(
    (v) => v.totalFillQuantity > 0
  ).length;

  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20">
              <Package2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base truncate">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {item.variants.length} variants
                </p>
                {variantsWithQty > 0 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Badge variant="secondary" className="text-xs">
                      {variantsWithQty} planned
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Variants */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Variant Quantities
          </Label>
          {variants.map((v) => {
            if (!v.variant) return null;

            const units =
              v.totalFillQuantity && v.variant.fillQuantity > 0
                ? Math.round(v.totalFillQuantity / v.variant.fillQuantity)
                : 0;

            const hasQuantity = v.totalFillQuantity > 0;

            return (
              <div
                key={v.variantId}
                className={cn(
                  "grid grid-cols-12 gap-3 items-center p-3 rounded-lg border transition-colors",
                  hasQuantity
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/30 border-border"
                )}
              >
                <div className="col-span-4 text-sm font-medium truncate">
                  {v.variant.name}
                </div>
                <div className="col-span-4">
                  <Input
                    type="number"
                    value={v.totalFillQuantity || ""}
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      onVariantChange(item.productId, v.variantId, newValue);
                    }}
                    placeholder="0"
                    className="h-9 text-sm"
                    min="0"
                    step="10"
                  />
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {v.variant
                    ? convertToDisplayUnit(1, v.variant.fillUnit).unit
                    : ""}
                </div>
                <div className="col-span-2 text-right">
                  {units > 0 && (
                    <Badge variant="default" className="text-xs font-semibold">
                      {units} units
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
