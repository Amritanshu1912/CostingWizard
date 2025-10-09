import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Factory, TrendingUp } from "lucide-react";
import { ProductionPlan } from "@/lib/types";
import { STATUS_CONFIG } from "./planning-constants";

interface ProductionPlanningOverviewTabProps {
  plans: ProductionPlan[];
}

export function ProductionPlanningOverviewTab({
  plans,
}: ProductionPlanningOverviewTabProps) {
  const totalPlans = plans.length;
  const activePlans = plans.filter((p) => p.status === "in-progress").length;
  const totalValue = plans.reduce((sum, p) => sum + p.totalRevenue, 0);
  const avgProfit =
    plans.reduce((sum, p) => sum + (p.totalProfit / p.totalRevenue) * 100, 0) /
    plans.length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Plans
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalPlans}
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+2</span>
              <span className="text-muted-foreground">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Plans
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {activePlans}
            </div>
            <div className="text-xs text-muted-foreground">
              currently in production
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ₹{totalValue.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">
              expected revenue
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Profit Margin
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {avgProfit.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              across all plans
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Plans */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Active Production Plans</CardTitle>
          <CardDescription>
            Current production schedules and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans
              .filter(
                (p) => p.status === "in-progress" || p.status === "scheduled"
              )
              .map((plan) => {
                const statusConfig =
                  STATUS_CONFIG[plan.status] || STATUS_CONFIG.draft;
                const StatusIcon = statusConfig.icon;
                return (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <StatusIcon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {plan.planName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {plan.products.length} products • {plan.startDate} to{" "}
                          {plan.endDate}
                        </div>
                        {plan.status === "in-progress" && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{plan.progress}%</span>
                            </div>
                            <Progress value={plan.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          ₹{plan.totalCost.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          total cost
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          ₹{plan.totalProfit.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          expected profit
                        </div>
                      </div>
                      <Badge variant={statusConfig.color}>{plan.status}</Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
