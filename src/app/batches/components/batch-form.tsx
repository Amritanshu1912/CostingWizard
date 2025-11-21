"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Plus, Trash2, Package2 } from "lucide-react";
import { db } from "@/lib/db";
import type {
  ProductionBatch,
  BatchProductItem,
  BatchVariantItem,
  CapacityUnit,
} from "@/lib/types";

interface BatchFormProps {
  initialBatch?: ProductionBatch;
  onSave: (batch: ProductionBatch) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function BatchForm({ initialBatch, onSave, onCancel }: BatchFormProps) {
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

  const handleAddProduct = async () => {
    if (!selectedProductId) return;

    // Check if product already exists
    if (items.some((item) => item.productId === selectedProductId)) {
      alert("Product already added to this batch");
      return;
    }

    // Get all variants for this product
    const variants = await db.productVariants
      .where("productId")
      .equals(selectedProductId)
      .toArray();

    if (variants.length === 0) {
      alert("This product has no variants. Please add variants first.");
      return;
    }

    // Add product with empty variant quantities
    const newItem: BatchProductItem = {
      productId: selectedProductId,
      variants: variants.map((v) => ({
        variantId: v.id,
        fillQuantity: 0,
        fillUnit: v.fillUnit,
      })),
    };

    setItems([...items, newItem]);
    setSelectedProductId("");
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
              v.variantId === variantId ? { ...v, fillQuantity: quantity } : v
            ),
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    if (!formData.batchName.trim()) {
      alert("Batch name is required");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Start and end dates are required");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one product");
      return;
    }

    // Validate that at least one variant has quantity > 0
    const hasQuantities = items.some((item) =>
      item.variants.some((v) => v.fillQuantity > 0)
    );

    if (!hasQuantities) {
      alert("Please specify quantities for at least one variant");
      return;
    }

    // Filter out variants with 0 quantity
    const filteredItems = items
      .map((item) => ({
        ...item,
        variants: item.variants.filter((v) => v.fillQuantity > 0),
      }))
      .filter((item) => item.variants.length > 0);

    // Calculate totals (simplified - you can enhance this)
    let totalUnits = 0;
    let totalFillQuantity = 0;

    for (const item of filteredItems) {
      for (const variantItem of item.variants) {
        const variant = await db.productVariants.get(variantItem.variantId);
        if (variant) {
          const units = Math.round(
            variantItem.fillQuantity / variant.fillQuantity
          );
          totalUnits += units;
          totalFillQuantity += variantItem.fillQuantity;
        }
      }
    }

    const batch: ProductionBatch = {
      id: initialBatch?.id || crypto.randomUUID(),
      batchName: formData.batchName,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      progress: initialBatch?.progress || 0,
      items: filteredItems,
      totalUnits,
      totalFillQuantity,
      totalCost: 0, // Will be calculated
      totalRevenue: 0,
      totalProfit: 0,
      profitMargin: 0,
      createdAt: initialBatch?.createdAt || new Date().toISOString(),
    };

    onSave(batch);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Batch Name *</Label>
          <Input
            value={formData.batchName}
            onChange={(e) =>
              setFormData({ ...formData, batchName: e.target.value })
            }
            placeholder="e.g., March Production Run"
            className="h-8"
          />
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
            <SelectTrigger className="h-8">
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
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            className="h-8"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">End Date *</Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            className="h-8"
          />
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
          className="text-sm"
        />
      </div>

      {/* Add Products */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Products & Variants</Label>
        </div>

        <div className="flex gap-2">
          <Select
            value={selectedProductId}
            onValueChange={setSelectedProductId}
          >
            <SelectTrigger className="h-8 flex-1">
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
            className="h-8"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
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
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <Package2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No products added yet</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={handleSubmit} className="flex-1">
          <Check className="h-4 w-4 mr-2" />
          {initialBatch ? "Update Batch" : "Create Batch"}
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

// Product Item Card Component
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

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
              <Package2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">{product.name}</h4>
              <p className="text-xs text-muted-foreground">
                {item.variants.length} variant
                {item.variants.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {variants.map((v) => {
            if (!v.variant) return null;

            const units = v.fillQuantity
              ? Math.round(v.fillQuantity / v.variant.fillQuantity)
              : 0;

            return (
              <div
                key={v.variantId}
                className="grid grid-cols-12 gap-2 items-center p-2 rounded bg-muted/30"
              >
                <div className="col-span-5 text-sm font-medium truncate">
                  {v.variant.name}
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={v.fillQuantity || ""}
                    onChange={(e) =>
                      onVariantChange(
                        item.productId,
                        v.variantId,
                        Number(e.target.value)
                      )
                    }
                    placeholder="0"
                    className="h-7 text-xs"
                    min="0"
                  />
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {v.variant.fillUnit}
                </div>
                <div className="col-span-2 text-xs text-right">
                  {units > 0 && (
                    <Badge variant="secondary" className="text-xs">
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
