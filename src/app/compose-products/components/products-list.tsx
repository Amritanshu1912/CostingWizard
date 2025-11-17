"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package2, Plus, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-duplicate-check";
import { useVariantCountMap } from "@/hooks/use-products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductsListProps {
  products: Product[];
  selectedProductId?: string;
  onSelectProduct: (product: Product) => void;
  onCreateProduct: () => void;
}

export function ProductsList({
  products,
  selectedProductId,
  onSelectProduct,
  onCreateProduct,
}: ProductsListProps) {
  // --- UI State ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Product["status"]>(
    "all"
  );
  const [sort, setSort] = useState<"name" | "recent">("name");

  const debouncedSearch = useDebounce(search, 200);

  // --- Filtering + Sorting ---
  const filtered = useMemo(() => {
    let list = [...products];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "recent") {
      list.sort(
        (a, b) =>
          new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
      );
    }

    return list;
  }, [products, debouncedSearch, statusFilter, sort]);

  const variantCountMap = useVariantCountMap();

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
            onValueChange={(v) => setStatusFilter(v as any)}
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
        </div>
      </CardHeader>

      {/* List */}
      <CardContent className="p-0">
        <div className="space-y-2 px-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {filtered.map((product) => {
            const variantCount = variantCountMap.get(product.id) || 0;
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
                    <div
                      className={
                        "flex items-center justify-center rounded bg-primary/15 text-primary h-8 w-8"
                      }
                    >
                      <Package2 className={"h-4 w-4"} />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className={"font-medium truncate text-sm"}>
                        {product.name}
                      </span>
                      <div className="flex flex-row space-x-1 text-xs text-muted-foreground min-w-0">
                        <span className="whitespace-nowrap">
                          {variantCount} variant{variantCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <Badge
                    variant={
                      product.status === "active"
                        ? "default"
                        : product.status === "draft"
                        ? "secondary"
                        : "destructive"
                    }
                    className={"text-xs capitalize"}
                  >
                    {product.status}
                  </Badge>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
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
