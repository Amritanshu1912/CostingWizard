// src/app/recipes/components/recipe-views/recipes-tab.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRecipeList } from "@/hooks/recipe-hooks/use-recipe-data";
import { useRecipeOperations } from "@/hooks/recipe-hooks/use-recipe-operations";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { RecipeDetailView } from "./recipe-detail-view";
import { RecipeListView } from "./recipe-list-view";

/**
 * Main recipes tab component - Orchestrates recipe list and detail views
 * Data: Fetched by child components via hooks (no props drilling)
 */
export function RecipesTab() {
  // STATE - UI Orchestration Only
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // DATA & OPERATIONS
  const recipes = useRecipeList(); // Minimal list data only
  const { deleteRecipe } = useRecipeOperations();

  // AUTO-SELECT FIRST RECIPE ON MOUNT
  useEffect(() => {
    if (!selectedRecipeId && recipes.length > 0 && !isCreatingNew) {
      setSelectedRecipeId(recipes[0].id);
    }
  }, [recipes, selectedRecipeId, isCreatingNew]);

  // HANDLERS - Recipe Selection
  const handleSelectRecipe = useCallback((recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setIsCreatingNew(false);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // HANDLERS - Create New Recipe
  const handleAddNew = useCallback(() => {
    setIsCreatingNew(true);
    setSelectedRecipeId(null);
    toast.info("Create new recipe in the detail panel");
  }, []);

  const handleCancelCreate = useCallback(() => {
    setIsCreatingNew(false);
    // Restore selection to first recipe
    if (recipes.length > 0) {
      setSelectedRecipeId(recipes[0].id);
    }
  }, [recipes]);

  const handleCreateSuccess = useCallback((newRecipeId: string) => {
    setSelectedRecipeId(newRecipeId);
    setIsCreatingNew(false);
  }, []);

  // HANDLERS - Delete Recipe
  const handleDeleteRequest = useCallback(() => {
    if (!selectedRecipeId) return;
    setDeleteConfirmOpen(true);
  }, [selectedRecipeId]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedRecipeId) return;

    try {
      await deleteRecipe(selectedRecipeId);

      // Select another recipe after deletion
      const remainingRecipes = recipes.filter((r) => r.id !== selectedRecipeId);
      setSelectedRecipeId(
        remainingRecipes.length > 0 ? remainingRecipes[0].id : null
      );
    } catch (error) {
      console.error("Delete recipe error:", error);
      toast.error("Failed to delete recipe");
    } finally {
      setDeleteConfirmOpen(false);
    }
  }, [selectedRecipeId, recipes, deleteRecipe]);

  // RENDER

  return (
    <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
      {/* ===== LEFT: Recipe List ===== */}
      <div className="col-span-4 flex flex-col">
        <RecipeListView
          recipes={recipes}
          selectedRecipeId={selectedRecipeId}
          onSelectRecipe={handleSelectRecipe}
          onAdd={handleAddNew}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      </div>

      {/* ===== RIGHT: Recipe Detail ===== */}
      <div className="col-span-8 flex flex-col">
        <RecipeDetailView
          recipeId={selectedRecipeId}
          isCreatingNew={isCreatingNew}
          onDelete={handleDeleteRequest}
          onCancelCreate={handleCancelCreate}
          onCreateSuccess={handleCreateSuccess}
        />
      </div>
      {/* ===== Delete Confirmation Dialog ===== */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recipe? This action cannot be
              undone and will also delete all associated ingredients and
              variants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
