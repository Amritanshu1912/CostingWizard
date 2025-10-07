"use client";

import React from "react";

import { useAutosave } from "@/hooks/use-autosave";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { sampleMaterials } from "@/lib/constants";
import type { FormulationMaterial, SavedFormulation } from "@/lib/types";

export function FormulationCalculator() {
  const [savedFormulations, setSavedFormulations] = useLocalStorage<
    SavedFormulation[]
  >("formulations", []);
  const [materials, setMaterials] = useLocalStorage(
    "materials",
    sampleMaterials
  );
  const [currentMaterials, setCurrentMaterials] = React.useState<
    FormulationMaterial[]
  >([]);
  const [totalCost, setTotalCost] = React.useState(0);
  const [totalWeight, setTotalWeight] = React.useState(0);

  useAutosave({
    key: "current-formulation",
    data: { materials: currentMaterials, totalCost, totalWeight },
    enabled: currentMaterials.length > 0,
    onSave: () => {
      // Optional: Update saved formulations list
      const timestamp = Date.now();
      const formulation = {
        id: timestamp.toString(),
        name: `Formulation ${new Date().toLocaleString()}`,
        materials: currentMaterials,
        totalCost,
        totalWeight,
        timestamp,
      };
      setSavedFormulations((prev) => [formulation, ...prev.slice(0, 9)]); // Keep last 10
    },
  });
}
