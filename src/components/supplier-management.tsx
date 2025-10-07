"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  Edit,
  Trash2,
  Search,
  Filter,
  Star,
  Package,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Supplier2, SupplierMaterial2 } from "@/lib/types";
import { sampleSuppliers2, sampleSupplierMaterials } from "@/lib/constants";

export function SupplierManagement() {
  const [suppliers, setSuppliers] = useLocalStorage(
    "suppliers",
    sampleSuppliers2
  );
  const [supplierMaterials, setSupplierMaterials] = useLocalStorage(
    "supplier-materials",
    sampleSupplierMaterials
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier2 | null>(
    null
  );
  const [editingMaterial, setEditingMaterial] =
    useState<SupplierMaterial2 | null>(null);

  // New supplier form state
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier2>>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    rating: 5,
    isActive: true,
    paymentTerms: "30 days",
    leadTime: 7,
    notes: "",
  });

  // New material form state
  const [newMaterial, setNewMaterial] = useState<Partial<SupplierMaterial2>>({
    supplierId: "",
    materialName: "",
    materialCategory: "",
    unitPrice: 0,
    currency: "INR",
    moq: 1,
    unit: "kg",
    bulkDiscounts: [],
    leadTime: 7,
    availability: "in-stock",
    notes: "",
  });

  const categories = Array.from(
    new Set(supplierMaterials.map((m) => m.materialCategory))
  );
  const materials = Array.from(
    new Set(supplierMaterials.map((m) => m.materialName))
  );

  const filteredMaterials = supplierMaterials.filter((material) => {
    const supplier = suppliers.find((s) => s.id === material.supplierId);
    const matchesSearch =
      material.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      material.materialCategory === selectedCategory;
    const matchesSupplier =
      selectedSupplier === "all" || material.supplierId === selectedSupplier;

    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const addSupplier = () => {
    if (!newSupplier.name || !newSupplier.contactPerson) return;

    const supplier: Supplier2 = {
      id: Date.now().toString(),
      name: newSupplier.name,
      contactPerson: newSupplier.contactPerson,
      email: newSupplier.email || "",
      phone: newSupplier.phone || "",
      address: newSupplier.address || "",
      rating: newSupplier.rating || 5,
      isActive: newSupplier.isActive ?? true,
      paymentTerms: newSupplier.paymentTerms || "30 days",
      leadTime: newSupplier.leadTime || 7,
      notes: newSupplier.notes || "",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setSuppliers([...suppliers, supplier]);
    setNewSupplier({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      rating: 5,
      isActive: true,
      paymentTerms: "30 days",
      leadTime: 7,
      notes: "",
    });
    setShowAddSupplier(false);
  };

  const addMaterial = () => {
    if (
      !newMaterial.supplierId ||
      !newMaterial.materialName ||
      !newMaterial.unitPrice
    )
      return;

    const material: SupplierMaterial2 = {
      id: Date.now().toString(),
      supplierId: newMaterial.supplierId,
      materialName: newMaterial.materialName,
      materialCategory: newMaterial.materialCategory || "Other",
      unitPrice: newMaterial.unitPrice,
      currency: newMaterial.currency || "INR",
      moq: newMaterial.moq || 1,
      unit: newMaterial.unit || "kg",
      bulkDiscounts: newMaterial.bulkDiscounts || [],
      leadTime: newMaterial.leadTime || 7,
      availability: newMaterial.availability || "in-stock",
      lastUpdated: new Date().toISOString().split("T")[0],
      notes: newMaterial.notes || "",
    };

    setSupplierMaterials([...supplierMaterials, material]);
    setNewMaterial({
      supplierId: "",
      materialName: "",
      materialCategory: "",
      unitPrice: 0,
      currency: "INR",
      moq: 1,
      unit: "kg",
      bulkDiscounts: [],
      leadTime: 7,
      availability: "in-stock",
      notes: "",
    });
    setShowAddMaterial(false);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter((s) => s.id !== id));
    setSupplierMaterials(supplierMaterials.filter((m) => m.supplierId !== id));
  };

  const deleteMaterial = (id: string) => {
    setSupplierMaterials(supplierMaterials.filter((m) => m.id !== id));
  };

  const getSupplierName = (supplierId: string) => {
    return (
      suppliers.find((s) => s.id === supplierId)?.name || "Unknown Supplier2"
    );
  };

  const getMaterialsBySupplier = (supplierId: string) => {
    return supplierMaterials.filter((m) => m.supplierId === supplierId);
  };

  const getAlternativeSuppliers = (materialName: string) => {
    return supplierMaterials.filter((m) => m.materialName === materialName);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Supplier2 Management
          </h2>
          <p className="text-muted-foreground">
            Manage suppliers, materials, pricing, and MOQ requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Building2 className="h-4 w-4 mr-2" />
                Add Supplier2
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Supplier2</DialogTitle>
                <DialogDescription>
                  Enter supplier details and contact information
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Supplier2 Name *</Label>
                  <Input
                    value={newSupplier.name}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, name: e.target.value })
                    }
                    placeholder="Enter supplier name"
                    className="focus-enhanced"
                  />
                </div>
                <div>
                  <Label>Contact Person *</Label>
                  <Input
                    value={newSupplier.contactPerson}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        contactPerson: e.target.value,
                      })
                    }
                    placeholder="Enter contact person"
                    className="focus-enhanced"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, email: e.target.value })
                    }
                    placeholder="Enter email"
                    className="focus-enhanced"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newSupplier.phone}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                    className="focus-enhanced"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <Textarea
                    value={newSupplier.address}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter complete address"
                    className="focus-enhanced"
                  />
                </div>
                <div>
                  <Label>Payment Terms</Label>
                  <Select
                    value={newSupplier.paymentTerms}
                    onValueChange={(value: any) =>
                      setNewSupplier({ ...newSupplier, paymentTerms: value })
                    }
                  >
                    <SelectTrigger className="focus-enhanced">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15 days">15 days</SelectItem>
                      <SelectItem value="30 days">30 days</SelectItem>
                      <SelectItem value="45 days">45 days</SelectItem>
                      <SelectItem value="60 days">60 days</SelectItem>
                      <SelectItem value="Advance">Advance Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lead Time (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newSupplier.leadTime}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        leadTime: Number(e.target.value),
                      })
                    }
                    className="focus-enhanced"
                  />
                </div>
                <div>
                  <Label>Rating (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={newSupplier.rating}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        rating: Number(e.target.value),
                      })
                    }
                    className="focus-enhanced"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newSupplier.isActive}
                    onCheckedChange={(checked: any) =>
                      setNewSupplier({ ...newSupplier, isActive: checked })
                    }
                  />
                  <Label>Active Supplier2</Label>
                </div>
                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newSupplier.notes}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, notes: e.target.value })
                    }
                    placeholder="Additional notes about the supplier"
                    className="focus-enhanced"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddSupplier(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addSupplier} className="btn-primary">
                  Add Supplier2
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddMaterial} onOpenChange={setShowAddMaterial}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="btn-secondary bg-transparent"
              >
                <Package className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Material to Supplier2</DialogTitle>
                <DialogDescription>
                  Add material pricing and MOQ information
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Supplier2 *</Label>
                  <Select
                    value={newMaterial.supplierId}
                    onValueChange={(value: any) =>
                      setNewMaterial({ ...newMaterial, supplierId: value })
                    }
                  >
                    <SelectTrigger className="focus-enhanced">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers
                        .filter((s) => s.isActive)
                        .map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Material Name *</Label>
                  <Input
                    value={newMaterial.materialName}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        materialName: e.target.value,
                      })
                    }
                    placeholder="Enter material name"
                    className="focus-enhanced"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newMaterial.materialCategory}
                    onValueChange={(value: any) =>
                      setNewMaterial({
                        ...newMaterial,
                        materialCategory: value,
                      })
                    }
                  >
                    <SelectTrigger className="focus-enhanced">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Acids">Acids</SelectItem>
                      <SelectItem value="Bases">Bases</SelectItem>
                      <SelectItem value="Colors">Colors</SelectItem>
                      <SelectItem value="Salts">Salts</SelectItem>
                      <SelectItem value="Thickeners">Thickeners</SelectItem>
                      <SelectItem value="Bottles">Bottles</SelectItem>
                      <SelectItem value="Labels">Labels</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unit Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newMaterial.unitPrice}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        unitPrice: Number(e.target.value),
                      })
                    }
                    placeholder="0.00"
                    className="focus-enhanced"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select
                    value={newMaterial.currency}
                    onValueChange={(value: any) =>
                      setNewMaterial({ ...newMaterial, currency: value })
                    }
                  >
                    <SelectTrigger className="focus-enhanced">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>MOQ (Minimum Order Quantity) *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newMaterial.moq}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        moq: Number(e.target.value),
                      })
                    }
                    className="focus-enhanced"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select
                    value={newMaterial.unit}
                    onValueChange={(value: any) =>
                      setNewMaterial({ ...newMaterial, unit: value })
                    }
                  >
                    <SelectTrigger className="focus-enhanced">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="liters">liters</SelectItem>
                      <SelectItem value="pieces">pieces</SelectItem>
                      <SelectItem value="meters">meters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lead Time (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newMaterial.leadTime}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        leadTime: Number(e.target.value),
                      })
                    }
                    className="focus-enhanced"
                  />
                </div>
                <div>
                  <Label>Availability</Label>
                  <Select
                    value={newMaterial.availability}
                    onValueChange={(value: any) =>
                      setNewMaterial({
                        ...newMaterial,
                        availability: value as any,
                      })
                    }
                  >
                    <SelectTrigger className="focus-enhanced">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="limited">Limited Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newMaterial.notes}
                    onChange={(e) =>
                      setNewMaterial({ ...newMaterial, notes: e.target.value })
                    }
                    placeholder="Additional notes about the material"
                    className="focus-enhanced"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddMaterial(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addMaterial} className="btn-primary">
                  Add Material
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="materials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials">Materials & Pricing</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="comparison">Price Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-6">
          {/* Filters */}
          <Card className="card-enhanced">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Search Materials</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search materials or suppliers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 focus-enhanced"
                    />
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
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
                </div>
                <div>
                  <Label>Supplier2</Label>
                  <Select
                    value={selectedSupplier}
                    onValueChange={setSelectedSupplier}
                  >
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
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materials Table */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Materials & Pricing</CardTitle>
              <CardDescription>
                {filteredMaterials.length} materials from {suppliers.length}{" "}
                suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="table-enhanced">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground font-medium">
                        #
                      </TableHead>
                      <TableHead className="text-foreground font-medium">
                        Material
                      </TableHead>
                      <TableHead className="text-foreground font-medium">
                        Supplier2
                      </TableHead>
                      <TableHead className="text-foreground font-medium">
                        Category
                      </TableHead>
                      <TableHead className="text-foreground font-medium">
                        Price
                      </TableHead>
                      <TableHead className="text-foreground font-medium">
                        MOQ
                      </TableHead>
                      <TableHead className="text-foreground font-medium">
                        Lead Time
                      </TableHead>
                      <TableHead className="text-foreground font-medium">
                        Availability
                      </TableHead>
                      <TableHead className="text-foreground font-medium">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((material, index) => {
                      const supplier = suppliers.find(
                        (s) => s.id === material.supplierId
                      );
                      return (
                        <TableRow
                          key={material.id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="text-muted-foreground font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {material.materialName}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {supplier?.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {material.materialCategory}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground font-medium">
                            {material.currency} {material.unitPrice.toFixed(2)}/
                            {material.unit}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {material.moq} {material.unit}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {material.leadTime} days
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                material.availability === "in-stock"
                                  ? "default"
                                  : material.availability === "limited"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {material.availability.replace("-", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 bg-transparent"
                                onClick={() => setEditingMaterial(material)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive bg-transparent"
                                onClick={() => deleteMaterial(material.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier, index) => (
              <Card key={supplier.id} className="card-enhanced">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <CardDescription>
                        {supplier.contactPerson}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium ml-1">
                          {supplier.rating}
                        </span>
                      </div>
                      <Badge
                        variant={supplier.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {supplier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground">
                        {supplier.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="text-foreground">
                        {supplier.phone || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Payment Terms:
                      </span>
                      <span className="text-foreground">
                        {supplier.paymentTerms}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lead Time:</span>
                      <span className="text-foreground">
                        {supplier.leadTime} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Materials:</span>
                      <span className="text-accent font-medium">
                        {getMaterialsBySupplier(supplier.id).length}
                      </span>
                    </div>
                  </div>

                  {supplier.notes && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {supplier.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => setEditingSupplier(supplier)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => deleteSupplier(supplier.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Price Comparison by Material</CardTitle>
              <CardDescription>
                Compare prices from different suppliers for the same materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {materials.map((materialName) => {
                  const alternatives = getAlternativeSuppliers(materialName);
                  if (alternatives.length < 2) return null;

                  const sortedAlternatives = alternatives.sort(
                    (a, b) => a.unitPrice - b.unitPrice
                  );
                  const cheapest = sortedAlternatives[0];
                  const mostExpensive =
                    sortedAlternatives[sortedAlternatives.length - 1];
                  const savings = mostExpensive.unitPrice - cheapest.unitPrice;
                  const savingsPercent =
                    (savings / mostExpensive.unitPrice) * 100;

                  return (
                    <div
                      key={materialName}
                      className="border border-border/50 rounded-lg p-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                        <div>
                          <h4 className="font-medium text-foreground">
                            {materialName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {alternatives.length} suppliers available
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            Potential Savings
                          </div>
                          <div className="font-medium text-accent">
                            ₹{savings.toFixed(2)} ({savingsPercent.toFixed(1)}%)
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-foreground font-medium">
                                #
                              </TableHead>
                              <TableHead className="text-foreground font-medium">
                                Supplier2
                              </TableHead>
                              <TableHead className="text-foreground font-medium">
                                Price
                              </TableHead>
                              <TableHead className="text-foreground font-medium">
                                MOQ
                              </TableHead>
                              <TableHead className="text-foreground font-medium">
                                Lead Time
                              </TableHead>
                              <TableHead className="text-foreground font-medium">
                                Availability
                              </TableHead>
                              <TableHead className="text-foreground font-medium">
                                Rating
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedAlternatives.map((material, index) => {
                              const supplier = suppliers.find(
                                (s) => s.id === material.supplierId
                              );
                              const isCheapest = material.id === cheapest.id;
                              return (
                                <TableRow
                                  key={material.id}
                                  className={isCheapest ? "bg-accent/10" : ""}
                                >
                                  <TableCell className="text-muted-foreground font-medium">
                                    {index + 1}
                                  </TableCell>
                                  <TableCell className="font-medium text-foreground">
                                    {supplier?.name}
                                    {isCheapest && (
                                      <Badge
                                        variant="default"
                                        className="ml-2 text-xs"
                                      >
                                        Best Price
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-foreground font-medium">
                                    ₹{material.unitPrice.toFixed(2)}/
                                    {material.unit}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {material.moq} {material.unit}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {material.leadTime} days
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        material.availability === "in-stock"
                                          ? "default"
                                          : material.availability === "limited"
                                          ? "secondary"
                                          : "destructive"
                                      }
                                      className="text-xs"
                                    >
                                      {material.availability.replace("-", " ")}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                                      <span className="text-sm">
                                        {supplier?.rating}
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
