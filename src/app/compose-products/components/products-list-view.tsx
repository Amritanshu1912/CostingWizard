"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package2, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { useEnrichedRecipes } from "@/hooks/use-recipes";
import type { Product } from "@/lib/types";

interface ProductsListViewProps {
  products: Product[];
  selectedProductId?: string;
  onSelectProduct: (product: Product) => void;
  onCreateProduct: () => void; // NEW: Callback to trigger create
}

export function ProductsListView({
  products,
  selectedProductId,
  onSelectProduct,
  onCreateProduct,
}: ProductsListViewProps) {
  // Fetch all variants once
  const allVariants = useLiveQuery(() => db.productVariants.toArray(), []);

  // Fetch all recipes with costs
  const enrichedRecipes = useEnrichedRecipes();

  // Fetch all recipe variants
  const recipeVariants = useLiveQuery(() => db.recipeVariants.toArray(), []);

  // Create lookup maps
  const variantCountMap = useMemo(() => {
    if (!allVariants) return new Map<string, number>();

    const map = new Map<string, number>();
    allVariants.forEach((variant) => {
      map.set(variant.productId, (map.get(variant.productId) || 0) + 1);
    });
    return map;
  }, [allVariants]);

  const recipeNameMap = useMemo(() => {
    const map = new Map<string, string>();

    // Add base recipes
    enrichedRecipes.forEach((recipe) => {
      map.set(recipe.id, recipe.name);
    });

    // Add recipe variants
    recipeVariants?.forEach((variant) => {
      map.set(variant.id, variant.name);
    });

    return map;
  }, [enrichedRecipes, recipeVariants]);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Products</CardTitle>
          <Button onClick={onCreateProduct} size="sm">
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

            return (
              <div
                key={product.id}
                className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                  selectedProductId === product.id
                    ? "bg-primary/10 border-2 border-primary"
                    : "border border-transparent"
                }`}
                onClick={() => onSelectProduct(product)}
              >
                {/* Row 1: Icon + Name + Badge */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
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

                {/* Row 2: Variants + Recipe Name */}
                <div className="text-xs text-muted-foreground ml-10">
                  <span className="font-medium text-foreground">
                    {variantCount} variant{variantCount !== 1 ? "s" : ""}
                  </span>
                  {" • "}
                  <span className="truncate">{recipeName}</span>
                </div>
              </div>
            );
          })}

          {products.length === 0 && (
            <div className="text-center py-12 px-4">
              <Package2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
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
