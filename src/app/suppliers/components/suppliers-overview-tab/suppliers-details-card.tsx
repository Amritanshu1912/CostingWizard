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
import { useSupplierForm } from "@/hooks/supplier-hooks/use-supplier-form";
import type { Supplier, SupplierFormData } from "@/types/supplier-types";
import { INITIAL_SUPPLIER_STATE, PAYMENT_TERMS } from "@/types/supplier-types";
import {
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Edit2,
  MapPin,
  Package,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ContactPersonForm } from "./contact-person-form";
import { PerformanceMetrics } from "./performance-metrics";

interface SuppliersDetailsCardProps {
  supplier: Supplier | null;
  isCreating: boolean;
  onCreate: (data: SupplierFormData) => Promise<void>;
  onUpdate: (id: string, data: Partial<SupplierFormData>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCancelCreate: () => void;
  materialCount?: number;
}

/**
 * Detailed supplier information card with view/edit/create modes.
 * Handles supplier data display and modification with validation.
 */
export function SuppliersDetailsCard({
  supplier,
  isCreating,
  onCreate,
  onUpdate,
  onDelete,
  onCancelCreate,
  materialCount = 0,
}: SuppliersDetailsCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formData,
    mode,
    setMode,
    updateField,
    updateContact,
    addContact,
    removeContact,
    resetForm,
    validateForm,
  } = useSupplierForm(supplier || undefined);

  // Initialize form for create mode
  useEffect(() => {
    if (isCreating) {
      resetForm();
      updateField("name", INITIAL_SUPPLIER_STATE.name);
      updateField("contactPersons", INITIAL_SUPPLIER_STATE.contactPersons);
      updateField("address", INITIAL_SUPPLIER_STATE.address);
      updateField("rating", INITIAL_SUPPLIER_STATE.rating);
      updateField("paymentTerms", INITIAL_SUPPLIER_STATE.paymentTerms);
      updateField("leadTime", INITIAL_SUPPLIER_STATE.leadTime);
      updateField("isActive", INITIAL_SUPPLIER_STATE.isActive);
      updateField("notes", INITIAL_SUPPLIER_STATE.notes);
      updateField("performance", INITIAL_SUPPLIER_STATE.performance);
      setMode("create");
    } else if (supplier) {
      resetForm(supplier);
    }
  }, [isCreating, resetForm, setMode, supplier, updateField]);

