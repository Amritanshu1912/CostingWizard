// src/app/recipes/components/recipe-views/recipe-cost-distribution-chart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { RecipeIngredientDisplay } from "@/types/shared-types";
import { CHART_COLOR_SCHEMES } from "@/utils/chart-utils";
import { DollarSign } from "lucide-react";
import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";

interface RecipeCostDistributionChartProps {
  ingredients: RecipeIngredientDisplay[];
}

export function RecipeCostDistributionChart({
  ingredients,
}: RecipeCostDistributionChartProps) {
  const chartData = useMemo(() => {
    if (!ingredients.length) return [];

    const totalCost = ingredients.reduce(
      (sum, ing) => sum + ing.costForQuantity,
      0
    );

    return ingredients
      .map((ing, index) => ({
        name: ing.materialName || "Unknown",
        value: ing.costForQuantity,
        percentage: totalCost > 0 ? (ing.costForQuantity / totalCost) * 100 : 0,
        supplier: ing.supplierName || "Unknown",
        color:
          CHART_COLOR_SCHEMES.default[
            index % CHART_COLOR_SCHEMES.default.length
          ],
      }))
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
            <DollarSign className="w-4 h-4 text-blue-600" />
            Cost Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-xs">No cost data available</p>
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
          <DollarSign className="w-4 h-4 text-blue-600" />
          Cost Distribution
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
                        <div className="text-muted-foreground ">
                          {payload?.supplier || "Unknown"}
                        </div>
                        <div className="font-mono font-medium tabular-nums text-base">
                          {payload.percentage.toFixed(1)}%
                        </div>
                        <div className="text-muted-foreground text-xs">
                          ₹ {Number(value).toFixed(2)}
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
