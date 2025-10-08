"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Minus, Plus, Target, TrendingUp, Package, Zap } from "lucide-react";
import {
  Material,
  ProductIngredient,
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
  materials: Material[];
  selectedMaterial: string;
  quantity: number;
  onMaterialChange: (materialId: string) => void;
  onQuantityChange: (quantity: number) => void;
  onAddIngredient: () => void;
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
                  {material.name} - ₹{material.pricePerKg}/kg
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
  ingredients: ProductIngredient[];
  onRemoveIngredient: (index: number) => void;
}

export function IngredientsTable({
  ingredients,
  onRemoveIngredient,
}: IngredientsTableProps) {
  if (ingredients.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-foreground">Formula Composition</h4>
      <div className="overflow-x-auto">
        <Table className="table-enhanced">
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground font-medium">#</TableHead>
              <TableHead className="text-foreground font-medium">
                Material
              </TableHead>
              <TableHead className="text-foreground font-medium">
                Qty (kg)
              </TableHead>
              <TableHead className="text-foreground font-medium">
                Price/kg
              </TableHead>
              <TableHead className="text-foreground font-medium">
                Total
              </TableHead>
              <TableHead className="text-foreground font-medium">%</TableHead>
              <TableHead className="text-foreground font-medium">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ingredient, index) => (
              <TableRow key={index} className="hover:bg-muted/30">
                <TableCell className="text-muted-foreground font-medium">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {ingredient.materialName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {ingredient.quantity.toFixed(3)}
                </TableCell>
                <TableCell className="text-foreground">
                  ₹{ingredient.costPerKg.toFixed(2)}
                </TableCell>
                <TableCell className="text-foreground font-medium">
                  ₹{ingredient.totalCost.toFixed(2)}
                </TableCell>
                <TableCell className="text-accent font-medium">
                  {(ingredient.percentage || 0).toFixed(1)}%
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveIngredient(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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
          Add ingredients to your formula to get AI-powered optimization
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
    <div className="overflow-x-auto">
      <Table className="table-enhanced">
        <TableHeader>
          <TableRow>
            <TableHead className="text-foreground font-medium">#</TableHead>
            <TableHead className="text-foreground font-medium">
              Scenario
            </TableHead>
            <TableHead className="text-foreground font-medium">
              Batch Size
            </TableHead>
            <TableHead className="text-foreground font-medium">
              Total Cost
            </TableHead>
            <TableHead className="text-foreground font-medium">
              Cost/kg
            </TableHead>
            <TableHead className="text-foreground font-medium">
              Margin
            </TableHead>
            <TableHead className="text-foreground font-medium">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scenarios.map((scenario, index) => (
            <TableRow key={index} className="hover:bg-muted/30">
              <TableCell className="text-muted-foreground font-medium">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {scenario.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {scenario.batchSize}kg
              </TableCell>
              <TableCell className="text-foreground">
                ₹{scenario.totalCost.toFixed(2)}
              </TableCell>
              <TableCell className="text-foreground">
                ₹{scenario.costPerKg.toFixed(2)}
              </TableCell>
              <TableCell className="text-accent font-medium">
                {scenario.margin.toFixed(1)}%
              </TableCell>
              <TableCell className="text-foreground">
                ₹{scenario.price.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================================
// BATCH PLANNING
// ============================================================================

interface BatchPlanningProps {
  batchSize: number;
  onBatchSizeChange: (size: number) => void;
}

export function BatchPlanning({
  batchSize,
  onBatchSizeChange,
}: BatchPlanningProps) {
  const productionMetrics = getProductionMetrics(batchSize);
  const economiesOfScale = getEconomiesOfScale(batchSize);
  const storageRequired = getStorageRequired(batchSize);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Size Optimizer */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">
            Batch Size Optimization
          </h4>
          <div className="space-y-3">
            <div>
              <Label className="text-foreground">Target Batch Size (kg)</Label>
              <Slider
                value={[batchSize]}
                onValueChange={(value) => onBatchSizeChange(value[0])}
                max={1000}
                min={10}
                step={10}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>10kg</span>
                <span>{batchSize}kg</span>
                <span>1000kg</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard
                label="Economies of Scale"
                value={economiesOfScale}
                subtitle=""
                valueColor="text-accent"
              />
              <MetricCard
                label="Storage Required"
                value={`${storageRequired} containers`}
                subtitle=""
              />
            </div>
          </div>
        </div>

        {/* Production Metrics */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Production Metrics</h4>
          <div className="space-y-3">
            {productionMetrics.map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {metric.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metric.status}
                  </div>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Batch Recommendations */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">
          Batch Size Recommendations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BATCH_RECOMMENDATIONS.map((rec, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onBatchSizeChange(rec.size)}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-foreground">{rec.label}</h5>
                <Badge
                  variant={rec.size === batchSize ? "default" : "outline"}
                  className="text-xs"
                >
                  {rec.size}kg
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {rec.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Efficiency</span>
                  <span className="text-foreground">{rec.efficiency}%</span>
                </div>
                <Progress value={rec.efficiency} className="h-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
