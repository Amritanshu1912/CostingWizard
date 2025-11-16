"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package2, Plus } from "lucide-react";
import { useEnrichedRecipes } from "@/hooks/use-recipes";
import { useVariantCountMap } from "@/hooks/use-products";
import type { Product } from "@/lib/types";

interface ProductsListProps {
  products: Product[];
  selectedProductId?: string;
  onSelectProduct: (product: Product) => void;
  onCreateProduct: () => void;
}

export function ProductsList({
  products,
  selectedProductId,
  onSelectProduct,
  onCreateProduct,
}: ProductsListProps) {
  const variantCountMap = useVariantCountMap();
  const enrichedRecipes = useEnrichedRecipes();

  // Create recipe name lookup map
  const recipeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    enrichedRecipes.forEach((recipe) => {
      map.set(recipe.id, recipe.name);
    });
    return map;
  }, [enrichedRecipes]);

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Products</CardTitle>
          <Button onClick={onCreateProduct} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-1 p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {products.map((product) => {
            const variantCount = variantCountMap.get(product.id) || 0;
            const recipeName =
              recipeNameMap.get(product.recipeId) || "Unknown Recipe";
            const isSelected = selectedProductId === product.id;

            return (
              <div
                key={product.id}
                className={`
                  p-3 rounded-lg cursor-pointer transition-all
                  ${
                    isSelected
                      ? "bg-primary/10 border-2 border-primary shadow-sm"
                      : "border border-transparent hover:bg-muted/50 hover:border-border"
                  }
                `}
                onClick={() => onSelectProduct(product)}
              >
                {/* Product Name & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-8 w-8 rounded bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Package2 className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm truncate">
                      {product.name}
                    </h4>
                  </div>
                  <Badge
                    variant={
                      product.status === "active" ? "default" : "secondary"
                    }
                    className="text-xs flex-shrink-0"
                  >
                    {product.status}
                  </Badge>
                </div>

                {/* Variant Count & Recipe Name */}
                <div className="text-xs text-muted-foreground ml-10 flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {variantCount} variant{variantCount !== 1 ? "s" : ""}
                  </span>
                  <span>•</span>
                  <span className="truncate">{recipeName}</span>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {products.length === 0 && (
            <div className="text-center py-12 px-4">
              <Package2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No products yet
              </p>
              <Button onClick={onCreateProduct} size="sm">
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
