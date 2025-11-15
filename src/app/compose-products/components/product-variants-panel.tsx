"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Edit2, ArrowLeft, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import {
  getProductVariantsWithDetails,
  calculateVariantCostAnalysis,
} from "@/hooks/use-products";
import { ProductForm } from "./product-form";
import { VariantEditor } from "./variant-editor";
import { VariantCard } from "./variant-card";
import type {
  Product,
  ProductVariant,
  ProductVariantWithDetails,
  ProductVariantCostAnalysis,
} from "@/lib/types";

type ViewState =
  | { type: "VIEWING_VARIANTS" }
  | { type: "CREATING_PRODUCT" }
  | { type: "EDITING_PRODUCT" }
  | { type: "CREATING_VARIANT" };

interface ProductVariantsPanelProps {
  product: Product | null;
  isCreating?: boolean; // ← NEW
  onProductCreated?: (product: Product) => void;
  onProductUpdated?: () => void;
  onProductDeleted?: () => void;
}

export function ProductVariantsPanel({
  product,
  isCreating = false,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
}: ProductVariantsPanelProps) {
  const [viewState, setViewState] = useState<ViewState>({
    type: isCreating
      ? "CREATING_PRODUCT"
      : product
      ? "VIEWING_VARIANTS"
      : "CREATING_PRODUCT",
  });
  const [variants, setVariants] = useState<ProductVariantWithDetails[]>([]);
  const [costAnalyses, setCostAnalyses] = useState<
    Map<string, ProductVariantCostAnalysis>
  >(new Map());

  useEffect(() => {
    if (product && viewState.type === "VIEWING_VARIANTS") {
      loadVariants();
    }
  }, [product?.id, viewState]);

  // Update view state when product changes
  useEffect(() => {
    if (product) {
      setViewState({ type: "VIEWING_VARIANTS" });
    }
  }, [product?.id]);

  useEffect(() => {
    if (isCreating && !product) {
      setViewState({ type: "CREATING_PRODUCT" });
    }
  }, [isCreating, product]);

  const loadVariants = async () => {
    if (!product) return;

    const variantsData = await getProductVariantsWithDetails(product.id);
    setVariants(variantsData);

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

  const handleCreateProduct = async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => {
    const productId = crypto.randomUUID();
    const newProduct: Product = {
      id: productId,
      ...productData,
      createdAt: new Date().toISOString(),
    };

    await db.products.add(newProduct);
    setViewState({ type: "VIEWING_VARIANTS" });
    onProductCreated?.(newProduct);
  };

  const handleUpdateProduct = async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!product) return;

    await db.products.update(product.id, productData);
    setViewState({ type: "VIEWING_VARIANTS" });
    onProductUpdated?.();
  };

  const handleDeleteProduct = async () => {
    if (!product) return;

    if (
      !confirm(
        `Are you sure you want to delete "${product.name}" and all its variants?`
      )
    )
      return;

    await db.productVariants.where("productId").equals(product.id).delete();
    await db.products.delete(product.id);
    onProductDeleted?.();
  };

  const handleSaveVariant = async (variant: ProductVariant) => {
    await db.productVariants.put(variant);
    setViewState({ type: "VIEWING_VARIANTS" });
  };

  const handleUpdateVariant = async (variant: ProductVariant) => {
    await db.productVariants.put(variant);
    await loadVariants();
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (confirm("Are you sure you want to delete this variant?")) {
      await db.productVariants.delete(variantId);
      await loadVariants();
    }
  };

  // CREATE PRODUCT VIEW
  if (viewState.type === "CREATING_PRODUCT") {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Create New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            onSave={handleCreateProduct}
            onCancel={() => setViewState({ type: "VIEWING_VARIANTS" })}
          />
        </CardContent>
      </Card>
    );
  }

  // EDIT PRODUCT VIEW
  if (viewState.type === "EDITING_PRODUCT" && product) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewState({ type: "VIEWING_VARIANTS" })}
              className="h-7"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <CardTitle className="text-lg">Edit Product</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ProductForm
            initialProduct={product}
            onSave={handleUpdateProduct}
            onCancel={() => setViewState({ type: "VIEWING_VARIANTS" })}
          />
        </CardContent>
      </Card>
    );
  }

  // CREATE VARIANT VIEW
  if (viewState.type === "CREATING_VARIANT" && product) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewState({ type: "VIEWING_VARIANTS" })}
                  className="h-7 px-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <Badge
                  variant={
                    product.status === "active" ? "default" : "secondary"
                  }
                >
                  {product.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Card className="border-2 border-primary">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Create New Variant</h3>
              <VariantEditor
                productId={product.id}
                onSave={handleSaveVariant}
                onCancel={() => setViewState({ type: "VIEWING_VARIANTS" })}
              />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  // VIEWING VARIANTS (Default)
  if (!product) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center py-24">
          <Package className="h-20 w-20 text-muted-foreground/30 mb-6" />
          <h3 className="text-xl font-medium text-muted-foreground mb-2">
            No product selected
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select a product from the list or create a new one
          </p>
          <Button onClick={() => setViewState({ type: "CREATING_PRODUCT" })}>
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{product.name}</CardTitle>
              <Badge
                variant={product.status === "active" ? "default" : "secondary"}
              >
                {product.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewState({ type: "EDITING_PRODUCT" })}
                className="h-7 w-7 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteProduct}
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {variants.length} variant{variants.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            onClick={() => setViewState({ type: "CREATING_VARIANT" })}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
        {variants.map((variant) => {
          const costAnalysis = costAnalyses.get(variant.id);
          return (
            <VariantCard
              key={variant.id}
              variant={variant}
              costAnalysis={costAnalysis}
              onSave={handleUpdateVariant}
              onDelete={() => handleDeleteVariant(variant.id)}
            />
          );
        })}

        {variants.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No variants yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Create your first variant to start selling this product in
              different sizes
            </p>
            <Button onClick={() => setViewState({ type: "CREATING_VARIANT" })}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Variant
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
