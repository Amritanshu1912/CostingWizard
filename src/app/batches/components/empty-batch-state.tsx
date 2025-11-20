import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";

interface EmptyBatchStateProps {
  onCreateBatch: () => void;
}

export function EmptyBatchState({ onCreateBatch }: EmptyBatchStateProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center justify-center py-24">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Package className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-medium text-muted-foreground mb-2">
          No batch selected
        </h3>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
          Select a batch from the list to view details, or create a new
          production batch to get started
        </p>
        <Button onClick={onCreateBatch}>
          <Plus className="h-4 w-4 mr-2" />
          Create Batch
        </Button>
      </CardContent>
    </Card>
  );
}
