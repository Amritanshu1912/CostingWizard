// src/app/products/components/products-manager.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts } from "@/hooks/use-products";
import type { Product } from "@/types/product-types";
import { useMemo, useState } from "react";
import { ProductsDetailPanel } from "./products-detail-panel";
import { ProductsList } from "./products-list";

export function ProductsManager() {
  const products = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<
    string | undefined
  >(undefined);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Compute selected product from ID and products list
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return products.find((p) => p.id === selectedProductId) || null;
  }, [selectedProductId, products]);

  // Auto-select first product on initial load only
  const initialSelectedProductId = useMemo(() => {
    if (products.length > 0 && !selectedProductId && !isCreatingNew) {
      return products[0].id;
    }
    return selectedProductId;
  }, [products, selectedProductId, isCreatingNew]);

  // Sync selected product with database changes
  const syncedSelectedProductId = useMemo(() => {
    if (initialSelectedProductId && products.length > 0) {
      const productExists = products.some(
        (p) => p.id === initialSelectedProductId
      );
      if (productExists) {
        return initialSelectedProductId;
      } else {
        // Product was deleted, select first available
        return products[0]?.id || undefined;
      }
    }
    return initialSelectedProductId;
  }, [initialSelectedProductId, products]);

  // Set the computed selected product ID
  useState(() => {
    if (syncedSelectedProductId !== selectedProductId) {
      setSelectedProductId(syncedSelectedProductId);
    }
  });

  /**
   * Handle product creation trigger
   */
  const handleCreateProduct = () => {
    setIsCreatingNew(true);
    setSelectedProductId(undefined);
  };

  /**
   * Handle product created
   */
  const handleProductCreated = (product: Product) => {
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
   * Handle product selection
   */
  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
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
                onProductUpdated={() => {
                  // LiveQuery will auto-refresh
                  setIsCreatingNew(false);
                }}
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
