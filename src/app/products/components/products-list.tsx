// src/app/products/components/products-list.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import type { ProductListItem } from "@/types/product-types";
import { cn } from "@/utils/shared-utils";
import { getStatusBadgeVariant } from "@/utils/product-utils";
import { Package2, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface ProductsListProps {
  products: ProductListItem[];
  selectedProductId?: string;
  onSelectProduct: (product: ProductListItem) => void;
  onCreateProduct: () => void;
}

/**
 * Product list component with search, filter, and sort functionality
 * Displays products in a scrollable list with status badges and variant counts
 */
export function ProductsList({
  products,
  selectedProductId,
  onSelectProduct,
  onCreateProduct,
}: ProductsListProps) {
  // --- UI State ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "draft" | "discontinued"
  >("all");
  const [sort, setSort] = useState<"name" | "recent">("name");

  // Debounce search for better performance
  const debouncedSearch = useDebounce(search, 200);

  // --- Filtering + Sorting ---
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Apply search filter
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(query));
    }

    // Apply status filter
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    // Apply sorting
    if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "recent") {
      list.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      );
    }

    return list;
  }, [products, debouncedSearch, statusFilter, sort]);

  return (
    <Card className="h-full shadow-sm">
      {/* Header */}
      <CardHeader>
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-lg font-semibold">Products</CardTitle>

          <Button onClick={onCreateProduct} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-8"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A–Z)</SelectItem>
              <SelectItem value="recent">Recently Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      {/* List */}
      <CardContent className="p-0">
        <div className="space-y-2 px-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {filteredProducts.map((product) => {
            const isSelected = selectedProductId === product.id;

            return (
              <div
                key={product.id}
                className={cn(
                  "rounded-lg cursor-pointer group relative transition-all border",
                  "hover:bg-muted/50 p-3",
                  isSelected
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "border-border"
                )}
                onClick={() => onSelectProduct(product)}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center justify-center rounded bg-primary/15 text-primary h-8 w-8">
                      <Package2 className="h-4 w-4" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate text-sm">
                        {product.name}
                      </span>
                      <div className="flex flex-row space-x-1 text-xs text-muted-foreground min-w-0">
                        <span className="whitespace-nowrap">
                          {product.variantCount} variant
                          {product.variantCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    variant={getStatusBadgeVariant(product.status)}
                    className="text-xs capitalize"
                  >
                    {product.status}
                  </Badge>
                </div>
              </div>
            );
          })}

          {/* No Results State */}
          {filteredProducts.length === 0 && products.length > 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No products found.
            </div>
          )}

          {/* Empty State */}
          {products.length === 0 && (
            <div className="text-center py-12 px-4">
              <Package2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No products yet
              </p>
              <Button onClick={onCreateProduct} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create First Product
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
