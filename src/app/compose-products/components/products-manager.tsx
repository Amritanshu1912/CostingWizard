"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts } from "@/hooks/use-products";
import { ProductsList } from "./products-list";
import { ProductsDetailPanel } from "./products-detail-panel";
import type { Product } from "@/lib/types";

export function ProductsManager() {
  const products = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  /**
   * Auto-select first product on initial load only
   */
  useEffect(() => {
    if (products.length > 0 && !selectedProduct && !isCreatingNew) {
      setSelectedProduct(products[0]);
    }
  }, [products]);

  /**
   * Sync selected product with database changes
   */
  useEffect(() => {
    if (selectedProduct && products.length > 0) {
      const updatedProduct = products.find((p) => p.id === selectedProduct.id);
      if (updatedProduct) {
        setSelectedProduct(updatedProduct);
      } else {
        // Product was deleted, select first available
        setSelectedProduct(products[0] || null);
      }
    }
  }, [products]);

  /**
   * Handle product creation trigger
   */
  const handleCreateProduct = () => {
    setIsCreatingNew(true);
    setSelectedProduct(null);
  };

  /**
   * Handle product created
   */
  const handleProductCreated = (product: Product) => {
    setSelectedProduct(product);
    setIsCreatingNew(false);
  };

  /**
   * Handle product deletion
   */
  const handleProductDeleted = () => {
    if (products.length > 0) {
      setSelectedProduct(products[0]);
    } else {
      setSelectedProduct(null);
    }
    setIsCreatingNew(false);
  };

  /**
   * Handle product selection
   */
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
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
                selectedProductId={selectedProduct?.id}
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
