"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Eye,
  Trash2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type { RecipeVariant, Recipe } from "@/lib/types";
import { useDexieTable } from "@/hooks/use-dexie-table";
import { db } from "@/lib/db";

type EnrichedRecipeVariant = RecipeVariant & { originalRecipe?: Recipe };

interface RecipeVariantsProps {
  recipes: Recipe[];
}

export function RecipeVariants({ recipes }: RecipeVariantsProps) {
  const { data: variants, deleteItem } = useDexieTable<RecipeVariant>(
    db.recipeVariants,
    []
  );

  const [selectedVariant, setSelectedVariant] =
    useState<EnrichedRecipeVariant | null>(null);

  // Enrich variants with original recipe data
  const enrichedVariants = useMemo(() => {
    return variants.map((variant) => {
      const originalRecipe = recipes.find(
        (r) => r.id === variant.originalRecipeId
      );
      return {
        ...variant,
        originalRecipe,
      } as EnrichedRecipeVariant;
    });
  }, [variants, recipes]);

  const handleDeleteVariant = async (id: string) => {
    try {
      await deleteItem(id);
      toast.success("Variant deleted successfully");
    } catch (error) {
      toast.error("Failed to delete variant");
      console.error(error);
    }
  };

  const handleViewVariant = (variant: EnrichedRecipeVariant) => {
    setSelectedVariant(variant);
  };

  if (variants.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No recipe variants saved yet. Use the Recipe Optimizer to create and
          save variants.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">
            Total Variants
          </div>
          <div className="text-2xl font-bold text-foreground">
            {variants.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">
            Active Variants
          </div>
          <div className="text-2xl font-bold text-green-600">
            {variants.filter((v) => v.isActive).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Avg Savings</div>
          <div className="text-2xl font-bold text-primary">
            {variants.length > 0
              ? (
                  variants.reduce(
                    (sum, v) => sum + Math.abs(v.costDifference),
                    0
                  ) / variants.length
                ).toFixed(2)
              : "0.00"}
            %
          </div>
        </Card>
      </div>

      {/* Variants Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-12">#</TableHead>
              <TableHead className="min-w-[200px]">Variant Name</TableHead>
              <TableHead className="min-w-[150px]">Original Recipe</TableHead>
              <TableHead className="w-24 text-right">Cost/kg</TableHead>
              <TableHead className="w-32 text-right">Difference</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrichedVariants.map((variant, index) => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="font-medium">{variant.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {variant.optimizationGoal?.replace("_", " ")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {variant.originalRecipe?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {variant.originalRecipeId}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{variant.costPerKg.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className={`flex items-center justify-end gap-1 ${
                      variant.costDifference < 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {variant.costDifference < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    <span className="font-medium">
                      {variant.costDifference > 0 ? "+" : ""}₹
                      {Math.abs(variant.costDifference).toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={`text-xs ${
                      variant.costDifferencePercentage < 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ({variant.costDifferencePercentage > 0 ? "+" : ""}
                    {variant.costDifferencePercentage.toFixed(1)}%)
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={variant.isActive ? "default" : "secondary"}>
                    {variant.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewVariant(variant)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVariant(variant.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Variant Details Modal/Dialog */}
      {selectedVariant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedVariant.name}</CardTitle>
              <CardDescription>
                Variant of
                {selectedVariant.originalRecipe?.name || "Unknown Recipe"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Cost per kg
                  </div>
                  <div className="text-2xl font-bold">
                    ₹{selectedVariant.costPerKg.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Cost Difference
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      selectedVariant.costDifference < 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedVariant.costDifference > 0 ? "+" : ""}₹
                    {Math.abs(selectedVariant.costDifference).toFixed(2)}
                  </div>
                </div>
              </div>

              {selectedVariant.notes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Notes
                  </div>
                  <p className="text-sm">{selectedVariant.notes}</p>
                </div>
              )}

              {selectedVariant.changes &&
                selectedVariant.changes.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Changes Made
                    </div>
                    <div className="space-y-2">
                      {selectedVariant.changes.map((change, idx) => (
                        <div
                          key={idx}
                          className="text-sm p-2 bg-muted/30 rounded"
                        >
                          <strong>{change.type.replace("_", " ")}:</strong>{" "}
                          {change.ingredientName}
                          {change.oldValue &&
                            ` (from ${change.oldValue} to ${change.newValue})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedVariant(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
