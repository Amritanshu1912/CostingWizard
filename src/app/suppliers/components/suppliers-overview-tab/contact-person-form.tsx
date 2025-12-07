// src/app/suppliers/components/suppliers-overview-tab/contact-person-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContactPerson } from "@/types/supplier-types";
import { Mail, Phone, Plus, X } from "lucide-react";

interface ContactPersonFormProps {
  contacts: ContactPerson[];
  isEditing: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof ContactPerson, value: string) => void;
}

/**
 * Form component for managing supplier contact persons.
 * Supports view and edit modes with add/remove functionality.
 */
export function ContactPersonForm({
  contacts,
  isEditing,
  onAdd,
  onRemove,
  onUpdate,
}: ContactPersonFormProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Contact Information
        </h3>
        {isEditing && (
          <Button size="sm" variant="outline" onClick={onAdd} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contacts.map((contact, index) =>
          isEditing ? (
            <EditableContactCard
              key={index}
              contact={contact}
              index={index}
              canRemove={contacts.length > 1}
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ) : (
            <ViewContactCard key={index} contact={contact} />
          )
        )}
      </div>
    </div>
  );
}

/**
 * Displays contact person details in view mode
 */
function ViewContactCard({ contact }: { contact: ContactPerson }) {
  return (
    <div className="border rounded-lg p-4 bg-muted/20">
      <p className="font-medium">{contact.name}</p>
      {contact.role && (
        <p className="text-sm text-muted-foreground mt-1">{contact.role}</p>
      )}
      {contact.email && (
        <p className="text-sm mt-2 flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {contact.email}
        </p>
      )}
      {contact.phone && (
        <p className="text-sm mt-1 flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {contact.phone}
        </p>
      )}
    </div>
  );
}

/**
 * Editable contact person card with remove button
 */
function EditableContactCard({
  contact,
  index,
  canRemove,
  onRemove,
  onUpdate,
}: {
  contact: ContactPerson;
  index: number;
  canRemove: boolean;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof ContactPerson, value: string) => void;
}) {
  return (
    <div className="border rounded-lg p-4 bg-muted/20 relative">
      {canRemove && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Name *</Label>
          <Input
            value={contact.name}
            onChange={(e) => onUpdate(index, "name", e.target.value)}
            placeholder="Contact Name"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Role</Label>
          <Input
            value={contact.role}
            onChange={(e) => onUpdate(index, "role", e.target.value)}
            placeholder="Role"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <Input
            type="email"
            value={contact.email}
            onChange={(e) => onUpdate(index, "email", e.target.value)}
            placeholder="Email"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Phone</Label>
          <Input
            value={contact.phone}
            onChange={(e) => onUpdate(index, "phone", e.target.value)}
            placeholder="Phone"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}
