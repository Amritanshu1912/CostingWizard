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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Search } from "lucide-react";
import { ProductionPlan } from "@/lib/types";
import { STATUS_CONFIG } from "./planning-constants";

interface ProductionPlanningPlansTabProps {
  plans: ProductionPlan[];
  onDeletePlan: (id: string) => void;
}

export function ProductionPlanningPlansTab({
  plans,
  onDeletePlan,
}: ProductionPlanningPlansTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlans = plans.filter((plan) =>
    plan.planName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search production plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Production Plans</CardTitle>
          <CardDescription>Manage your production schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Expected Revenue</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => {
                const statusConfig =
                  STATUS_CONFIG[plan.status] || STATUS_CONFIG.draft;
                return (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {plan.planName}
                    </TableCell>
                    <TableCell>
                      {plan.startDate} to {plan.endDate}
                    </TableCell>
                    <TableCell>{plan.products.length} items</TableCell>
                    <TableCell>₹{plan.totalCost.toFixed(2)}</TableCell>
                    <TableCell>₹{plan.totalRevenue.toFixed(2)}</TableCell>
                    <TableCell className="text-green-600">
                      ₹{plan.totalProfit.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.color}>{plan.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-transparent"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeletePlan(plan.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
