// src/app/recipes/components/recipe-views/recipes-list-view.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RecipeListItem } from "@/types/recipe-types";
import { formatDate } from "@/utils/formatting-utils";
import {
  FileText,
  Package,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { getStatusColors } from "../recipe-colors";

interface RecipeListViewProps {
  recipes: RecipeListItem[];
  selectedRecipeId: string | null;
  onSelectRecipe: (recipeId: string) => void;
  onAdd: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

/**
 * Recipe list view component - Displays filterable list of recipes
 * Props: Minimal UI state only (no data fetching)
 */
export function RecipeListView({
  recipes,
  selectedRecipeId,
  onSelectRecipe,
  onAdd,
  searchTerm,
  onSearchChange,
}: RecipeListViewProps) {
  // FILTERED RECIPES
  const filteredRecipes = useMemo(() => {
    if (!searchTerm.trim()) return recipes;

    const term = searchTerm.toLowerCase();
    return recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(term) ||
        recipe.description?.toLowerCase().includes(term) ||
        recipe.status.toLowerCase().includes(term)
    );
  }, [recipes, searchTerm]);

  // RENDER
  return (
    <Card className="flex-1 flex flex-col border-none shadow-sm overflow-hidden">
      <CardContent className="p-4 flex flex-col flex-1 min-h-0">
        {/* ===== Search & Create Button ===== */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              aria-label="Search recipes"
            />
          </div>
          <Button
            onClick={onAdd}
            className="h-10 w-28 shrink-0"
            aria-label="Create new recipe"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </div>

        {/* ===== Recipe List ===== */}
        <ScrollArea className="flex-1 -mx-4 px-4">
          {filteredRecipes.length === 0 ? (
            // Empty state
            <div className="text-center py-12 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No recipes found</p>
              <p className="text-sm mt-1">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Create your first recipe to get started"}
              </p>
            </div>
          ) : (
            // Recipe cards
            <div role="listbox" aria-label="Recipe list" className="space-y-2">
              {filteredRecipes.map((recipe) => {
                const isSelected = selectedRecipeId === recipe.id;
                const statusColors = getStatusColors(recipe.status);
                const variance = recipe.varianceFromTarget || 0;
                const isOverTarget = variance > 0;

                return (
                  <button
                    key={recipe.id}
                    onClick={() => onSelectRecipe(recipe.id)}
                    role="option"
                    aria-selected={isSelected}
                    aria-label={`Recipe: ${recipe.name}, Cost: ₹${recipe.costPerKg.toFixed(2)} per kg, Status: ${recipe.status}`}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-slate-200 hover:border-blue-300 hover:shadow-sm bg-white"
                    }`}
                  >
                    {/* Recipe Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">
                          {recipe.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            className={`${statusColors.badge} text-xs border`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${statusColors.dot} mr-1`}
                            />
                            {recipe.status}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            v{recipe.version}
                          </span>
                          <span className="text-xs text-slate-500">
                            • updated{" "}
                            {formatDate(recipe.updatedAt || recipe.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-slate-500 text-right">
                          Cost/kg
                        </p>
                        <p className="text-lg font-bold text-slate-900 whitespace-nowrap">
                          ₹{recipe.costPerKg.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Recipe Stats */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {recipe.ingredientCount}
                          <span className="text-slate-500">ingredients</span>
                        </span>
                        {recipe.variantCount > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {recipe.variantCount}
                            <span className="text-slate-500">variants</span>
                          </span>
                        )}
                      </div>

                      {recipe.targetCostPerKg && (
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Variance</p>
                          <div
                            className={`text-sm font-semibold flex items-center gap-1 ${
                              isOverTarget ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {isOverTarget ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            ₹{Math.abs(variance).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* ===== Results Summary ===== */}
        {searchTerm && (
          <div className="pt-3 border-t mt-2 text-xs text-slate-500 text-center">
            Showing {filteredRecipes.length} of {recipes.length} recipes
          </div>
        )}
      </CardContent>
    </Card>
  );
}
