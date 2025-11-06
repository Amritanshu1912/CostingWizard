"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Box, Tag, Plus } from "lucide-react";
import type { Supplier } from "@/lib/types";

interface SuppliersItemsTabProps {
  suppliers: Supplier[];
}

export function SuppliersItemsTab({ suppliers }: SuppliersItemsTabProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("materials");

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  const handleAddItem = (type: string) => {
    // TODO: Implement add item functionality
  };

  return (
    <div className="space-y-6">
      {/* Supplier Selector */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Select Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select
                value={selectedSupplierId}
                onValueChange={setSelectedSupplierId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a supplier to manage items" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers
                    .filter((s) => s.isActive)
                    .map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        <div className="flex items-center gap-2">
                          <span>{supplier.name}</span>
                          <Badge variant="outline" className="text-xs">
                            ⭐ {supplier.rating}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {selectedSupplier && (
              <div className="text-sm text-muted-foreground">
                Managing items for <strong>{selectedSupplier.name}</strong>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedSupplierId ? (
        <Card className="border-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Supplier Items</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage materials, packaging, and labels for{" "}
                  {selectedSupplier?.name}
                </p>
              </div>
              <Button onClick={() => handleAddItem(activeTab)}>
                <Plus className="h-4 w-4 mr-2" />
                Add {activeTab.slice(0, -1)}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="materials"
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Materials
                </TabsTrigger>
                <TabsTrigger
                  value="packaging"
                  className="flex items-center gap-2"
                >
                  <Box className="h-4 w-4" />
                  Packaging
                </TabsTrigger>
                <TabsTrigger value="labels" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Labels
                </TabsTrigger>
              </TabsList>

              <TabsContent value="materials" className="mt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Materials table will be implemented here
                </div>
              </TabsContent>

              <TabsContent value="packaging" className="mt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Packaging table will be implemented here
                </div>
              </TabsContent>

              <TabsContent value="labels" className="mt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Labels table will be implemented here
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Select a Supplier
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Choose a supplier from the dropdown above to view and manage their
              materials, packaging, and labels.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
