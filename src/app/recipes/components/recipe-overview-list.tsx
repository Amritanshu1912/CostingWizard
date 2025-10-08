// RecipeOverviewList.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";

interface RecipeOverviewListProps {
  products: Product[];
}

export function RecipeOverviewList({ products }: RecipeOverviewListProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Recent Recipes</CardTitle>
        <CardDescription>
          Latest product recipes created or updated
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.slice(0, 5).map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
            >
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  {product.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  Batch Size: {product.batchSizeKg || 0} kg • Cost: ₹
                  {(product.totalCostPerKg || 0).toFixed(2)}/kg
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="font-medium text-foreground">
                    ₹
                    {(
                      (product.batchSizeKg || 0) * (product.totalCostPerKg || 0)
                    ).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Batch Total
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-foreground">
                    ₹{(product.sellingPricePerKg || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    selling price
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-accent">
                    {(product.profitMargin || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    profit margin
                  </div>
                </div>
                <Badge
                  variant={
                    product.status === "active" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {product.status.charAt(0).toUpperCase() +
                    product.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
