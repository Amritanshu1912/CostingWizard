"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsListView } from "./products-list-view";
import { ProductVariantsPanel } from "./product-variants-panel";
import { seedProductsData } from "@/lib/seedProductsData";
import type { Product } from "@/lib/types";

export function ProductsManager() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false); // NEW: Track create intent

  const products = useLiveQuery(() => db.products.toArray());

  // useEffect(() => {
  //   seedProductsData();
  // }, []);

  // Auto-select first product ONLY on initial load
  useEffect(() => {
    if (products && products.length > 0 && !selectedProduct && !isCreatingNew) {
      setSelectedProduct(products[0]);
    }
  }, [products]); // Remove selectedProduct from deps!

  // Sync selectedProduct with database changes
  useEffect(() => {
    if (selectedProduct && products) {
      const updatedProduct = products.find((p) => p.id === selectedProduct.id);
      if (updatedProduct) {
        setSelectedProduct(updatedProduct);
      }
    }
  }, [products]);

  const handleProductCreated = (product: Product) => {
    setSelectedProduct(product);
    setIsCreatingNew(false); // Reset create flag
  };

  const handleProductDeleted = () => {
    if (products && products.length > 0) {
      setSelectedProduct(products[0]);
    } else {
      setSelectedProduct(null);
    }
    setIsCreatingNew(false);
  };

  const handleCreateProduct = () => {
    setIsCreatingNew(true); // Set flag FIRST
    setSelectedProduct(null); // Then clear selection
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground">
          Manage product families and their variants with pricing and cost
          analysis
        </p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Product Families</TabsTrigger>
          <TabsTrigger value="all-variants">All Variants</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3">
              <ProductsListView
                products={products || []}
                selectedProductId={selectedProduct?.id}
                onSelectProduct={(product) => {
                  setSelectedProduct(product);
                  setIsCreatingNew(false); // Clear create flag when selecting
                }}
                onCreateProduct={handleCreateProduct}
              />
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-8 xl:col-span-9">
              <ProductVariantsPanel
                product={selectedProduct}
                isCreating={isCreatingNew} // ← NEW PROP
                onProductCreated={handleProductCreated}
                onProductUpdated={() => {
                  // LiveQuery will auto-refresh
                  setIsCreatingNew(false); // Reset flag on update
                }}
                onProductDeleted={handleProductDeleted}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="all-variants" className="space-y-6">
          <div className="text-center py-12 text-muted-foreground">
            All Variants View - Coming Soon
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12 text-muted-foreground">
            Analytics - Coming Soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
