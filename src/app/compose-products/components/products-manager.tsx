"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsListView } from "./products-list-view";
import { ProductVariantsManager } from "./product-variants-manager";
import { seedProductsData } from "@/lib/seedProductsData";
import type { Product } from "@/lib/types";

export function ProductsManager() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const products = useLiveQuery(() => db.products.toArray());

  useEffect(() => {
    // Seed products data on client-side mount
    seedProductsData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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
          <ProductsListView
            products={products || []}
            onSelectProduct={setSelectedProduct}
          />
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

      {/* Selected Product Variants Manager */}
      {selectedProduct && (
        <ProductVariantsManager
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
