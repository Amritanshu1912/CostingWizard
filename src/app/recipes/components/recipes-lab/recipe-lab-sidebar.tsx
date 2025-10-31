// components/recipes/recipe-lab/recipe-lab-sidebar.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlaskConical, RotateCcw } from "lucide-react";
import type { RecipeDisplay, RecipeVariant } from "@/lib/types";

interface RecipeLabSidebarProps {
  recipes: RecipeDisplay[];
  selectedRecipeId: string;
  variants: (RecipeVariant & {
    costPerKg: number;
    costDifference: number;
    costDifferencePercentage: number;
  })[];
  changeCount: number;
  onSelectRecipe: (recipeId: string) => void;
  onLoadVariant: (variantName: string, ingredientIds: string[]) => void;
  onCompareVariant: (variantId: string) => void;
  onResetAll: () => void;
}

export function RecipeLabSidebar({
  recipes,
  selectedRecipeId,
  variants,
  changeCount,
  onSelectRecipe,
  onLoadVariant,
  onCompareVariant,
  onResetAll,
}: RecipeLabSidebarProps) {
  return (
    <Card className="w-80 flex flex-col py-2">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-blue-600" />
          Recipe Lab
        </h3>
      </div>

      <ScrollArea className="flex-1 p-4">
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
                      {/* <span className="text-xs text-muted-foreground ml-2">
                        ₹{recipe.costPerKg.toFixed(2)}/kg
                      </span> */}
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
                  <Card key={variant.id} className="p-3">
                    <div className="flex items-start justify-between mb-2">
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
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={() =>
                          onLoadVariant(variant.name, variant.ingredientIds)
                        }
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={() => onCompareVariant(variant.id)}
                      >
                        Compare
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={onResetAll}
          disabled={changeCount === 0}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Changes ({changeCount})
        </Button>
      </div>
    </Card>
  );
}
