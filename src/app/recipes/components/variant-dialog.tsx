// variant-dialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { Recipe, RecipeVariant, RecipeIngredient } from "@/lib/types";
import { toast } from "sonner";

interface VariantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variant: RecipeVariant) => void;
  originalRecipe: Recipe;
  modifiedIngredients: RecipeIngredient[];
  costSavings: { amount: number; percentage: number };
  modifiedCostPerKg: number;
}

export function VariantDialog({
  isOpen,
  onClose,
  onSave,
  originalRecipe,
  modifiedIngredients,
  costSavings,
  modifiedCostPerKg,
}: VariantDialogProps) {
  const [name, setName] = useState(`${originalRecipe.name} - Optimized`);
  const [description, setDescription] = useState("");
  const [optimizationGoal, setOptimizationGoal] =
    useState<RecipeVariant["optimizationGoal"]>("cost_reduction");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a variant name");
      return;
    }

    const variant: RecipeVariant = {
      id: Date.now().toString(),
      originalRecipeId: originalRecipe.id,
      name: name.trim(),
      description: description.trim() || undefined,
      ingredients: modifiedIngredients,
      costPerKg: modifiedCostPerKg,
      costDifference: costSavings.amount,
      costDifferencePercentage: costSavings.percentage,
      optimizationGoal,
      isActive: true,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSave(variant);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save Recipe Variant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Variant Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Cost-Optimized Version"
            />
          </div>

          <div>
            <Label>Optimization Goal</Label>
            <Select
              value={optimizationGoal}
              onValueChange={(v: any) => setOptimizationGoal(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cost_reduction">Cost Reduction</SelectItem>
                <SelectItem value="quality_improvement">
                  Quality Improvement
                </SelectItem>
                <SelectItem value="supplier_diversification">
                  Supplier Diversification
                </SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What changes were made and why?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Original Cost</div>
              <div className="text-lg font-bold">
                ₹{originalRecipe.costPerKg.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">New Cost</div>
              <div className="text-lg font-bold text-primary">
                ₹{modifiedCostPerKg.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Savings</div>
              <div className="text-lg font-bold text-green-600">
                ₹{costSavings.amount.toFixed(2)} (
                {costSavings.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save Variant
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
