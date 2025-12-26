// src/app/products/components/products-forms.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  usePackagingOptions,
  useLabelOptions,
  useRecipeOptions,
  useRecipeVariantOptions,
} from "@/hooks/product-hooks/use-product-options";
import {
  getRecipeCostPerKg,
  calculateLiveMargin,
} from "@/hooks/product-hooks/use-product-costs";
import type { CapacityUnit } from "@/types/shared-types";
import type {
  Product,
  ProductVariant,
  ProductFormData,
  VariantFormData,
} from "@/types/product-types";
import { Check, Package, Tag, X, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { ValidationErrorDialog } from "./products-dialogs";
import {
  generateSKU,
  validateProductForm,
  validateVariantForm,
  getMarginColors,
} from "@/utils/product-utils";
import { calculatePriceWithTax } from "@/utils/unit-conversion-utils";
import { normalizeToKg } from "@/utils/unit-conversion-utils";
// ============================================================================
// PRODUCT FORM
// ============================================================================

interface ProductFormProps {
  initialProduct?: Product;
  onSave: (product: ProductFormData) => void;
  onCancel: () => void;
}

/**
 * Form component for creating/editing products
 * Handles recipe selection and recipe variant selection
 */
export function ProductForm({
  initialProduct,
  onSave,
  onCancel,
}: ProductFormProps) {
  const recipes = useRecipeOptions();
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    name: initialProduct?.name || "",
    description: initialProduct?.description || "",
    status: initialProduct?.status || "draft",
    recipeId: initialProduct?.recipeId || "",
    isRecipeVariant: initialProduct?.isRecipeVariant || false,
  });

  // Track base recipe ID separately for variant selection
  const [baseRecipeId, setBaseRecipeId] = useState<string>(() => {
    if (!initialProduct) return "";
    return initialProduct.isRecipeVariant ? "" : initialProduct.recipeId;
  });

  // Get variants for selected base recipe
  const variants = useRecipeVariantOptions(baseRecipeId || null);

  // Compute the actual base recipe ID (for editing recipe variants)
  const computedBaseRecipeId = (() => {
    if (initialProduct?.isRecipeVariant && variants.length > 0) {
      const variant = variants.find((v) => v.id === initialProduct.recipeId);
      if (variant) {
        // This is a simplification - in reality we'd need to look up the variant's originalRecipeId
        return variant.id;
      }
    }
    return baseRecipeId;
  })();

  /**
   * Handle recipe selection (base recipe)
   */
  const handleRecipeChange = (recipeId: string) => {
    setBaseRecipeId(recipeId);
    setFormData({
      ...formData,
      recipeId,
      isRecipeVariant: false,
    });
  };

  /**
   * Handle variant selection (or original recipe)
   */
  const handleVariantChange = (variantValue: string) => {
    if (!baseRecipeId) return;

    if (variantValue === "original") {
      setFormData({
        ...formData,
        recipeId: baseRecipeId,
        isRecipeVariant: false,
      });
    } else {
      setFormData({
        ...formData,
        recipeId: variantValue,
        isRecipeVariant: true,
      });
    }
  };

  /**
   * Handle form submission with validation
   */
  const handleSubmit = () => {
    const errors = validateProductForm(formData);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      setValidationMessage(firstError || "Please check the form");
      setShowValidationError(true);
      return;
    }

    onSave(formData as ProductFormData);
  };

  const currentVariantValue = formData.isRecipeVariant
    ? formData.recipeId
    : "original";

  return (
    <>
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-2">
            <Label className="text-sm font-medium">Product Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Harpic Toilet Cleaner"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as Product["status"] })
              }
            >
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Recipe Selection */}
        <div className="flex flex-row gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Base Recipe *</Label>
            <Select
              value={computedBaseRecipeId}
              onValueChange={handleRecipeChange}
            >
              <SelectTrigger className="h-9 w-84">
                <SelectValue placeholder="Select recipe" />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name}
                    <span className="text-xs text-muted-foreground ml-2">
                      (₹{recipe.costPerKg.toFixed(2)}/kg)
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipe Variant Selection */}
          {baseRecipeId && variants.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Recipe Version (Optional)
              </Label>
              <Select
                value={currentVariantValue}
                onValueChange={handleVariantChange}
              >
                <SelectTrigger className="h-9 w-84">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">
                    Original Recipe
                    <span className="text-xs text-muted-foreground ml-2">
                      (Base formulation)
                    </span>
                  </SelectItem>
                  {variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name}
                      <span className="text-xs text-muted-foreground ml-2">
                        (₹{variant.costPerKg.toFixed(2)}/kg)
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Product description..."
            rows={3}
            className="text-sm resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSubmit} size="sm" className="flex-1 h-9">
            <Check className="h-4 w-4 mr-2" />
            {initialProduct ? "Update" : "Create"}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="flex-1 h-9"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      <ValidationErrorDialog
        open={showValidationError}
        title="Validation Error"
        message={validationMessage}
        onClose={() => setShowValidationError(false)}
      />
    </>
  );
}

