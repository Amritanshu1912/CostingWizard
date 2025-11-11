"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import {
  Building2,
  Star,
  Edit2,
  Trash2,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  TrendingUp,
  Award,
  DollarSign,
  Package,
} from "lucide-react";
import type { Supplier } from "@/lib/types";
import { PAYMENT_TERMS } from "./suppliers-constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SuppliersDetailsCardProps {
  supplier: Supplier | null;
  onUpdate: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  materialCount?: number;
}

export function SuppliersDetailsCard({
  supplier,
  onUpdate,
  onDelete,
  materialCount = 0,
}: SuppliersDetailsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedSupplier, setEditedSupplier] = useState<Supplier | null>(null);

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
    if (!editedSupplier) return;
    setEditedSupplier({ ...editedSupplier, [field]: value });
  };

  const displaySupplier = isEditing ? editedSupplier : supplier;

  if (!displaySupplier) {
    return (
      <Card className="border-2 border-dashed h-[calc(100vh-12rem)]">
        <CardContent className="flex flex-col items-center justify-center h-full py-12">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-muted-foreground mb-2">
            No Supplier Selected
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Select a supplier from the list to view and edit their details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2 h-[calc(100vh-12rem)] gap-0">
        <CardHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedSupplier?.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="text-2xl font-bold h-auto py-1 px-2"
                  placeholder="Supplier Name"
                />
              ) : (
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  {displaySupplier.name}
                </CardTitle>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={displaySupplier.isActive ? "default" : "secondary"}
                >
                  {displaySupplier.isActive ? "Active" : "Inactive"}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{displaySupplier.rating}</span>
                </div>
                {materialCount > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Package className="h-3 w-3" />
                    {materialCount} materials
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
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
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </h3>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {editedSupplier?.contactPersons?.map((contact, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-muted/20"
                    >
                      <div className="space-y-4">
                        <div>
                          <Label className="text-muted-foreground">Name</Label>
                          <Input
                            value={contact.name || ""}
                            onChange={(e) => {
                              const updatedContacts = [
                                ...(editedSupplier.contactPersons || []),
                              ];
                              updatedContacts[index] = {
                                ...updatedContacts[index],
                                name: e.target.value,
                              };
                              updateField("contactPersons", updatedContacts);
                            }}
                            className="mt-0"
                            placeholder="Contact Name"
                          />
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Role</Label>
                          <Input
                            value={contact.role || ""}
                            onChange={(e) => {
                              const updatedContacts = [
                                ...(editedSupplier.contactPersons || []),
                              ];
                              updatedContacts[index] = {
                                ...updatedContacts[index],
                                role: e.target.value,
                              };
                              updateField("contactPersons", updatedContacts);
                            }}
                            className="mt-0"
                            placeholder="Role"
                          />
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <Input
                            type="email"
                            value={contact.email || ""}
                            onChange={(e) => {
                              const updatedContacts = [
                                ...(editedSupplier.contactPersons || []),
                              ];
                              updatedContacts[index] = {
                                ...updatedContacts[index],
                                email: e.target.value,
                              };
                              updateField("contactPersons", updatedContacts);
                            }}
                            className="mt-0"
                            placeholder="Email"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <Label className="text-muted-foreground">Phone</Label>
                          <Input
                            value={contact.phone || ""}
                            onChange={(e) => {
                              const updatedContacts = [
                                ...(editedSupplier.contactPersons || []),
                              ];
                              updatedContacts[index] = {
                                ...updatedContacts[index],
                                phone: e.target.value,
                              };
                              updateField("contactPersons", updatedContacts);
                            }}
                            className="mt-0"
                            placeholder="Phone"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {displaySupplier.contactPersons?.map((contact, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-muted/20"
                    >
                      <div className="">
                        <div>
                          {/* <Label className="text-muted-foreground">Name</Label> */}
                          <p className="font-medium mt-1">{contact.name}</p>
                        </div>
                        {contact.role && (
                          <div>
                            {/* <Label className="text-muted-foreground">
                              Role
                            </Label> */}
                            <p className="font-medium mt-1">{contact.role}</p>
                          </div>
                        )}
                        {contact.email && (
                          <div>
                            {/* <Label className="text-muted-foreground">
                              Email
                            </Label> */}
                            <p className="font-medium mt-1 flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {contact.email}
                            </p>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="md:col-span-3">
                            {/* <Label className="text-muted-foreground">
                              Phone
                            </Label> */}
                            <p className="font-medium mt-1 flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {contact.phone}
                            </p>
                          </div>
                        )}
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
              {isEditing ? (
                <Textarea
                  value={editedSupplier?.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Complete address"
                  rows={3}
                />
              ) : (
                <p className="font-medium">
                  {displaySupplier.address || "No address provided"}
                </p>
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
                  {isEditing ? (
                    <Select
                      value={editedSupplier?.paymentTerms}
                      onValueChange={(value) =>
                        updateField("paymentTerms", value)
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
                  ) : (
                    <p className="font-medium mt-1">
                      {displaySupplier.paymentTerms}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Lead Time</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="1"
                      value={editedSupplier?.leadTime || 0}
                      onChange={(e) =>
                        updateField("leadTime", Number(e.target.value))
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium mt-1 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {displaySupplier.leadTime} days
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Rating</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={editedSupplier?.rating || 0}
                      onChange={(e) =>
                        updateField("rating", Number(e.target.value))
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium mt-1">
                      {displaySupplier.rating} / 5
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Performance Metrics */}
            {displaySupplier.performance && (
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
                        {displaySupplier.performance.onTimeDelivery}%
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
                        {displaySupplier.performance.qualityScore}%
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
                        {displaySupplier.performance.priceCompetitiveness}%
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
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editedSupplier?.isActive}
                      onCheckedChange={(checked) =>
                        updateField("isActive", checked)
                      }
                    />
                    <Label>Active Supplier</Label>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    Created Date
                  </Label>
                  <p className="font-medium">{displaySupplier.createdAt}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground mb-2 block">
                    Notes
                  </Label>
                  {isEditing ? (
                    <Textarea
                      value={editedSupplier?.notes || ""}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Additional notes about the supplier"
                      rows={4}
                    />
                  ) : (
                    <p className="font-medium text-sm">
                      {displaySupplier.notes || "No notes available"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </ScrollArea>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete supplier "{displaySupplier.name}"?
              This action will mark the supplier as inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