  /**
   * Handles form submission for create or edit
   */
  const handleSave = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      toast.error(validation.error || "Please fill in all required fields");
      return;
    }

    if (!formData) return;

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await onCreate(formData);
        toast.success(`Supplier "${formData.name}" created successfully!`);
      } else if (mode === "edit" && supplier) {
        await onUpdate(supplier.id, formData);
        toast.success(`Supplier "${formData.name}" updated successfully!`);
        setMode("view");
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error(
        mode === "create"
          ? "Failed to create supplier"
          : "Failed to update supplier"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Confirms and executes supplier deletion
   */
  const handleDelete = async () => {
    if (!supplier) return;

    setIsSubmitting(true);
    try {
      await onDelete(supplier.id);
      toast.success(`Supplier "${supplier.name}" deleted successfully!`);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancels edit or create mode
   */
  const handleCancel = () => {
    if (mode === "create") {
      onCancelCreate();
    } else {
      resetForm(supplier || undefined);
    }
  };

  const isEditing = mode === "edit" || mode === "create";
  const displayData = formData || supplier;

  if (!displayData) return null;

  return (
    <>
      <Card className="border-2 h-[calc(100vh-12rem)] gap-0">
        <CardHeader className="border-b pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={formData?.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="text-2xl font-bold h-auto py-1 px-2"
                  placeholder="Supplier Name"
                />
              ) : (
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  {displayData.name}
                </CardTitle>
              )}

              <SupplierMetaBadges
                supplier={supplier}
                isCreating={mode === "create"}
                materialCount={materialCount}
              />
            </div>

            <ActionButtons
              mode={mode}
              isSubmitting={isSubmitting}
              onEdit={() => setMode("edit")}
              onSave={handleSave}
              onCancel={handleCancel}
              onDelete={() => setShowDeleteDialog(true)}
            />
          </div>
        </CardHeader>

        <ScrollArea className="h-[calc(100%-5rem)] min-h-0">
          <CardContent className="pt-6 space-y-6">
            {/* Contact Information */}
            <ContactPersonForm
              contacts={formData?.contactPersons || []}
              isEditing={isEditing}
              onAdd={addContact}
              onRemove={removeContact}
              onUpdate={updateContact}
            />

            <Separator />

            {/* Address */}
            <FormField label="Address" icon={MapPin}>
              {isEditing ? (
                <Textarea
                  value={formData?.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Complete address"
                  rows={3}
                />
              ) : (
                <p className="font-medium">
                  {displayData.address || "No address provided"}
                </p>
              )}
            </FormField>

            <Separator />

            {/* Business Terms */}
            <BusinessTermsSection
              data={formData || displayData}
              isEditing={isEditing}
              onUpdate={updateField}
            />

            <Separator />

            {/* Performance Metrics */}
            {mode !== "create" && supplier?.performance && (
              <>
                <PerformanceMetrics performance={supplier.performance} />
                <Separator />
              </>
            )}

            {/* Additional Details */}
            <AdditionalDetailsSection
              data={formData || displayData}
              supplier={supplier}
              isEditing={isEditing}
              isCreating={mode === "create"}
              onUpdate={updateField}
            />
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete supplier &quot;{supplier?.name}
              &quot;? This action will mark the supplier as inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Displays supplier badges (active status, rating, material count)
 */
function SupplierMetaBadges({
  supplier,
  isCreating,
  materialCount,
}: {
  supplier: Supplier | null;
  isCreating: boolean;
  materialCount: number;
}) {
  return (
    <div className="flex items-center gap-2 mt-2">
      {isCreating ? (
        <Badge variant="default" className="gap-1">
          Creating New Supplier
        </Badge>
      ) : (
        supplier && (
          <>
            <Badge variant={supplier.isActive ? "default" : "secondary"}>
              {supplier.isActive ? "Active" : "Inactive"}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{supplier.rating}</span>
            </div>
            {materialCount > 0 && (
              <Badge variant="outline" className="gap-1">
                <Package className="h-3 w-3" />
                {materialCount} materials
              </Badge>
            )}
          </>
        )
      )}
    </div>
  );
}

/**
 * Action buttons for different modes (view/edit/create)
 */
function ActionButtons({
  mode,
  isSubmitting,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  mode: "view" | "edit" | "create";
  isSubmitting: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  if (mode === "view") {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onEdit} className="gap-1">
          <Edit2 className="h-4 w-4" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
          className="gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="gap-1"
      >
        <X className="h-4 w-4" />
        Cancel
      </Button>
      <Button
        size="sm"
        onClick={onSave}
        disabled={isSubmitting}
        className="gap-1"
      >
        <Save className="h-4 w-4" />
        {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
      </Button>
    </div>
  );
}

/**
 * Reusable form field wrapper with label and icon
 */
function FormField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-muted-foreground flex items-center gap-2 mb-2">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </Label>
      {children}
    </div>
  );
}

/**
 * Business terms section (payment terms, lead time, rating)
 */
function BusinessTermsSection({
  data,
  isEditing,
  onUpdate,
}: {
  data: SupplierFormData;
  isEditing: boolean;
  onUpdate: <K extends keyof SupplierFormData>(
    field: K,
    value: SupplierFormData[K]
  ) => void;
}) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5" />
        Business Terms
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Payment Terms">
          {isEditing ? (
            <Select
              value={data.paymentTerms}
              onValueChange={(value) => onUpdate("paymentTerms", value)}
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
            <p className="font-medium mt-1">{data.paymentTerms}</p>
          )}
        </FormField>

        <FormField label="Lead Time">
          {isEditing ? (
            <Input
              type="number"
              min="1"
              value={data.leadTime}
              onChange={(e) => onUpdate("leadTime", Number(e.target.value))}
              className="mt-1"
            />
          ) : (
            <p className="font-medium mt-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {data.leadTime} days
            </p>
          )}
        </FormField>

        <FormField label="Rating">
          {isEditing ? (
            <Input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={data.rating}
              onChange={(e) => onUpdate("rating", Number(e.target.value))}
              className="mt-1"
            />
          ) : (
            <p className="font-medium mt-1">{data.rating} / 5</p>
          )}
        </FormField>
      </div>
    </div>
  );
}

/**
 * Additional details section (active status, created date, notes)
 */
function AdditionalDetailsSection({
  data,
  supplier,
  isEditing,
  isCreating,
  onUpdate,
}: {
  data: SupplierFormData;
  supplier: Supplier | null;
  isEditing: boolean;
  isCreating: boolean;
  onUpdate: <K extends keyof SupplierFormData>(
    field: K,
    value: SupplierFormData[K]
  ) => void;
}) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">Additional Details</h3>
      <div className="space-y-4">
        {isEditing && (
          <div className="flex items-center space-x-2">
            <Switch
              checked={data.isActive}
              onCheckedChange={(checked) => onUpdate("isActive", checked)}
            />
            <Label>Active Supplier</Label>
          </div>
        )}

        {!isCreating && supplier && (
          <FormField label="Created Date" icon={Calendar}>
            <p className="font-medium">{supplier.createdAt}</p>
          </FormField>
        )}

        <FormField label="Notes">
          {isEditing ? (
            <Textarea
              value={data.notes || ""}
              onChange={(e) => onUpdate("notes", e.target.value)}
              placeholder="Additional notes about the supplier"
              rows={4}
            />
          ) : (
            <p className="font-medium text-sm">
              {data.notes || "No notes available"}
            </p>
          )}
        </FormField>
      </div>
    </div>
  );
}
