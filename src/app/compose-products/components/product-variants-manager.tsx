"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import {
  getProductVariantsWithDetails,
  calculateVariantCostAnalysis,
} from "@/hooks/use-products";
import { VariantEditor } from "./variant-editor";
import { VariantCard } from "./variant-card";
import type {
  Product,
  ProductVariant,
  ProductVariantWithDetails,
  ProductVariantCostAnalysis,
} from "@/lib/types";

interface ProductVariantsManagerProps {
  product: Product;
  onClose: () => void;
}

export function ProductVariantsManager({
  product,
  onClose,
}: ProductVariantsManagerProps) {
  const [variants, setVariants] = useState<ProductVariantWithDetails[]>([]);
  const [costAnalyses, setCostAnalyses] = useState<
    Map<string, ProductVariantCostAnalysis>
  >(new Map());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadVariants();
  }, [product.id]);

  const loadVariants = async () => {
    const variantsData = await getProductVariantsWithDetails(product.id);
    setVariants(variantsData);

    // Calculate cost analyses
    const analyses = new Map();
    for (const variant of variantsData) {
      try {
        const analysis = await calculateVariantCostAnalysis(variant);
        analyses.set(variant.id, analysis);
      } catch (error) {
        console.error("Error calculating cost:", error);
      }
    }
    setCostAnalyses(analyses);
  };

  const handleSaveVariant = async (variant: ProductVariant) => {
    if (editingId) {
      await db.productVariants.put(variant);
    } else {
      await db.productVariants.add(variant);
    }

    setEditingId(null);
    setIsCreating(false);
    await loadVariants();
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (confirm("Are you sure you want to delete this variant?")) {
      await db.productVariants.delete(variantId);
      await loadVariants();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
            <div className="h-8 w-px bg-border" />
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage product variants and pricing
              </p>
            </div>
          </div>
          <Badge
            variant={product.status === "active" ? "default" : "secondary"}
          >
            {product.status}
          </Badge>
        </div>

        {/* Create New Variant Button */}
        {!isCreating && !editingId && (
          <Button onClick={() => setIsCreating(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        )}

        {/* Create New Variant Form */}
        {isCreating && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Create New Variant</CardTitle>
            </CardHeader>
            <CardContent>
              <VariantEditor
                productId={product.id}
                onSave={handleSaveVariant}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
        )}

        {/* Variants List */}
        <div className="grid grid-cols-1 gap-6">
          {variants.map((variant) => {
            const costAnalysis = costAnalyses.get(variant.id);
            const isEditing = editingId === variant.id;

            return (
              <Card
                key={variant.id}
                className={isEditing ? "border-2 border-primary" : ""}
              >
                <CardContent className="p-6">
                  {isEditing ? (
                    <VariantEditor
                      productId={product.id}
                      initialVariant={variant}
                      onSave={handleSaveVariant}
                      onCancel={handleCancel}
                    />
                  ) : (
                    <VariantCard
                      variant={variant}
                      costAnalysis={costAnalysis}
                      onEdit={() => setEditingId(variant.id)}
                      onDelete={() => handleDeleteVariant(variant.id)}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {variants.length === 0 && !isCreating && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No variants yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first variant to start selling this product
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Variant
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
