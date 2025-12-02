// src/app/batches/components/batches-list-view.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProductionBatch } from "@/types/shared-types";
import { cn } from "@/utils/shared-utils";
import {
  Calendar,
  CheckCircle,
  Clock,
  Factory,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface BatchesListViewProps {
  batches: ProductionBatch[];
  selectedBatchId?: string;
  onSelectBatch: (batch: ProductionBatch) => void;
  onCreateBatch: () => void;
}

const STATUS_CONFIG = {
  draft: {
    color: "secondary",
    icon: Calendar,
    label: "Draft",
    textColor: "text-muted-foreground",
  },
  scheduled: {
    color: "default",
    icon: Clock,
    label: "Scheduled",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  "in-progress": {
    color: "default",
    icon: Factory,
    label: "In Progress",
    textColor: "text-green-600 dark:text-green-400",
  },
  completed: {
    color: "default",
    icon: CheckCircle,
    label: "Completed",
    textColor: "text-green-600 dark:text-green-400",
  },
  cancelled: {
    color: "destructive",
    icon: XCircle,
    label: "Cancelled",
    textColor: "text-red-600 dark:text-red-400",
  },
} as const;

export function BatchesListView({
  batches,
  selectedBatchId,
  onSelectBatch,
  onCreateBatch,
}: BatchesListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    ProductionBatch["status"] | "all"
  >("all");

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || batch.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-lg">Production Batches</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredBatches.length} of {batches.length} batches
            </p>
          </div>
          <Button onClick={onCreateBatch} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search batches..."
            className="pl-9 h-9"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {(
            [
              "all",
              "draft",
              "scheduled",
              "in-progress",
              "completed",
              "cancelled",
            ] as const
          ).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="h-7 text-xs"
            >
              {status === "all" ? "All" : STATUS_CONFIG[status].label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="space-y-2 p-3 h-full overflow-y-auto">
          {filteredBatches.map((batch) => {
            const config = STATUS_CONFIG[batch.status];
            const Icon = config.icon;
            const isSelected = selectedBatchId === batch.id;

            return (
              <div
                key={batch.id}
                className={cn(
                  "group relative p-4 rounded-lg cursor-pointer transition-all hover:shadow-md",
                  isSelected
                    ? "bg-primary/10 border-2 border-primary shadow-sm"
                    : "border border-border hover:bg-accent/50"
                )}
                onClick={() => onSelectBatch(batch)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted group-hover:bg-muted/80"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm truncate">
                        {batch.batchName}
                      </h4>
                      <Badge
                        variant={config.color}
                        className="text-xs flex-shrink-0"
                      >
                        {config.label}
                      </Badge>
                    </div>

                    {batch.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {batch.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {batch.startDate}
                      </span>
                      <span>→</span>
                      <span>{batch.endDate}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {batch.items.length} product
                        {batch.items.length !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {batch.items.reduce(
                          (sum, item) => sum + item.variants.length,
                          0
                        )}{" "}
                        variants
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredBatches.length === 0 && (
            <div className="text-center py-12 px-4">
              {batches.length === 0 ? (
                <>
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground mb-4 font-medium">
                    No batches yet
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Create your first production batch to get started
                  </p>
                  <Button onClick={onCreateBatch} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Batch
                  </Button>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No batches match your filters
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                    className="mt-3"
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
