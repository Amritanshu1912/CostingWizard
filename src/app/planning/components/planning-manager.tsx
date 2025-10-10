"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { ProductionPlan } from "@/lib/types";
import { PRODUCTION_PLANS } from "@/lib/constants";

import { ProductionPlanningPlansTab } from "./planning-plans-tab";
import { ProductionPlanningMaterialsTab } from "./planning-materials-tab";
import { ProductionPlanningCreateDialog } from "./planning-create-dialog";
import { PlanningAnalytics } from "./planning-analytics";

export function ProductionPlanning() {
  const [plans, setPlans] = useState<ProductionPlan[]>(PRODUCTION_PLANS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null);

  const filteredPlans = plans.filter((plan) =>
    plan.planName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePlan = (plan: ProductionPlan) => {
    setPlans([...plans, plan]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdatePlan = (updatedPlan: ProductionPlan) => {
    setPlans(plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
    setEditingPlan(null);
    setIsCreateDialogOpen(false);
  };

  const handleEditClick = (plan: ProductionPlan) => {
    setEditingPlan(plan);
    setIsCreateDialogOpen(true);
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Production Planning Manager
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Create, manage, and analyze your production plans.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="truncate">Create Plan</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Production Plans</TabsTrigger>
          <TabsTrigger value="materials">Material Requirements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <ProductionPlanningPlansTab
            plans={filteredPlans}
            onDeletePlan={handleDeletePlan}
            onEditPlan={handleEditClick}
          />
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <ProductionPlanningMaterialsTab plans={plans} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PlanningAnalytics plans={plans} />
        </TabsContent>
      </Tabs>

      <ProductionPlanningCreateDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreatePlan={handleCreatePlan}
        initialPlan={editingPlan}
        onEditPlan={handleUpdatePlan}
      />
    </div>
  );
}
