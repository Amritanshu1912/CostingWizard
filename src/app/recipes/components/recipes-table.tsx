// RecipeTable.tsx - REFACTORED

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
  AlertDialogDescription,
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

  const statuses = Array.from(new Set(recipes.map((r) => r.status)));

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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
  };

  const initiateDelete = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (recipeToDelete) {
      onDelete(recipeToDelete.id);
      setDeleteConfirmOpen(false);
      setRecipeToDelete(null);
    }
  };

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
        key: "ingredientCount",
        label: "Ingredients",
        sortable: true,
        render: (value: number) => (
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {value}
          </Badge>
        ),
      },
      {
        key: "costPerKg",
        label: "Cost/kg",
        sortable: true,
        render: (value: number) => (
          <span className="font-medium text-foreground">
            ₹{value.toFixed(2)}
          </span>
        ),
      },
      {
        key: "targetCostPerKg",
        label: "Target Cost/kg",
        sortable: true,
        render: (value: number | undefined) => (
          <span className="text-muted-foreground">
            {value ? `₹${value.toFixed(2)}` : "-"}
          </span>
        ),
      },
      {
        key: "variance",
        label: "Variance",
        sortable: true,
        render: (value: number | null, row: any) => {
          if (value === null)
            return <span className="text-muted-foreground">-</span>;
          const isGood = value <= 0;
          return (
            <span
              className={
                isGood
                  ? "text-green-600 font-medium"
                  : "text-red-600 font-medium"
              }
            >
              {value > 0 ? "+" : ""}
              {value.toFixed(1)}%
            </span>
          );
        },
      },
      {
        key: "productionTime",
        label: "Production Time",
        sortable: true,
        render: (value: number | undefined) => (
          <span className="text-muted-foreground">
            {value ? `${value} min` : "-"}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (value: Recipe["status"]) => (
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
        label: "Created",
        sortable: true,
        render: (value: string) => (
          <span className="text-muted-foreground text-sm">
            {formatDate(value)}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (
          _: any,
          row: Recipe & { ingredientCount: number; variance: number | null }
        ) => (
          <div className="flex gap-2">
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
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  const tableData = useMemo(() => {
    return filteredRecipes.map((recipe) => {
      const variance = recipe.targetCostPerKg
        ? ((recipe.costPerKg - recipe.targetCostPerKg) /
            recipe.targetCostPerKg) *
          100
        : null;

      return {
        ...recipe,
        ingredientCount: recipe.ingredients.length,
        variance,
      };
    });
  }, [filteredRecipes]);

  return (
    <>
      <Card className="card-enhanced">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recipe Formulations</CardTitle>
              <CardDescription>
                {recipes.length} recipes • {statuses.length} status types
              </CardDescription>
            </div>
            <Button variant="default" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          <SortableTable
            data={tableData}
            columns={columns}
            showSerialNumber={true}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{recipeToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
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
