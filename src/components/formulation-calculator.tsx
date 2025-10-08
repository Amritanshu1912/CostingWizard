"use client";

import React from "react";
import { useAutosave } from "@/hooks/use-autosave";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { MATERIALS } from "@/lib/constants";
import type { Product, ProductIngredient } from "@/lib/types";

type CurrentFormulationData = Pick<
  Product,
  "ingredients" | "totalCostPerKg" | "batchSizeKg"
>;

export function FormulationCalculator() {
  // Remove the generic type from useLocalStorage and let TypeScript infer it
  const [savedFormulations, setSavedFormulations] = useLocalStorage(
    "formulations",
    [] as Product[] // Type the initial value instead
  );

  const [materials, setMaterials] = useLocalStorage(
    "materials",
    MATERIALS // TypeScript will infer the type from MATERIALS
  );

  const [currentIngredients, setCurrentIngredients] = React.useState<
    ProductIngredient[]
  >([]);

  const [totalCostPerKg, setTotalCostPerKg] = React.useState(0);
  const [batchSizeKg, setBatchSizeKg] = React.useState(0);

  useAutosave<CurrentFormulationData>({
    key: "current-formulation",
    data: {
      ingredients: currentIngredients,
      totalCostPerKg: totalCostPerKg,
      batchSizeKg: batchSizeKg,
    },
    enabled: currentIngredients.length > 0,
    onSave: () => {
      const timestamp = Date.now().toString();
      const formulation: Product = {
        id: timestamp,
        createdAt: new Date().toISOString(),
        name: `Draft Formulation ${new Date().toLocaleString()}`,
        status: "draft",
        ingredients: currentIngredients,
        totalCostPerKg: totalCostPerKg,
        batchSizeKg: batchSizeKg,
      };

      // Remove the explicit type from 'prev' - TypeScript will infer it
      setSavedFormulations((prev) => [formulation, ...prev.slice(0, 9)]);
    },
  });

  return (
    <div>
      <h1>Formulation Calculator</h1>
      <p>
        Total Cost per Kg: {totalCostPerKg.toFixed(2)} | Batch Size:{" "}
        {batchSizeKg.toFixed(2)} Kg
      </p>
    </div>
  );
}
