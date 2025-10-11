"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import type { Supplier } from "@/lib/types";

interface MaterialsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSupplier: string;
  setSelectedSupplier: (supplier: string) => void;
  suppliers: Supplier[];
  categories: string[];
}

export function MaterialsFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedSupplier,
  setSelectedSupplier,
  suppliers,
  categories,
}: MaterialsFiltersProps) {
  return (
    <div className="flex mb-6 gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 text-muted-foreground" />
          <Input
            placeholder="Search materials or suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 focus-enhanced"
          />
        </div>
      </div>
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="focus-enhanced">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
        <SelectTrigger className="focus-enhanced">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Suppliers</SelectItem>
          {suppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-end">
        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => {
            setSearchTerm("");
            setSelectedCategory("all");
            setSelectedSupplier("all");
          }}
        >
          <Filter className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
