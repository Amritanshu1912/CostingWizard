import { useState, useMemo } from "react";
import type { Supplier } from "@/lib/types";

export function useSuppliers(initialSuppliers: Supplier[]) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.isActive !== false),
    [suppliers]
  );

  const filteredSuppliers = useMemo(() => {
    return activeSuppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeSuppliers, searchTerm]);

  const selectedSupplier = useMemo(() => {
    return suppliers.find((s) => s.id === selectedSupplierId) || null;
  }, [suppliers, selectedSupplierId]);

  const addSupplier = (newSupplier: Supplier) => {
    setSuppliers((prev) => [...prev, newSupplier]);
    setSelectedSupplierId(newSupplier.id);
  };

  const updateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s))
    );
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: false } : s))
    );
    if (selectedSupplierId === id) {
      setSelectedSupplierId(null);
    }
  };

  return {
    suppliers,
    activeSuppliers,
    filteredSuppliers,
    selectedSupplier,
    selectedSupplierId,
    searchTerm,
    setSearchTerm,
    setSelectedSupplierId,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };
}
