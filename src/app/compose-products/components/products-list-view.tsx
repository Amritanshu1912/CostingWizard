"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package2 } from "lucide-react";
import type { Product } from "@/lib/types";

interface ProductsListViewProps {
  products: Product[];
  selectedProductId?: string;
  onSelectProduct: (product: Product) => void;
}

export function ProductsListView({
  products,
  selectedProductId,
  onSelectProduct,
}: ProductsListViewProps) {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Products</CardTitle>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Products List */}
        <div className="space-y-1 p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                selectedProductId === product.id
                  ? "bg-primary/10 border-2 border-primary"
                  : "border border-transparent"
              }`}
              onClick={() => onSelectProduct(product)}
            >
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {product.name}
                  </h4>

                  <Badge
                    variant={
                      product.status === "active" ? "default" : "secondary"
                    }
                    className="text-xs mt-1"
                  >
                    {product.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && !isCreating && (
            <div className="text-center py-12 px-4">
              <Package2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                No products yet
              </p>
              <Button onClick={() => setIsCreating(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create First Product
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
