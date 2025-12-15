// src/app/recipes/components/recipe-views/recipes-view-charts.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { RecipeIngredientDetail } from "@/types/recipe-types";
import {
  CHART_COLOR_SCHEMES,
  formatChartPercentage,
  sortChartDataByValue,
} from "@/utils/chart-utils";
import {
  convertToBaseUnit,
  formatQuantity,
} from "@/utils/unit-conversion-utils";
import {
  formatINR,
  formatQuantity as formatQuantityUtil,
  truncateText,
} from "@/utils/formatting-utils";
import { DollarSign, Package } from "lucide-react";
import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";

interface RecipeDistributionChartProps {
  ingredients: RecipeIngredientDetail[];
  type: "cost" | "weight";
}

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
  supplier: string;
  displayValue?: string;
  color: string;
}

/**
 * Generic distribution chart component for recipes
 * Handles both cost and weight distribution charts with shared logic
 */
function RecipeDistributionChart({
  ingredients,
  type,
}: RecipeDistributionChartProps) {
  const {
    chartData,
    chartConfig,
    title,
    icon: Icon,
    iconColor,
    emptyMessage,
    EmptyIcon,
    tooltipValueFormatter,
  } = useMemo(() => {
    if (!ingredients.length) {
      return {
        chartData: [],
        chartConfig: {},
        title: type === "cost" ? "Cost Distribution" : "Weight Distribution",
        icon: type === "cost" ? DollarSign : Package,
        iconColor: type === "cost" ? "text-blue-600" : "text-green-600",
        emptyMessage:
          type === "cost"
            ? "No cost data available"
            : "No weight data available",
        EmptyIcon: type === "cost" ? DollarSign : Package,
        tooltipValueFormatter: (value: number) =>
          type === "cost"
            ? formatINR(value)
            : formatQuantityUtil(value, "gms", 1),
      };
    }

    // Calculate total and prepare data
    let total = 0;
    const rawData: ChartDataItem[] = ingredients
      .map((ing, index) => {
        let value: number;
        let displayValue: string | undefined;

        if (type === "cost") {
          value = ing.costForQuantity;
        } else {
          const weightInGrams = convertToBaseUnit(
            ing.quantity,
            ing.unit
          ).quantity;
          value = weightInGrams;
          displayValue = formatQuantity(ing.quantity, ing.unit);
        }

        total += value;

        return {
          name: ing.materialName || "Unknown",
          value,
          percentage: 0, // Will be calculated after total is known
          supplier: ing.supplierName || "Unknown",
          displayValue,
          color:
            CHART_COLOR_SCHEMES.default[
              index % CHART_COLOR_SCHEMES.default.length
            ],
        };
      })
      .filter((item) => item.value > 0);

    // Calculate percentages and sort
    const dataWithPercentages = rawData.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }));

    const sortedData = sortChartDataByValue(dataWithPercentages, "value");

    // Create chart config
    const config: Record<string, { label: string; color: string }> = {};
    sortedData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.color,
      };
    });

    return {
      chartData: sortedData,
      chartConfig: config,
      title: type === "cost" ? "Cost Distribution" : "Weight Distribution",
      icon: type === "cost" ? DollarSign : Package,
      iconColor: type === "cost" ? "text-blue-600" : "text-green-600",
      emptyMessage:
        type === "cost" ? "No cost data available" : "No weight data available",
      EmptyIcon: type === "cost" ? DollarSign : Package,
      tooltipValueFormatter: (value: number) =>
        type === "cost"
          ? formatINR(value)
          : formatQuantityUtil(value, "gms", 1),
    };
  }, [ingredients, type]);

  if (!chartData.length) {
    return (
      <Card className="p-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <EmptyIcon className={`w-4 h-4 ${iconColor}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <EmptyIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-xs">{emptyMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <ChartContainer
            config={chartConfig}
            className="h-48"
            style={{ width: "70%", margin: "-16px 0 0 0" }}
          >
            <PieChart>
              <Pie
                data={chartData}
                cx="40%"
                cy="50%"
                innerRadius={35}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(
                      value: number | string,
                      name: string,
                      item: any,
                      index: number,
                      payload: any
                    ) => [
                      <div key="value" className="text-right">
                        <div className="font-medium text-sm">
                          {payload?.name || name}
                        </div>
                        <div className="text-muted-foreground">
                          {payload?.supplier || "Unknown"}
                        </div>
                        <div className="font-mono font-medium tabular-nums text-base">
                          {formatChartPercentage(payload.percentage)}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {tooltipValueFormatter(Number(value))}
                        </div>
                      </div>,
                      "",
                    ]}
                    labelFormatter={() => ""}
                  />
                }
              />
            </PieChart>
          </ChartContainer>

          {/* Legend */}
          <div className="flex flex-col gap-2 min-w-32 mt-4">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">
                    {truncateText(item.name, 20)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// EXPORTED COMPONENTS
/**
 * Cost distribution chart for recipe ingredients
 * Shows how much each ingredient contributes to total recipe cost
 */
export function RecipeCostDistributionChart({
  ingredients,
}: {
  ingredients: RecipeIngredientDetail[];
}) {
  return <RecipeDistributionChart ingredients={ingredients} type="cost" />;
}

/**
 * Weight distribution chart for recipe ingredients
 * Shows how much each ingredient contributes to total recipe weight
 */
export function RecipeWeightDistributionChart({
  ingredients,
}: {
  ingredients: RecipeIngredientDetail[];
}) {
  return <RecipeDistributionChart ingredients={ingredients} type="weight" />;
}
