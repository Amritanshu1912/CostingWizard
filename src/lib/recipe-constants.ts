// recipe-constants.ts

/**
 * Defines the available units for ingredients and their conversion factors
 * to the base unit (kilogram: kg).
 * * Conversion Recipe: quantity_in_kg = quantity_input * conversionFactor
 */
export const INGREDIENT_UNITS = [
    { value: "kg", label: "Kilograms (kg)", factor: 1 },
    { value: "g", label: "Grams (g)", factor: 0.001 },
    { value: "L", label: "Litres (L)", factor: 1 }, // Assuming 1L = 1kg (density of water) for simplicity
    { value: "mL", label: "Millilitres (mL)", factor: 0.001 }, // Assuming 1mL = 1g
] as const;

export type IngredientUnitValue = typeof INGREDIENT_UNITS[number]['value'];

/**
 * Converts a quantity in a specific unit to the base unit (kilograms).
 * This is essential for calculating the total batch cost based on Material costPerKg.
 * * @param quantity The amount of the ingredient.
 * @param unit The unit of measure (e.g., 'g', 'L').
 * @returns The converted quantity in Kilograms (kg).
 */
export function convertToKilograms(quantity: number, unit: IngredientUnitValue): number {
    const unitDef = INGREDIENT_UNITS.find(u => u.value === unit);
    if (!unitDef) {
        console.error(`Unknown unit: ${unit}. Defaulting to kg.`);
        return quantity; // Default to 1 (kg)
    }
    return quantity * unitDef.factor;
}

// Default unit for new ingredients
export const DEFAULT_INGREDIENT_UNIT: IngredientUnitValue = "kg";
