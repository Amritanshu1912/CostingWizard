"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { ProductionPlan } from "@/lib/types";
import { PRODUCTION_PLANS } from "@/lib/constants";
import { ProductionPlanningOverviewTab } from "./planning-overview-tab";
import { ProductionPlanningPlansTab } from "./planning-plans-tab";
import { ProductionPlanningMaterialsTab } from "./planning-materials-tab";
import { ProductionPlanningCreateDialog } from "./planning-create-dialog";
import { PlanningAnalytics } from "./planning-analytics";

export function ProductionPlanning() {
  const [plans, setPlans] = useState<ProductionPlan[]>(PRODUCTION_PLANS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredPlans = plans.filter((plan) =>
    plan.planName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePlan = (plan: ProductionPlan) => {
    setPlans([...plans, plan]);
    setIsCreateDialogOpen(false);
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          Production Planning
        </h1>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-secondary hover:bg-secondary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Production Plans</TabsTrigger>
          <TabsTrigger value="materials">Material Requirements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProductionPlanningOverviewTab plans={plans} />
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <ProductionPlanningPlansTab
            plans={filteredPlans}
            onDeletePlan={handleDeletePlan}
          />
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <ProductionPlanningMaterialsTab plans={plans} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PlanningAnalytics />
        </TabsContent>
      </Tabs>

      <ProductionPlanningCreateDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreatePlan={handleCreatePlan}
      />
    </div>
  );
}
