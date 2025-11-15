"use client";

import { useState, useEffect } from "react";
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
import { Check, X, Trash2 } from "lucide-react";
import { useEnrichedRecipes, useRecipeVariants } from "@/hooks/use-recipes";
import type { Product } from "@/lib/types";

interface ProductFormProps {
  initialProduct?: Product;
  onSave: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function ProductForm({
  initialProduct,
  onSave,
  onCancel,
  onDelete,
}: ProductFormProps) {
  const recipes = useEnrichedRecipes();

  const [formData, setFormData] = useState({
    name: initialProduct?.name || "",
    description: initialProduct?.description || "",
    status: initialProduct?.status || ("draft" as Product["status"]),
    recipeId: initialProduct?.recipeId || "",
    isRecipeVariant: initialProduct?.isRecipeVariant || false,
  });

  // Track which base recipe is selected (for fetching variants)
  const [baseRecipeId, setBaseRecipeId] = useState<string>(() => {
    if (!initialProduct) return "";
    return initialProduct.isRecipeVariant
      ? "" // Will be set after variants load
      : initialProduct.recipeId;
  });

  const variants = useRecipeVariants(baseRecipeId || null);

  // Initialize baseRecipeId for variants on mount
  useEffect(() => {
    if (initialProduct?.isRecipeVariant && variants.length > 0) {
      const variant = variants.find((v) => v.id === initialProduct.recipeId);
      if (variant) {
        setBaseRecipeId(variant.originalRecipeId);
      }
    }
  }, [initialProduct, variants]);

  const handleRecipeChange = (recipeId: string) => {
    setBaseRecipeId(recipeId);
    setFormData({
      ...formData,
      recipeId,
      isRecipeVariant: false,
    });
  };

  const handleVariantChange = (variantValue: string) => {
    if (!baseRecipeId) return;

    if (variantValue === "original") {
      setFormData({
        ...formData,
        recipeId: baseRecipeId,
        isRecipeVariant: false,
      });
    } else {
      setFormData({
        ...formData,
        recipeId: variantValue,
        isRecipeVariant: true,
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Product name is required");
      return;
    }
    if (!formData.recipeId) {
      alert("Please select a recipe");
      return;
    }

    onSave({
      name: formData.name,
      description: formData.description,
      status: formData.status,
      recipeId: formData.recipeId,
      isRecipeVariant: formData.isRecipeVariant,
    });
  };

  const currentVariantValue = formData.isRecipeVariant
    ? formData.recipeId
    : "original";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 space-y-2">
          <Label className="text-xs">Product Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Harpic Toilet Cleaner"
            className="h-8"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value as Product["status"] })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recipe Selection */}
      <div className="space-y-2">
        <Label className="text-xs">Base Recipe *</Label>
        <Select value={baseRecipeId} onValueChange={handleRecipeChange}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select recipe" />
          </SelectTrigger>
          <SelectContent>
            {recipes.map((recipe) => (
              <SelectItem key={recipe.id} value={recipe.id}>
                {recipe.name}
                <span className="text-xs text-muted-foreground ml-2">
                  (₹{recipe.costPerKg.toFixed(2)}/kg)
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Recipe Variant Selection (if variants exist) */}
      {baseRecipeId && variants.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs">Recipe Version (Optional)</Label>
          <Select
            value={currentVariantValue}
            onValueChange={handleVariantChange}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="original">
                Original Recipe
                <span className="text-xs text-muted-foreground ml-2">
                  (Base formulation)
                </span>
              </SelectItem>
              {variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.name}
                  <span className="text-xs text-muted-foreground ml-2">
                    (₹{variant.costPerKg.toFixed(2)}/kg,{" "}
                    {variant.costDifferencePercentage > 0 ? "+" : ""}
                    {variant.costDifferencePercentage.toFixed(1)}%)
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Product description..."
          rows={2}
          className="text-sm"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} size="sm" className="flex-1 h-8">
          <Check className="h-3 w-3 mr-1" />
          {initialProduct ? "Update" : "Create"}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="flex-1 h-8"
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
        {initialProduct && onDelete && (
          <Button
            onClick={onDelete}
            variant="destructive"
            size="sm"
            className="h-8 px-2"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
