// src/app/products/components/products-manager.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useProductDetail,
  useProductList,
} from "@/hooks/product-hooks/use-product-data";
import type { ProductDetail, ProductListItem } from "@/types/product-types";
import { useEffect, useState } from "react";
import { ProductsDetailPanel } from "./products-detail-panel";
import { ProductsList } from "./products-list";

/**
 * Main products manager component
 * Coordinates product list and detail views
 * Simplified state management with proper memoization
 */
export function ProductsManager() {
  // Fetch product list using hook
  const products = useProductList();

  // State management
  const [selectedProductId, setSelectedProductId] = useState<
    string | undefined
  >(undefined);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Fetch selected product detail using hook
  const selectedProduct = useProductDetail(selectedProductId || null);

  /**
   * Auto-select first product on initial load
   * Only runs once when products are first loaded
   */
  useEffect(() => {
    if (products.length > 0 && !selectedProductId && !isCreatingNew) {
      setSelectedProductId(products[0].id);
    }
  }, [products.length, selectedProductId, isCreatingNew, products]);

  /**
   * Handle product selection changes
   * If selected product is deleted, select first available
   */
  useEffect(() => {
    if (selectedProductId && products.length > 0) {
      const productExists = products.some((p) => p.id === selectedProductId);
      if (!productExists) {
        // Selected product was deleted, select first available
        setSelectedProductId(products[0]?.id || undefined);
      }
    }
  }, [selectedProductId, products]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle product creation trigger
   */
  const handleCreateProduct = () => {
    setIsCreatingNew(true);
    setSelectedProductId(undefined);
  };

  /**
   * Handle product created successfully
   */
  const handleProductCreated = (product: ProductDetail) => {
    setSelectedProductId(product.id);
    setIsCreatingNew(false);
  };

  /**
   * Handle product deletion
   */
  const handleProductDeleted = () => {
    if (products.length > 0) {
      setSelectedProductId(products[0].id);
    } else {
      setSelectedProductId(undefined);
    }
    setIsCreatingNew(false);
  };

  /**
   * Handle product selection from list
   */
  const handleSelectProduct = (product: ProductListItem) => {
    setSelectedProductId(product.id);
    setIsCreatingNew(false);
  };

  /**
   * Handle product update
   * LiveQuery will automatically refresh the data
   */
  const handleProductUpdated = () => {
    setIsCreatingNew(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Manage product families and their variants with pricing and cost
          analysis
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Product Families</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar: Products List */}
            <div className="lg:col-span-4 xl:col-span-3">
              <ProductsList
                products={products}
                selectedProductId={selectedProductId}
                onSelectProduct={handleSelectProduct}
                onCreateProduct={handleCreateProduct}
              />
            </div>

            {/* Right Panel: Product Details & Variants */}
            <div className="lg:col-span-8 xl:col-span-9">
              <ProductsDetailPanel
                product={selectedProduct}
                isCreating={isCreatingNew}
                onProductCreated={handleProductCreated}
                onProductUpdated={handleProductUpdated}
                onProductDeleted={handleProductDeleted}
              />
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-16 text-muted-foreground">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
              <p className="text-sm">
                Analyze product performance, costs, margins, and profitability
                trends
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
