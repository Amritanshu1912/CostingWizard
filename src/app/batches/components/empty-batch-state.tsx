// src/app/batches/components/empty-batch-state.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Plus, Lightbulb } from "lucide-react";

interface EmptyBatchStateProps {
  onCreateBatch: () => void;
}

export function EmptyBatchState({ onCreateBatch }: EmptyBatchStateProps) {
  return (
    <Card className="h-full border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-24 px-8">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border-2 border-primary/20">
          <Package className="h-12 w-12 text-primary" />
        </div>

        <h3 className="text-2xl font-semibold mb-2">No batch selected</h3>

        <p className="text-muted-foreground text-center max-w-md mb-8">
          Select a batch from the list to view details and manage requirements,
          or create a new production batch to get started
        </p>

        <Button onClick={onCreateBatch} size="lg" className="mb-8">
          <Plus className="h-5 w-5 mr-2" />
          Create Production Batch
        </Button>

        {/* Quick Tips */}
        <div className="w-full max-w-md space-y-3 pt-8 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">Quick Tips:</span>
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Add multiple products and variants to a single batch</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Track material requirements and costs automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Monitor inventory levels and shortages in real-time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                Generate purchase orders directly from batch requirements
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xl:col-span-3">
          <Skeleton className="h-[600px]" />
        </div>
        <div className="lg:col-span-8 xl:col-span-9">
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    </div>
  );
}
