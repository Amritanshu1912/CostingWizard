import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SortableTable } from "@/components/ui/sortable-table";
import {
  Edit,
  Trash2,
  Search,
  Calendar,
  Factory,
  TrendingUp,
} from "lucide-react";
import { ProductionPlan } from "@/lib/types";
import { STATUS_CONFIG } from "./planning-constants";
import { MetricCard } from "@/components/ui/metric-card";

interface ProductionPlanningPlansTabProps {
  plans: ProductionPlan[];
  onDeletePlan: (id: string) => void;
  onEditPlan: (plan: ProductionPlan) => void;
}

export function ProductionPlanningPlansTab({
  plans,
  onDeletePlan,
  onEditPlan,
}: ProductionPlanningPlansTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlans = plans.filter((plan) =>
    plan.planName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <MetricCard
          title="Total Plans"
          value={totalPlans}
          icon={Calendar}
          trend={{ value: "+2", isPositive: true, label: "this month" }}
        />
        <MetricCard
          title="Active Plans"
          value={activePlans}
          icon={Factory}
          description="currently in production"
        />
        <MetricCard
          title="Total Value"
          value={`₹${totalValue.toFixed(0)}`}
          icon={TrendingUp}
          description="expected revenue"
        />
        <MetricCard
          title="Avg Profit Margin"
          value={`${avgProfit.toFixed(1)}%`}
          icon={TrendingUp}
          description="across all plans"
        />
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

      {/* Production Plans */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Production Plans</CardTitle>
          <CardDescription>Manage your production schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search production plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <SortableTable
            data={filteredPlans}
            columns={[
              {
                key: "planName",
                label: "Plan Name",
                sortable: true,
                render: (value: string) => (
                  <span className="font-medium">{value}</span>
                ),
              },
              {
                key: "duration",
                label: "Duration",
                sortable: true,
                render: (value: any, row: ProductionPlan) => (
                  <span>
                    {row.startDate} to {row.endDate}
                  </span>
                ),
              },
              {
                key: "products",
                label: "Products",
                sortable: true,
                render: (value: any, row: ProductionPlan) => (
                  <span>{row.products.length} items</span>
                ),
              },
              {
                key: "totalCost",
                label: "Total Cost",
                sortable: true,
                render: (value: number) => <span>₹{value.toFixed(2)}</span>,
              },
              {
                key: "totalRevenue",
                label: "Expected Revenue",
                sortable: true,
                render: (value: number) => <span>₹{value.toFixed(2)}</span>,
              },
              {
                key: "totalProfit",
                label: "Profit",
                sortable: true,
                render: (value: number) => (
                  <span className="text-green-600">₹{value.toFixed(2)}</span>
                ),
              },
              {
                key: "status",
                label: "Status",
                sortable: true,
                render: (value: string) => {
                  const statusConfig =
                    STATUS_CONFIG[value as keyof typeof STATUS_CONFIG] ||
                    STATUS_CONFIG.draft;
                  return <Badge variant={statusConfig.color}>{value}</Badge>;
                },
              },
              {
                key: "actions",
                label: "Actions",
                sortable: false,
                render: (value: any, row: ProductionPlan) => (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditPlan(row)}
                      className="h-8 w-8 p-0 bg-transparent"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeletePlan(row.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ),
              },
            ]}
            className="table-enhanced"
            showSerialNumber={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
