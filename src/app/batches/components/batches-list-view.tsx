"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus } from "lucide-react";
import type { ProductionBatch } from "@/lib/types";

interface BatchesListViewProps {
  batches: ProductionBatch[];
  selectedBatchId?: string;
  onSelectBatch: (batch: ProductionBatch) => void;
  onCreateBatch: () => void;
}

const STATUS_COLORS = {
  draft: "secondary",
  scheduled: "default",
  "in-progress": "default",
  completed: "default",
  cancelled: "destructive",
} as const;

export function BatchesListView({
  batches,
  selectedBatchId,
  onSelectBatch,
  onCreateBatch,
}: BatchesListViewProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Batches</CardTitle>
          <Button onClick={onCreateBatch} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-1 p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                selectedBatchId === batch.id
                  ? "bg-primary/10 border-2 border-primary"
                  : "border border-transparent"
              }`}
              onClick={() => onSelectBatch(batch)}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-medium text-sm truncate">
                    {batch.batchName}
                  </h4>
                </div>
                <Badge
                  variant={STATUS_COLORS[batch.status]}
                  className="text-xs flex-shrink-0"
                >
                  {batch.status}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground ml-10">
                <span className="font-medium text-foreground">
                  {batch.items.length} product
                  {batch.items.length !== 1 ? "s" : ""}
                </span>
                {" • "}
                <span>
                  {batch.startDate} - {batch.endDate}
                </span>
              </div>

              {batch.status === "in-progress" && (
                <div className="mt-2 ml-10">
                  <div className="text-xs text-muted-foreground mb-1">
                    {batch.progress}% complete
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${batch.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {batches.length === 0 && (
            <div className="text-center py-12 px-4">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                No batches yet
              </p>
              <Button onClick={onCreateBatch} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create First Batch
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
