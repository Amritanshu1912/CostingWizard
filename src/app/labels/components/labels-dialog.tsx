import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Label } from "@/lib/types";
import {
  LABEL_TYPES,
  PRINTING_TYPES,
  MATERIAL_TYPES,
  SHAPE_TYPES,
  DEFAULT_LABEL_FORM,
} from "./labels-config";

interface LabelsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: Label) => void;
  initialLabel?: Label | null;
}

export function LabelsDialog({
  isOpen,
  onClose,
  onSave,
  initialLabel,
}: LabelsDialogProps) {
  const [formData, setFormData] = useState<Partial<Label>>(DEFAULT_LABEL_FORM);
  const [colorInput, setColorInput] = useState("");

  const isEditing = !!initialLabel;
  const title = isEditing ? "Edit Label" : "Add New Label";
  const description = isEditing
    ? "Update the label details."
    : "Enter the details for the new label item.";

  useEffect(() => {
    if (initialLabel) {
      setFormData(initialLabel);
    } else {
      setFormData(DEFAULT_LABEL_FORM);
    }
  }, [initialLabel]);

  const handleChange = (field: keyof Label, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddColor = () => {
    if (colorInput.trim() && !formData.colors?.includes(colorInput.trim())) {
      const newColors = [...(formData.colors || []), colorInput.trim()];
      handleChange("colors", newColors);
      setColorInput("");
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    const newColors =
      formData.colors?.filter((color) => color !== colorToRemove) || [];
    handleChange("colors", newColors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type) {
      toast.error("Please fill in the label name and type.");
      return;
    }

    let savedLabel: Label;

    if (isEditing) {
      savedLabel = {
        ...(formData as Label),
        updatedAt: new Date().toISOString(),
      };
    } else {
      const newId = Date.now().toString();
      savedLabel = {
        ...formData,
        id: newId,
        createdAt: new Date().toISOString(),
      } as Label;
    }

    onSave(savedLabel);
    onClose();
    if (!isEditing) {
      setFormData(DEFAULT_LABEL_FORM);
      setColorInput("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <UILabel htmlFor="label-name" className="text-foreground">
              Label Name *
            </UILabel>
            <Input
              id="label-name"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter label name"
              className="focus-enhanced"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <UILabel htmlFor="type" className="text-foreground">
                Type *
              </UILabel>
              <Select
                value={formData.type || "sticker"}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger className="focus-enhanced">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LABEL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <UILabel htmlFor="printing-type" className="text-foreground">
                Printing Type
              </UILabel>
              <Select
                value={formData.printingType || "color"}
                onValueChange={(value) => handleChange("printingType", value)}
              >
                <SelectTrigger className="focus-enhanced">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRINTING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <UILabel htmlFor="material" className="text-foreground">
                Material
              </UILabel>
              <Select
                value={formData.material || "paper"}
                onValueChange={(value) => handleChange("material", value)}
              >
                <SelectTrigger className="focus-enhanced">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_TYPES.map((material) => (
                    <SelectItem key={material.value} value={material.value}>
                      {material.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <UILabel htmlFor="shape" className="text-foreground">
                Shape
              </UILabel>
              <Select
                value={formData.shape || "rectangular"}
                onValueChange={(value) => handleChange("shape", value)}
              >
                <SelectTrigger className="focus-enhanced">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHAPE_TYPES.map((shape) => (
                    <SelectItem key={shape.value} value={shape.value}>
                      {shape.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <UILabel htmlFor="size" className="text-foreground">
              Size
            </UILabel>
            <Input
              id="size"
              value={formData.size || ""}
              onChange={(e) => handleChange("size", e.target.value)}
              placeholder="e.g., 50x30mm"
              className="focus-enhanced"
            />
          </div>

          <div>
            <UILabel className="text-foreground">Colors</UILabel>
            <div className="flex gap-2 mb-2">
              <Input
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder="Add color"
                className="focus-enhanced"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddColor())
                }
              />
              <Button type="button" onClick={handleAddColor} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.colors?.map((color) => (
                <Badge
                  key={color}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleRemoveColor(color)}
                >
                  {color} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <UILabel htmlFor="notes" className="text-foreground">
              Notes (Optional)
            </UILabel>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes..."
              className="focus-enhanced"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <Button type="submit" className="flex-1 btn-secondary">
              {isEditing ? "Update Label" : "Add Label"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
