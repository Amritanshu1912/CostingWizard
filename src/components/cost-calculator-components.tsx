"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableTable } from "@/components/ui/sortable-table";
import { Slider } from "@/components/ui/slider";
import { Minus, Plus, Target, TrendingUp, Package, Zap } from "lucide-react";
import {
  Material,
  SupplierMaterial,
  RecipeIngredient,
  OptimizationSuggestion,
  ScenarioData,
} from "@/lib/types";
import {
  BATCH_RECOMMENDATIONS,
  getProductionMetrics,
  getEconomiesOfScale,
  getStorageRequired,
} from "@/lib/calculator-constants";

// ============================================================================
// INGREDIENT FORM
// ============================================================================

interface IngredientFormProps {
  materials: SupplierMaterial[];
  selectedMaterial: string;
  quantity: number;
  onMaterialChange: (materialId: string) => void;
  onQuantityChange: (quantity: number) => void;
  onAddIngredient: () => void;
}

interface ProductIngredient {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  costPerKg: number;
  totalCost: number;
  percentage: number;
}

export function IngredientForm({
  materials,
  selectedMaterial,
  quantity,
  onMaterialChange,
  onQuantityChange,
  onAddIngredient,
}: IngredientFormProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-foreground">Add Ingredients</h4>
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Label className="text-foreground">Material</Label>
          <Select value={selectedMaterial} onValueChange={onMaterialChange}>
            <SelectTrigger className="focus-enhanced">
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {materials.map((material) => (
                <SelectItem key={material.id} value={material.id}>
                  {material.id} - ₹{material.unitPrice}/{material.unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-32">
          <Label className="text-foreground">Quantity (kg)</Label>
          <Input
            type="number"
            step="0.001"
            min="0"
            value={quantity || ""}
            onChange={(e) =>
              onQuantityChange(Math.max(0, Number(e.target.value) || 0))
            }
            placeholder="0.000"
            className="focus-enhanced"
          />
        </div>
        <Button
          onClick={onAddIngredient}
          className="btn-secondary w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2 sm:mr-0" />
          <span className="sm:hidden">Add Ingredient</span>
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// INGREDIENTS TABLE
// ============================================================================

interface IngredientsTableProps {
  ingredients: any[]; // Using any for now to avoid type conflicts
  onRemoveIngredient: (index: number) => void;
}

export function IngredientsTable({
  ingredients,
  onRemoveIngredient,
}: IngredientsTableProps) {
  if (ingredients.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-foreground">Recipe Composition</h4>
      <SortableTable
        data={ingredients}
        columns={[
          {
            key: "displayName",
            label: "Material",
            sortable: true,
            render: (value: string) => (
              <span className="font-medium text-foreground">{value}</span>
            ),
          },
          {
            key: "displayQuantity",
            label: "Qty",
            sortable: true,
            render: (value: string) => (
              <span className="text-muted-foreground">{value}</span>
            ),
          },
          {
            key: "costPerKg",
            label: "Price/kg",
            sortable: true,
            render: (value: number) => (
              <span className="text-foreground">₹{value.toFixed(2)}</span>
            ),
          },
          {
            key: "displayCost",
            label: "Total",
            sortable: true,
            render: (value: string) => (
              <span className="text-foreground font-medium">{value}</span>
            ),
          },
          {
            key: "percentage",
            label: "%",
            sortable: true,
            render: (value: number) => (
              <span className="text-accent font-medium">
                {(value || 0).toFixed(1)}%
              </span>
            ),
          },
          {
            key: "actions",
            label: "Action",
            sortable: false,
            render: (value: any, row: any) => {
              const index = ingredients.indexOf(row);
              return (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveIngredient(index)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Minus className="h-3 w-3" />
                </Button>
              );
            },
          },
        ]}
        className="table-enhanced"
        showSerialNumber={true}
      />
    </div>
  );
}

// ============================================================================
// COST ANALYSIS CARD
// ============================================================================

interface CostAnalysisProps {
  totalCost: number;
  costPerKg: number;
  suggestedPrice: number;
  actualMargin: number;
  batchSize: number;
  targetMargin: number;
  hasIngredients: boolean;
  onGenerateScenarios: () => void;
  optimizationEnabled: boolean;
  onOptimizationToggle: (enabled: boolean) => void;
}

export function CostAnalysis({
  totalCost,
  costPerKg,
  suggestedPrice,
  actualMargin,
  batchSize,
  targetMargin,
  hasIngredients,
  onGenerateScenarios,
  optimizationEnabled,
  onOptimizationToggle,
}: CostAnalysisProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <MetricCard
          label="Total Cost"
          value={`₹${totalCost.toFixed(2)}`}
          subtitle={`for ${batchSize}kg batch`}
        />
        <MetricCard
          label="Cost per kg"
          value={`₹${costPerKg.toFixed(2)}`}
          subtitle="manufacturing cost"
        />
        <MetricCard
          label="Suggested Price"
          value={`₹${suggestedPrice.toFixed(2)}`}
          subtitle={`for ${targetMargin}% margin`}
          valueColor="text-accent"
        />
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="text-sm text-muted-foreground">Actual Margin</div>
          <div className="text-2xl font-bold text-accent">
            {actualMargin.toFixed(1)}%
          </div>
          <Progress
            value={Math.min(100, Math.max(0, actualMargin))}
            className="h-2 mt-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Button
          onClick={onGenerateScenarios}
          className="w-full btn-secondary"
          disabled={!hasIngredients}
        >
          <Target className="h-4 w-4 mr-2" />
          Generate Scenarios
        </Button>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  subtitle: string;
  valueColor?: string;
}

function MetricCard({
  label,
  value,
  subtitle,
  valueColor = "text-foreground",
}: MetricCardProps) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}

// ============================================================================
// OPTIMIZATION SUGGESTIONS
// ============================================================================

interface OptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[];
}

export function OptimizationSuggestions({
  suggestions,
}: OptimizationSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No Optimization Suggestions
        </h3>
        <p className="text-muted-foreground">
          Add ingredients to your recipe to get AI-powered optimization
          suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="p-4 rounded-lg bg-muted/30 border border-border/50"
        >
          <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                <h4 className="font-medium text-foreground">
                  {suggestion.title}
                </h4>
                <Badge
                  variant={
                    suggestion.impact === "high"
                      ? "default"
                      : suggestion.impact === "medium"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-xs"
                >
                  {suggestion.impact} impact
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {suggestion.description}
              </p>
            </div>
            <div className="text-right">
              <div className="font-medium text-accent">
                ₹{suggestion.savings.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                potential savings
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="text-xs text-muted-foreground">
                {suggestion.confidence}% confidence
              </div>
              <Progress value={suggestion.confidence} className="h-1 w-20" />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-transparent"
            >
              Apply Suggestion
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SCENARIO COMPARISON
// ============================================================================

interface ScenarioComparisonProps {
  scenarios: ScenarioData[];
}

export function ScenarioComparison({ scenarios }: ScenarioComparisonProps) {
  if (scenarios.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No Scenarios Generated
        </h3>
        <p className="text-muted-foreground">
          Add ingredients and click "Generate Scenarios" to see different cost
          scenarios.
        </p>
      </div>
    );
  }

  return (
    <SortableTable
      data={scenarios}
      columns={[
        {
          key: "name",
          label: "Scenario",
          sortable: true,
          render: (value: string) => (
            <span className="font-medium text-foreground">{value}</span>
          ),
        },
        {
          key: "batchSize",
          label: "Batch Size",
          sortable: true,
          render: (value: number) => (
            <span className="text-muted-foreground">{value}kg</span>
          ),
        },
        {
          key: "totalCost",
          label: "Total Cost",
          sortable: true,
          render: (value: number) => (
            <span className="text-foreground">₹{value.toFixed(2)}</span>
          ),
        },
        {
          key: "costPerKg",
          label: "Cost/kg",
          sortable: true,
          render: (value: number) => (
            <span className="text-foreground">₹{value.toFixed(2)}</span>
          ),
        },
        {
          key: "margin",
          label: "Margin",
          sortable: true,
          render: (value: number) => (
            <span className="text-accent font-medium">{value.toFixed(1)}%</span>
          ),
        },
        {
          key: "price",
          label: "Price",
          sortable: true,
          render: (value: number) => (
            <span className="text-foreground">₹{value.toFixed(2)}</span>
          ),
        },
      ]}
      className="table-enhanced"
      showSerialNumber={true}
    />
  );
}
