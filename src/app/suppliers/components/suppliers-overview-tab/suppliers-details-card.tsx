// src/app/suppliers/components/suppliers-overview-tab/suppliers-details-card.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Supplier } from "@/lib/types";
import {
  Award,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Edit2,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Save,
  Star,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PAYMENT_TERMS } from "../suppliers-constants";

interface SuppliersDetailsCardProps {
  supplier: Supplier | null;
  isCreating: boolean;
  onUpdate: (supplier: Supplier) => void;
  onCreate: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onCancelCreate: () => void;
  materialCount?: number;
}

const initialSupplierState: Omit<Supplier, "id" | "createdAt"> = {
  name: "",
  contactPersons: [{ name: "", role: "", email: "", phone: "" }],
  address: "",
  rating: 5,
  paymentTerms: "30 days",
  leadTime: 7,
  isActive: true,
  notes: "",
  performance: {
    onTimeDelivery: 95,
    qualityScore: 90,
    priceCompetitiveness: 85,
  },
};

export function SuppliersDetailsCard({
  supplier,
  isCreating,
  onUpdate,
  onCreate,
  onDelete,
  onCancelCreate,
  materialCount = 0,
}: SuppliersDetailsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedSupplier, setEditedSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] =
    useState<Omit<Supplier, "id" | "createdAt">>(initialSupplierState);

  // Reset form when isCreating changes
  useEffect(() => {
    if (isCreating) {
      setNewSupplier(initialSupplierState);
    }
  }, [isCreating]);

  const handleEdit = () => {
    setEditedSupplier(supplier);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedSupplier(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!editedSupplier) return;

    if (
      !editedSupplier.name ||
      !editedSupplier.contactPersons ||
      editedSupplier.contactPersons.length === 0 ||
      !editedSupplier.contactPersons[0].name
    ) {
      toast.error(
        "Supplier Name and at least one Contact Person are required."
      );
      return;
    }

    onUpdate(editedSupplier);
    setIsEditing(false);
    setEditedSupplier(null);
    toast.success(`Supplier "${editedSupplier.name}" updated successfully!`);
  };

  const handleSaveNew = () => {
    if (
      !newSupplier.name ||
      !newSupplier.contactPersons ||
      newSupplier.contactPersons.length === 0 ||
      !newSupplier.contactPersons[0].name
    ) {
      toast.error(
        "Supplier Name and at least one Contact Person are required."
      );
      return;
    }

    const supplierToCreate: Supplier = {
      ...newSupplier,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split("T")[0],
    };

    onCreate(supplierToCreate);
    setNewSupplier(initialSupplierState);
    toast.success(`Supplier "${supplierToCreate.name}" created successfully!`);
  };

  const handleDelete = () => {
    if (!supplier) return;
    onDelete(supplier.id);
    setShowDeleteDialog(false);
    toast.success(`Supplier "${supplier.name}" deleted successfully!`);
  };

  const updateField = <K extends keyof Supplier>(
    field: K,
    value: Supplier[K]
  ) => {
    if (isEditing && editedSupplier) {
      setEditedSupplier({ ...editedSupplier, [field]: value });
    }
  };

  const updateNewField = <K extends keyof typeof initialSupplierState>(
    field: K,
    value: (typeof initialSupplierState)[K]
  ) => {
    setNewSupplier({ ...newSupplier, [field]: value });
  };

  const addContactPerson = () => {
    if (isCreating) {
      setNewSupplier({
        ...newSupplier,
        contactPersons: [
          ...(newSupplier.contactPersons || []),
          { name: "", role: "", email: "", phone: "" },
        ],
      });
    } else if (isEditing && editedSupplier) {
      setEditedSupplier({
        ...editedSupplier,
        contactPersons: [
          ...(editedSupplier.contactPersons || []),
          { name: "", role: "", email: "", phone: "" },
        ],
      });
    }
  };

  const removeContactPerson = (index: number) => {
    if (isCreating) {
      const updated = [...(newSupplier.contactPersons || [])];
      if (updated.length > 1) {
        updated.splice(index, 1);
        setNewSupplier({ ...newSupplier, contactPersons: updated });
      }
    } else if (isEditing && editedSupplier) {
      const updated = [...(editedSupplier.contactPersons || [])];
      if (updated.length > 1) {
        updated.splice(index, 1);
        setEditedSupplier({ ...editedSupplier, contactPersons: updated });
      }
    }
  };

  // Determine what to display
  let displaySupplier: Supplier | Omit<Supplier, "id" | "createdAt"> | null =
    null;
  let mode: "view" | "edit" | "create" = "view";

  if (isCreating) {
    displaySupplier = newSupplier;
    mode = "create";
  } else if (isEditing) {
    displaySupplier = editedSupplier;
    mode = "edit";
  } else {
    displaySupplier = supplier;
    mode = "view";
  }

  return (
    <>
      <Card className="border-2 h-[calc(100vh-12rem)] gap-0">
        <CardHeader className="border-b pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {mode === "create" || mode === "edit" ? (
                <Input
                  value={displaySupplier?.name || ""}
                  onChange={(e) =>
                    mode === "create"
                      ? updateNewField("name", e.target.value)
                      : updateField("name", e.target.value)
                  }
                  className="text-2xl font-bold h-auto py-1 px-2"
                  placeholder="Supplier Name"
                />
              ) : (
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  {displaySupplier?.name}
                </CardTitle>
              )}
              <div className="flex items-center gap-2 mt-2">
                {mode !== "create" && (
                  <>
                    <Badge
                      variant={
                        (displaySupplier as Supplier)?.isActive
                          ? "default"
                          : "secondary"
                      }
                    >
                      {(displaySupplier as Supplier)?.isActive
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {displaySupplier?.rating}
                      </span>
                    </div>
                    {materialCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Package className="h-3 w-3" />
                        {materialCount} materials
                      </Badge>
                    )}
                  </>
                )}
                {mode === "create" && (
                  <Badge variant="default" className="gap-1">
                    Creating New Supplier
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {mode === "create" ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancelCreate}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveNew} className="gap-1">
                    <Save className="h-4 w-4" />
                    Create
                  </Button>
                </>
              ) : mode === "edit" ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} className="gap-1">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEdit}
                    className="gap-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <ScrollArea className="h-[calc(100%-5rem)] min-h-0">
          <CardContent className="pt-6 space-y-6">
            {/* Contact Information */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </h3>
                {(mode === "edit" || mode === "create") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addContactPerson}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Contact
                  </Button>
                )}
              </div>
              {mode === "view" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {displaySupplier?.contactPersons?.map((contact, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-muted/20"
                    >
                      <div>
                        <p className="font-medium mt-1">{contact.name}</p>
                        {contact.role && (
                          <p className="font-medium mt-1">{contact.role}</p>
                        )}
                        {contact.email && (
                          <p className="font-medium mt-1 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {contact.email}
                          </p>
                        )}
                        {contact.phone && (
                          <p className="font-medium mt-1 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {contact.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {displaySupplier?.contactPersons?.map((contact, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-muted/20 relative"
                    >
                      {displaySupplier.contactPersons!.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeContactPerson(index)}
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Name *
                          </Label>
                          <Input
                            value={contact.name || ""}
                            onChange={(e) => {
                              const updatedContacts = [
                                ...(displaySupplier.contactPersons || []),
                              ];
                              updatedContacts[index] = {
                                ...updatedContacts[index],
                                name: e.target.value,
                              };
                              mode === "create"
                                ? updateNewField(
                                    "contactPersons",
                                    updatedContacts
                                  )
                                : updateField(
                                    "contactPersons",
                                    updatedContacts
                                  );
                            }}
                            placeholder="Contact Name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Role
                          </Label>
                          <Input
                            value={contact.role || ""}
                            onChange={(e) => {
                              const updatedContacts = [
                                ...(displaySupplier.contactPersons || []),
                              ];
                              updatedContacts[index] = {
                                ...updatedContacts[index],
                                role: e.target.value,
                              };
                              mode === "create"
                                ? updateNewField(
                                    "contactPersons",
                                    updatedContacts
                                  )
                                : updateField(
                                    "contactPersons",
                                    updatedContacts
                                  );
                            }}
                            placeholder="Role"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Email
                          </Label>
                          <Input
                            type="email"
                            value={contact.email || ""}
                            onChange={(e) => {
                              const updatedContacts = [
                                ...(displaySupplier.contactPersons || []),
                              ];
                              updatedContacts[index] = {
                                ...updatedContacts[index],
                                email: e.target.value,
                              };
                              mode === "create"
                                ? updateNewField(
                                    "contactPersons",
                                    updatedContacts
                                  )
                                : updateField(
                                    "contactPersons",
                                    updatedContacts
                                  );
                            }}
                            placeholder="Email"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Phone
                          </Label>
                          <Input
                            value={contact.phone || ""}
                            onChange={(e) => {
                              const updatedContacts = [
                                ...(displaySupplier.contactPersons || []),
                              ];
                              updatedContacts[index] = {
                                ...updatedContacts[index],
                                phone: e.target.value,
                              };
                              mode === "create"
                                ? updateNewField(
                                    "contactPersons",
                                    updatedContacts
                                  )
                                : updateField(
                                    "contactPersons",
                                    updatedContacts
                                  );
                            }}
                            placeholder="Phone"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Address */}
            <div>
              <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              {mode === "view" ? (
                <p className="font-medium">
                  {displaySupplier?.address || "No address provided"}
                </p>
              ) : (
                <Textarea
                  value={displaySupplier?.address || ""}
                  onChange={(e) =>
                    mode === "create"
                      ? updateNewField("address", e.target.value)
                      : updateField("address", e.target.value)
                  }
                  placeholder="Complete address"
                  rows={3}
                />
              )}
            </div>

            <Separator />

            {/* Business Terms */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Business Terms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Payment Terms</Label>
                  {mode === "view" ? (
                    <p className="font-medium mt-1">
                      {displaySupplier?.paymentTerms}
                    </p>
                  ) : (
                    <Select
                      value={displaySupplier?.paymentTerms}
                      onValueChange={(value) =>
                        mode === "create"
                          ? updateNewField("paymentTerms", value)
                          : updateField("paymentTerms", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TERMS.map((term) => (
                          <SelectItem key={term} value={term}>
                            {term}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Lead Time</Label>
                  {mode === "view" ? (
                    <p className="font-medium mt-1 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {displaySupplier?.leadTime} days
                    </p>
                  ) : (
                    <Input
                      type="number"
                      min="1"
                      value={displaySupplier?.leadTime || 0}
                      onChange={(e) =>
                        mode === "create"
                          ? updateNewField("leadTime", Number(e.target.value))
                          : updateField("leadTime", Number(e.target.value))
                      }
                      className="mt-1"
                    />
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Rating</Label>
                  {mode === "view" ? (
                    <p className="font-medium mt-1">
                      {displaySupplier?.rating} / 5
                    </p>
                  ) : (
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={displaySupplier?.rating || 0}
                      onChange={(e) =>
                        mode === "create"
                          ? updateNewField("rating", Number(e.target.value))
                          : updateField("rating", Number(e.target.value))
                      }
                      className="mt-1"
                    />
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Performance Metrics */}
            {mode !== "create" &&
              (displaySupplier as Supplier)?.performance && (
                <>
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Metrics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm text-muted-foreground">
                            On-Time Delivery
                          </Label>
                          <Award className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">
                          {
                            (displaySupplier as Supplier).performance!
                              .onTimeDelivery
                          }
                          %
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm text-muted-foreground">
                            Quality Score
                          </Label>
                          <Star className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">
                          {
                            (displaySupplier as Supplier).performance!
                              .qualityScore
                          }
                          %
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm text-muted-foreground">
                            Price Competitiveness
                          </Label>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">
                          {
                            (displaySupplier as Supplier).performance!
                              .priceCompetitiveness
                          }
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

            {/* Status & Notes */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Additional Details</h3>
              <div className="space-y-4">
                {(mode === "edit" || mode === "create") && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={displaySupplier?.isActive}
                      onCheckedChange={(checked) =>
                        mode === "create"
                          ? updateNewField("isActive", checked)
                          : updateField("isActive", checked)
                      }
                    />
                    <Label>Active Supplier</Label>
                  </div>
                )}
                {mode !== "create" && (
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      Created Date
                    </Label>
                    <p className="font-medium">
                      {(displaySupplier as Supplier)?.createdAt}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground mb-2 block">
                    Notes
                  </Label>
                  {mode === "view" ? (
                    <p className="font-medium text-sm">
                      {displaySupplier?.notes || "No notes available"}
                    </p>
                  ) : (
                    <Textarea
                      value={displaySupplier?.notes || ""}
                      onChange={(e) =>
                        mode === "create"
                          ? updateNewField("notes", e.target.value)
                          : updateField("notes", e.target.value)
                      }
                      placeholder="Additional notes about the supplier"
                      rows={4}
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </ScrollArea>
      </Card>

      {mode === "view" && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete supplier &quot;
                {(displaySupplier as Supplier)?.name}&quot;? This action will
                mark the supplier as inactive.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
