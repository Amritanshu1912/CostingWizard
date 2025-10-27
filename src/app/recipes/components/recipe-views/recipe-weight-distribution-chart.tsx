import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CHART_COLORS } from "@/lib/color-utils";
import { Package } from "lucide-react";
import type { RecipeIngredientDisplay } from "@/lib/types";
import { recipeCalculator } from "@/hooks/use-recipes";

interface RecipeWeightDistributionChartProps {
  ingredients: RecipeIngredientDisplay[];
}

export function RecipeWeightDistributionChart({
  ingredients,
}: RecipeWeightDistributionChartProps) {
  const chartData = useMemo(() => {
    if (!ingredients.length) return [];

    const totalWeight = ingredients.reduce(
      (sum, ing) =>
        sum + recipeCalculator.convertToStandard(ing.quantity, ing.unit),
      0
    );

    return ingredients
      .map((ing, index) => {
        const weightInGrams = recipeCalculator.convertToStandard(
          ing.quantity,
          ing.unit
        );
        return {
          name: ing.materialName || "Unknown",
          value: weightInGrams,
          percentage: totalWeight > 0 ? (weightInGrams / totalWeight) * 100 : 0,
          supplier: ing.supplierName || "Unknown",
          displayQuantity: recipeCalculator.formatQuantity(
            ing.quantity,
            ing.unit
          ),
          color:
            CHART_COLORS.light[
              `chart${(index % 5) + 1}` as keyof typeof CHART_COLORS.light
            ],
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [ingredients]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    chartData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.color,
      };
    });
    return config;
  }, [chartData]);

  if (!chartData.length) {
    return (
      <Card className="p-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4 text-green-600" />
            Weight Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-xs">No weight data available</p>
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
          <Package className="w-4 h-4 text-green-600" />
          Weight Distribution
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
                          {payload.percentage.toFixed(1)}%
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {Number(value).toFixed(1)} gms
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
                  <div className="font-medium truncate">{item.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