// ============================================================================
// VARIANT FORM
// ============================================================================

interface VariantFormProps {
  productId: string;
  initialVariant?: ProductVariant;
  onSave: (variant: ProductVariant) => void;
  onCancel: () => void;
}

/**
 * Form component for creating/editing product variants
 * Includes real-time margin calculation below selling price input
 */
export function VariantForm({
  productId,
  initialVariant,
  onSave,
  onCancel,
}: VariantFormProps) {
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  // Get options for dropdowns
  const packagingOptions = usePackagingOptions();
  const labelOptions = useLabelOptions();

  // Form state
  const [formData, setFormData] = useState<Partial<VariantFormData>>(
    initialVariant || {
      productId,
      name: "",
      sku: generateSKU(),
      fillQuantity: 1000,
      fillUnit: "gm",
      labelsPerUnit: 2,
      sellingPricePerUnit: 0,
      targetProfitMargin: 30,
      isActive: true,
    }
  );

  // Real-time cost and margin calculation
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [liveMargin, setLiveMargin] = useState<number>(0);

  /**
   * Calculate estimated cost when form data changes
   */
  useEffect(() => {
    const calculateCost = async () => {
      // Get recipe cost
      const recipeCost = await getRecipeCostPerKg(productId);

      // Get packaging cost
      const selectedPackaging = packagingOptions.find(
        (p) => p.id === formData.packagingSelectionId
      );
      const packagingCost = selectedPackaging
        ? calculatePriceWithTax(selectedPackaging.unitPrice, 18) // Assume 18% tax for estimate
        : 0;

      // Get label costs (simplified - assume 18% tax)
      const frontLabel = labelOptions.find(
        (l) => l.id === formData.frontLabelSelectionId
      );
      const backLabel = labelOptions.find(
        (l) => l.id === formData.backLabelSelectionId
      );
      const labelsCost =
        calculatePriceWithTax(frontLabel?.unitPrice || 0, 18) +
        calculatePriceWithTax(backLabel?.unitPrice || 0, 18);

      // Calculate total
      const fillInKg = normalizeToKg(
        formData.fillQuantity || 1000,
        formData.fillUnit || "gm"
      );
      const recipeCostForFill =
        (recipeCost.costPerKg + recipeCost.taxPerKg) * fillInKg;
      const totalCost = recipeCostForFill + packagingCost + labelsCost;

      setEstimatedCost(totalCost);

      // Calculate margin
      if (formData.sellingPricePerUnit && formData.sellingPricePerUnit > 0) {
        const margin = calculateLiveMargin(
          formData.sellingPricePerUnit,
          totalCost
        );
        setLiveMargin(margin);
      }
    };

    calculateCost();
  }, [
    productId,
    formData.fillQuantity,
    formData.fillUnit,
    formData.packagingSelectionId,
    formData.frontLabelSelectionId,
    formData.backLabelSelectionId,
    formData.sellingPricePerUnit,
    packagingOptions,
    labelOptions,
  ]);

  /**
   * Handle form submission with validation
   */
  const handleSubmit = () => {
    const errors = validateVariantForm(formData);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      setValidationMessage(firstError || "Please check the form");
      setShowValidationError(true);
      return;
    }

    // Create complete variant object
    const variant: ProductVariant = {
      id: initialVariant?.id || crypto.randomUUID(),
      productId,
      name: formData.name!,
      sku: formData.sku!,
      fillQuantity: formData.fillQuantity || 1000,
      fillUnit: formData.fillUnit || "gm",
      packagingSelectionId: formData.packagingSelectionId!,
      frontLabelSelectionId: formData.frontLabelSelectionId,
      backLabelSelectionId: formData.backLabelSelectionId,
      labelsPerUnit: formData.labelsPerUnit || 2,
      sellingPricePerUnit: formData.sellingPricePerUnit || 0,
      targetProfitMargin: formData.targetProfitMargin,
      minimumProfitMargin: formData.minimumProfitMargin,
      distributionChannels: formData.distributionChannels,
      unitsPerCase: formData.unitsPerCase,
      sellingPricePerCase: formData.sellingPricePerCase,
      isActive: formData.isActive ?? true,
      notes: formData.notes,
      createdAt: initialVariant?.createdAt || new Date().toISOString(),
    };

    onSave(variant);
  };

  // Get margin colors for display
  const marginColors = getMarginColors(
    liveMargin,
    formData.minimumProfitMargin
  );

  return (
    <>
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Variant Name *</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., 1kg Bottle"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">SKU *</Label>
            <Input
              value={formData.sku || ""}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              placeholder="Unique code"
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fill Quantity *</Label>
              <Input
                type="number"
                value={formData.fillQuantity || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fillQuantity: Number(e.target.value),
                  })
                }
                placeholder="1000"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Unit</Label>
              <Select
                value={formData.fillUnit}
                onValueChange={(value) =>
                  setFormData({ ...formData, fillUnit: value as CapacityUnit })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gm">gm</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Packaging Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Packaging *
          </Label>
          <Select
            value={formData.packagingSelectionId}
            onValueChange={(value) =>
              setFormData({ ...formData, packagingSelectionId: value })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select packaging from supplier" />
            </SelectTrigger>
            <SelectContent>
              {packagingOptions.map((pd) => (
                <SelectItem key={pd.id} value={pd.id}>
                  {pd.displayName} - ₹{pd.unitPrice}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Labels Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Front Label (Optional)
            </Label>
            <Select
              value={formData.frontLabelSelectionId || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  frontLabelSelectionId: value || undefined,
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select front label" />
              </SelectTrigger>
              <SelectContent>
                {labelOptions.map((ld) => (
                  <SelectItem key={ld.id} value={ld.id}>
                    {ld.displayName} - ₹{ld.unitPrice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Back Label (Optional)
            </Label>
            <Select
              value={formData.backLabelSelectionId || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  backLabelSelectionId: value || undefined,
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select back label" />
              </SelectTrigger>
              <SelectContent>
                {labelOptions.map((ld) => (
                  <SelectItem key={ld.id} value={ld.id}>
                    {ld.displayName} - ₹{ld.unitPrice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pricing with Real-time Margin */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Selling Price per Unit *
            </Label>
            <Input
              type="number"
              value={formData.sellingPricePerUnit || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sellingPricePerUnit: Number(e.target.value),
                })
              }
              placeholder="₹150"
              className="h-9"
            />
            {/* Real-time margin display */}
            {formData.sellingPricePerUnit &&
              formData.sellingPricePerUnit > 0 &&
              estimatedCost > 0 && (
                <div
                  className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-md ${marginColors.bg}`}
                >
                  <TrendingUp className={`h-3 w-3 ${marginColors.text}`} />
                  <span className={marginColors.text}>
                    Margin: {liveMargin.toFixed(1)}%
                    {formData.targetProfitMargin && (
                      <span className="ml-1 opacity-70">
                        (Target: {formData.targetProfitMargin}%)
                      </span>
                    )}
                  </span>
                </div>
              )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Target Margin (%)</Label>
            <Input
              type="number"
              value={formData.targetProfitMargin || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetProfitMargin: Number(e.target.value),
                })
              }
              placeholder="30"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Minimum Margin (%)</Label>
            <Input
              type="number"
              value={formData.minimumProfitMargin || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minimumProfitMargin: Number(e.target.value),
                })
              }
              placeholder="20"
              className="h-9"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Notes</Label>
          <Textarea
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Additional notes..."
            rows={3}
            className="text-sm resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button onClick={handleSubmit} className="flex-1 h-9">
            <Check className="h-4 w-4 mr-2" />
            {initialVariant ? "Update Variant" : "Create Variant"}
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1 h-9">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      <ValidationErrorDialog
        open={showValidationError}
        title="Validation Error"
        message={validationMessage}
        onClose={() => setShowValidationError(false)}
      />
    </>
  );
}
