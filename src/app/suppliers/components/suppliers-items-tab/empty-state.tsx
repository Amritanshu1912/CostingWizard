// src/app/suppliers/components/suppliers-items-tab/empty-state.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  onAddItem: () => void;
}

/**
 * Reusable empty state component for tables.
 * Displays icon, message, and action button when no data is available.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  buttonText,
  onAddItem,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
      <div className="rounded-full bg-muted p-6 w-fit mx-auto mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm mb-6 max-w-sm mx-auto">{description}</p>
      <Button onClick={onAddItem} size="lg" className="shadow-sm">
        <Plus className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  );
}
