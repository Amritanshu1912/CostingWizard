// src/app/recipes/components/recipes-lab/recipe-lab-sidebar.tsx
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  RecipeListItem,
  RecipeVariantWithMetrics,
} from "@/types/recipe-types";
import { FlaskConical } from "lucide-react";

interface RecipeLabSidebarProps {
  recipes: RecipeListItem[];
  selectedRecipeId: string;
  variants: RecipeVariantWithMetrics[];
  loadedVariantName?: string | null;
  onSelectRecipe: (recipeId: string) => void;
  onLoadVariant: (variant: RecipeVariantWithMetrics) => void;
}

/**
 * Recipe Lab Sidebar Component
 * Props: Minimal UI state only (no data fetching)
 */
export function RecipeLabSidebar({
  recipes,
  selectedRecipeId,
  variants,
  loadedVariantName,
  onSelectRecipe,
  onLoadVariant,
}: RecipeLabSidebarProps) {
  return (
    <Card className="w-80 flex flex-col py-2">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-blue-600" />
          Recipe Lab
        </h3>
      </div>

      <ScrollArea className="flex-1 p-4 min-h-0">
        <div className="space-y-6">
          {/* Recipe Selector */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2">
              Base Recipe
            </Label>
            <Select value={selectedRecipeId} onValueChange={onSelectRecipe}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    <div className="flex items-center justify-between w-full min-w-[200px]">
                      <span className="truncate">{recipe.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Saved Variants */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2">
              Saved Variants ({variants.length})
            </Label>
            <div className="space-y-2">
              {variants.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No variants yet
                </p>
              ) : (
                variants.map((variant) => (
                  <Card
                    key={variant.id}
                    className={`p-3 cursor-pointer hover:border-blue-300 transition-colors ${
                      variant.name === loadedVariantName
                        ? "border-2 border-blue-500 bg-blue-50"
                        : ""
                    }`}
                    onClick={() => onLoadVariant(variant)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {variant.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {variant.optimizationGoal?.replace("_", " ")}
                        </p>
                      </div>
                      <Badge
                        variant={variant.isActive ? "default" : "secondary"}
                        className="text-xs ml-2 flex-shrink-0"
                      >
                        {variant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {/* Cost Difference */}
                    {variant.costDifference !== undefined && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Cost Impact
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            variant.costDifference < 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {variant.costDifference < 0 ? "-" : "+"}₹
                          {Math.abs(variant.costDifference).toFixed(2)}/kg
                          <span className="text-xs ml-1">
                            (
                            {Math.abs(variant.costDifferencePercentage).toFixed(
                              1
                            )}
                            %)
                          </span>
                        </p>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
