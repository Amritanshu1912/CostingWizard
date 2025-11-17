"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Edit2, ArrowLeft, Trash2 } from "lucide-react";
import {
  getProductVariantsWithDetails,
  calculateVariantCostAnalysis,
  createProduct,
  updateProduct,
  deleteProduct,
  saveProductVariant,
  deleteProductVariant,
} from "@/hooks/use-products";
import { ProductForm, VariantForm } from "./products-forms";
import { VariantCard } from "./products-variant-card";
import { DeleteProductDialog, DeleteVariantDialog } from "./products-dialogs";
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

interface ProductsDetailPanelProps {
  product: Product | null;
  isCreating?: boolean;
  onProductCreated?: (product: Product) => void;
  onProductUpdated?: () => void;
  onProductDeleted?: () => void;
}

export function ProductsDetailPanel({
  product,
  isCreating = false,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
}: ProductsDetailPanelProps) {
  // View state management
  const [viewState, setViewState] = useState<ViewState>({
    type: isCreating
      ? "CREATING_PRODUCT"
      : product
      ? "VIEWING_VARIANTS"
      : "CREATING_PRODUCT",
  });

  // Data state
  const [variants, setVariants] = useState<ProductVariantWithDetails[]>([]);
  const [costAnalyses, setCostAnalyses] = useState<
    Map<string, ProductVariantCostAnalysis>
  >(new Map());

  // Dialog state
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
  const [deleteVariantDialog, setDeleteVariantDialog] = useState<{
    open: boolean;
    variantId: string;
    variantName: string;
  }>({ open: false, variantId: "", variantName: "" });

  // Load variants when viewing them
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

  // Handle external creation trigger
  useEffect(() => {
    if (isCreating && !product) {
      setViewState({ type: "CREATING_PRODUCT" });
    }
  }, [isCreating, product]);

  /**
   * Load product variants with cost analysis
   */
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

  /**
   * Handle product creation
   */
  const handleCreateProduct = async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => {
    const newProduct = await createProduct(productData);
    setViewState({ type: "VIEWING_VARIANTS" });
    onProductCreated?.(newProduct);
  };

  /**
   * Handle product update
   */
  const handleUpdateProduct = async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!product) return;
    await updateProduct(product.id, productData);
    setViewState({ type: "VIEWING_VARIANTS" });
    onProductUpdated?.();
  };

  /**
   * Handle product deletion
   */
  const handleDeleteProduct = () => {
    setDeleteProductDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!product) return;
    await deleteProduct(product.id);
    setDeleteProductDialogOpen(false);
    onProductDeleted?.();
  };

  /**
   * Handle variant save (create or update)
   */
  const handleSaveVariant = async (variant: ProductVariant) => {
    await saveProductVariant(variant);
    setViewState({ type: "VIEWING_VARIANTS" });
  };

  /**
   * Handle variant update from card
   */
  const handleUpdateVariant = async (variant: ProductVariant) => {
    await saveProductVariant(variant);
    await loadVariants();
  };

  /**
   * Handle variant deletion
   */
  const handleDeleteVariant = (variantId: string, variantName: string) => {
    setDeleteVariantDialog({ open: true, variantId, variantName });
  };

  const confirmDeleteVariant = async () => {
    await deleteProductVariant(deleteVariantDialog.variantId);
    setDeleteVariantDialog({ open: false, variantId: "", variantName: "" });
    await loadVariants();
  };

  // ============================================================================
  // VIEW: CREATE PRODUCT
  // ============================================================================
  if (viewState.type === "CREATING_PRODUCT") {
    return (
      <Card className="h-full shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Create New Product
          </CardTitle>
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

  // ============================================================================
  // VIEW: EDIT PRODUCT
  // ============================================================================
  if (viewState.type === "EDITING_PRODUCT" && product) {
    return (
      <Card className="h-full shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewState({ type: "VIEWING_VARIANTS" })}
              className="h-9"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <CardTitle className="text-lg font-semibold">
              Edit Product
            </CardTitle>
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

  // ============================================================================
  // VIEW: CREATE VARIANT
  // ============================================================================
  if (viewState.type === "CREATING_VARIANT" && product) {
    return (
      <Card className="h-full shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewState({ type: "VIEWING_VARIANTS" })}
                className="h-9 px-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <Badge
                  variant={
                    product.status === "active"
                      ? "default"
                      : product.status === "draft"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {product.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Card className="border-2 border-primary shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Create New Variant</h3>
              <VariantForm
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

  // ============================================================================
  // VIEW: NO PRODUCT SELECTED
  // ============================================================================
  if (!product) {
    return (
      <Card className="h-full shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-24">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Package className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-medium text-muted-foreground mb-2">
            No product selected
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
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

  // ============================================================================
  // VIEW: VIEWING VARIANTS (Default)
  // ============================================================================
  return (
    <>
      <Card className="h-full shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            {/* Product Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <Badge
                  variant={
                    product.status === "active" ? "default" : "secondary"
                  }
                >
                  {product.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewState({ type: "EDITING_PRODUCT" })}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteProduct}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex text-sm text-muted-foreground gap-2">
                <span>
                  Recipe: {variants[0]?.recipeName || "Unknown Recipe"}
                </span>
                <span>•</span>
                <span>
                  {variants.length} variant{variants.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Add Variant Button */}
            <Button
              onClick={() => setViewState({ type: "CREATING_VARIANT" })}
              size="sm"
              className="h-9"
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
                onDelete={() => handleDeleteVariant(variant.id, variant.name)}
              />
            );
          })}

          {/* Empty State */}
          {variants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No variants yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Create your first variant to start selling this product in
                different sizes
              </p>
              <Button
                onClick={() => setViewState({ type: "CREATING_VARIANT" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Variant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialogs */}
      <DeleteProductDialog
        open={deleteProductDialogOpen}
        productName={product.name}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setDeleteProductDialogOpen(false)}
      />

      <DeleteVariantDialog
        open={deleteVariantDialog.open}
        variantName={deleteVariantDialog.variantName}
        onConfirm={confirmDeleteVariant}
        onCancel={() =>
          setDeleteVariantDialog({
            open: false,
            variantId: "",
            variantName: "",
          })
        }
      />
    </>
  );
}
