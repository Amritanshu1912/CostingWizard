"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Package2, ChevronRight, Check, X } from "lucide-react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import type { Product } from "@/lib/types";

interface ProductsListViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export function ProductsListView({
  products,
  onSelectProduct,
}: ProductsListViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    category: "",
    status: "draft",
  });

  const recipes = useLiveQuery(() => db.recipes.toArray());

  const handleCreate = async () => {
    if (!newProduct.name || !newProduct.recipeId) return;

    await db.products.add({
      id: crypto.randomUUID(),
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category,
      recipeId: newProduct.recipeId!,
      status: newProduct.status || "draft",
      createdAt: new Date().toISOString(),
    } as Product);

    setIsCreating(false);
    setNewProduct({ name: "", description: "", category: "", status: "draft" });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setNewProduct({ name: "", description: "", category: "", status: "draft" });
  };

  return (
    <div className="space-y-6">
      {/* Create New Product */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Product Families</CardTitle>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Product
              </Button>
            )}
          </div>
        </CardHeader>

        {isCreating && (
          <CardContent className="space-y-4 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="e.g., Harpic Toilet Cleaner"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  placeholder="e.g., Bathroom Care"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Base Recipe *</Label>
              <Select
                value={newProduct.recipeId}
                onValueChange={(value) =>
                  setNewProduct({ ...newProduct, recipeId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes?.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Create Product
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelectProduct(product)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {product.category || "Uncategorized"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              {product.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    product.status === "active" ? "default" : "secondary"
                  }
                >
                  {product.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {/* Variant count would go here */}
                  View Variants →
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !isCreating && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No products yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first product family to start managing variants
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
