"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { SortableTable } from "@/components/ui/sortable-table";
import { Search, Filter, Edit, Trash2, Plus } from "lucide-react";
import type { Recipe } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface RecipeTableProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function RecipeTable({
  recipes,
  onEdit,
  onDelete,
  onAdd,
}: RecipeTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  // Get unique statuses from the data
  const statuses = Array.from(new Set(recipes.map((r) => r.status)));

  // Filter recipes using enriched data
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" || recipe.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [recipes, searchTerm, selectedStatus]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
  };

  // Initiate delete
  const initiateDelete = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (recipeToDelete) {
      onDelete(recipeToDelete.id);
      setDeleteConfirmOpen(false);
      setRecipeToDelete(null);
    }
  };

  // Helper function to format currency
  const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Recipe Name",
        sortable: true,
        render: (value: string) => (
          <span className="font-medium text-foreground">{value}</span>
        ),
      },
      {
        key: "ingredientsCount",
        label: "Ingredients",
        sortable: true,
        render: (value: number) => (
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary hover:bg-primary/20"
          >
            {value}
          </Badge>
        ),
      },
      {
        key: "costPerKg",
        label: "Cost per kg",
        sortable: true,
        render: (value: number | undefined) => (
          <span className="text-foreground font-medium">
            {formatCurrency(value || 0)}
          </span>
        ),
      },
      {
        key: "targetProfitMargin",
        label: "Target Margin",
        sortable: true,
        render: (value: number | undefined) => (
          <span className="text-green-600 font-medium">
            {(value || 0).toFixed(1)}%
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (value: "draft" | "active" | "discontinued") => (
          <Badge
            variant={
              value === "active"
                ? "default"
                : value === "draft"
                ? "secondary"
                : "destructive"
            }
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        label: "Date Created",
        sortable: true,
        render: (value: string) => (
          <span className="text-muted-foreground">{formatDate(value)}</span>
        ),
      },
      {
        key: "updatedAt",
        label: "Date Updated",
        sortable: true,
        render: (value: string | undefined) => (
          <span className="text-muted-foreground">
            {value ? formatDate(value) : "-"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_: any, row: Recipe & { ingredientsCount: number }) => (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row)}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => initiateDelete(row)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <>
      <Card className="card-enhanced">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="pb-1.5">Product Recipes</CardTitle>
              <CardDescription>
                {recipes.length} recipes from {statuses.length} status types
              </CardDescription>
            </div>
            <Button variant="default" onClick={onAdd} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col pb-2 sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipes by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus-enhanced"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px] focus-enhanced">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          <SortableTable
            data={filteredRecipes.map((r) => ({
              ...r,
              ingredientsCount: r.ingredients.length,
            }))}
            columns={columns}
            className="table-enhanced"
            showSerialNumber={true}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {recipeToDelete?.name}?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
