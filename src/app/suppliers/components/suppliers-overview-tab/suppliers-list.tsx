"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Building2, Star } from "lucide-react";
import type { Supplier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SuppliersListProps {
  suppliers: Supplier[];
  selectedSupplierId: string | null;
  onSelectSupplier: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  itemsBySupplier?: Record<string, number>;
}

export function SuppliersList({
  suppliers,
  selectedSupplierId,
  onSelectSupplier,
  searchTerm,
  onSearchChange,
  itemsBySupplier = {},
}: SuppliersListProps) {
  return (
    <Card className="border-2 h-[calc(100vh-12rem)]">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Supplier List */}
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {suppliers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No suppliers found</p>
              </div>
            ) : (
              suppliers.map((supplier) => {
                const itemsCount = itemsBySupplier[supplier.id] || 0;
                const isSelected = selectedSupplierId === supplier.id;

                return (
                  <button
                    key={supplier.id}
                    onClick={() => onSelectSupplier(supplier.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">
                          {supplier.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {supplier.contactPersons?.[0]?.name || "No contact"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {supplier.rating}
                          </span>
                        </div>
                        {itemsCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {itemsCount} items
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {supplier.paymentTerms}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {supplier.leadTime}d lead
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
