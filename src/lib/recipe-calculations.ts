// lib/recipe-calculations.ts - Core calculation logic for recipes

import type {
    RecipeIngredient,
    CapacityUnit,
    RecipeCostAnalysis,
    SupplierMaterialWithDetails,
} from "./types";

/**
 * Unit conversion factors to kg (base unit)
 */
const UNIT_TO_KG: Record<CapacityUnit, number> = {
    kg: 1,
    gm: 0.001,
    L: 1, // Assuming water density for simplicity
    ml: 0.001,
    pcs: 0, // Pieces don't convert to kg
};


/**
 * Convert any unit to kilograms
 */
export function convertToKg(quantity: number, unit: CapacityUnit): number {
    const factor = UNIT_TO_KG[unit];
    if (factor === 0) {
        console.warn(`Cannot convert ${unit} to kg. Returning original quantity.`);
        return quantity;
    }
    return quantity * factor;
}

/**
 * Convert from kg to any unit
 */
export function convertFromKg(quantityKg: number, targetUnit: CapacityUnit): number {
    const factor = UNIT_TO_KG[targetUnit];
    if (factor === 0) {
        return quantityKg;
    }
    return quantityKg / factor;
}

/**
 * Get effective price for an ingredient (locked or current)
 */
function getEffectivePrice(
    ingredient: RecipeIngredient,
    supplierMaterial: SupplierMaterialWithDetails
): { unitPrice: number; tax: number } {
    if (ingredient.lockedPricing) {
        return {
            unitPrice: ingredient.lockedPricing.unitPrice,
            tax: ingredient.lockedPricing.tax,
        };
    }
    return {
        unitPrice: supplierMaterial.unitPrice,
        tax: supplierMaterial.tax,
    };
}

/**
 * Calculate cost for a single ingredient
 */
export function calculateIngredientCost(
    ingredient: RecipeIngredient,
    supplierMaterial: SupplierMaterialWithDetails
): {
    cost: number;
    costWithTax: number;
    quantityInKg: number;
    effectiveUnitPrice: number;
    effectiveTax: number;
} {
    const { unitPrice, tax } = getEffectivePrice(ingredient, supplierMaterial);
    const quantityInKg = convertToKg(ingredient.quantity, supplierMaterial.unit);

    const cost = unitPrice * quantityInKg;
    const costWithTax = cost * (1 + tax / 100);

    return {
        cost,
        costWithTax,
        quantityInKg,
        effectiveUnitPrice: unitPrice,
        effectiveTax: tax,
    };
}

/**
 * Calculate total recipe cost
 */
export function calculateRecipeCost(
    ingredients: RecipeIngredient[],
    supplierMaterials: SupplierMaterialWithDetails[]
): {
    totalCost: number;
    totalCostWithTax: number;
    totalWeight: number;
    costPerKg: number;
    costPerKgWithTax: number;
} {
    const smMap = new Map(supplierMaterials.map((sm) => [sm.id, sm]));

    let totalCost = 0;
    let totalCostWithTax = 0;
    let totalWeight = 0;

    for (const ingredient of ingredients) {
        const sm = smMap.get(ingredient.supplierMaterialId);
        if (!sm) continue;

        const calc = calculateIngredientCost(ingredient, sm);
        totalCost += calc.cost;
        totalCostWithTax += calc.costWithTax;
        totalWeight += calc.quantityInKg;
    }

    return {
        totalCost,
        totalCostWithTax,
        totalWeight,
        costPerKg: totalWeight > 0 ? totalCost / totalWeight : 0,
        costPerKgWithTax: totalWeight > 0 ? totalCostWithTax / totalWeight : 0,
    };
}

/**
 * Generate detailed cost analysis for a recipe
 */
export function analyzeRecipeCost(
    recipeId: string,
    recipeName: string,
    ingredients: RecipeIngredient[],
    supplierMaterials: SupplierMaterialWithDetails[]
): RecipeCostAnalysis {
    const smMap = new Map(supplierMaterials.map((sm) => [sm.id, sm]));

    const breakdown: RecipeCostAnalysis["ingredientBreakdown"] = [];
    let totalCost = 0;
    let totalCostWithTax = 0;
    let hasPriceChanges = false;

    for (const ingredient of ingredients) {
        const sm = smMap.get(ingredient.supplierMaterialId);
        if (!sm) continue;

        const calc = calculateIngredientCost(ingredient, sm);

        breakdown.push({
            ingredientId: ingredient.id,
            name: sm.displayName,
            cost: calc.cost,
            costWithTax: calc.costWithTax,
            percentageOfTotal: 0, // Will calculate after
        });

        totalCost += calc.cost;
        totalCostWithTax += calc.costWithTax;

        // Check if price changed since lock
        if (ingredient.lockedPricing) {
            if (
                ingredient.lockedPricing.unitPrice !== sm.unitPrice ||
                ingredient.lockedPricing.tax !== sm.tax
            ) {
                hasPriceChanges = true;
            }
        }
    }

    // Calculate percentages
    breakdown.forEach((item) => {
        item.percentageOfTotal = totalCost > 0 ? (item.cost / totalCost) * 100 : 0;
    });

    // Sort by cost descending
    breakdown.sort((a, b) => b.cost - a.cost);

    return {
        recipeId,
        recipeName,
        ingredientBreakdown: breakdown,
        topCostDrivers: breakdown.slice(0, 3).map((b) => b.name),
        hasPriceChanges,
        warnings: hasPriceChanges
            ? ["Some ingredient prices have changed since they were locked"]
            : [],
        percentage: 0,

    };
}

/**
 * Compare two recipes
 */
export function compareRecipes(
    recipe1: { name: string; costPerKg: number },
    recipe2: { name: string; costPerKg: number }
): {
    cheaper: string;
    expensive: string;
    difference: number;
    differencePercentage: number;
} {
    const diff = Math.abs(recipe1.costPerKg - recipe2.costPerKg);
    const cheaper = recipe1.costPerKg < recipe2.costPerKg ? recipe1.name : recipe2.name;
    const expensive = recipe1.costPerKg >= recipe2.costPerKg ? recipe1.name : recipe2.name;
    const base = Math.max(recipe1.costPerKg, recipe2.costPerKg);

    return {
        cheaper,
        expensive,
        difference: diff,
        differencePercentage: base > 0 ? (diff / base) * 100 : 0,
    };
}

/**
 * Find cheaper alternatives for an ingredient
 */
export function findCheaperAlternatives(
    currentSupplierMaterialId: string,
    supplierMaterials: SupplierMaterialWithDetails[],
    maxResults: number = 3
): SupplierMaterialWithDetails[] {
    const current = supplierMaterials.find((sm) => sm.id === currentSupplierMaterialId);
    if (!current || !current.materialId) return [];

    // Find other supplier materials for the same material
    const alternatives = supplierMaterials
        .filter(
            (sm) =>
                sm.materialId === current.materialId &&
                sm.id !== currentSupplierMaterialId &&
                sm.unitPrice < current.unitPrice
        )
        .sort((a, b) => a.unitPrice - b.unitPrice)
        .slice(0, maxResults);

    return alternatives;
}

/**
 * Calculate potential savings by switching supplier material
 */
export function calculateSwitchingSavings(
    currentIngredient: RecipeIngredient,
    currentSupplierMaterial: SupplierMaterialWithDetails,
    alternativeSupplierMaterial: SupplierMaterialWithDetails
): {
    currentCost: number;
    newCost: number;
    savings: number;
    savingsPercentage: number;
} {
    const currentCalc = calculateIngredientCost(currentIngredient, currentSupplierMaterial);

    const altIngredient = { ...currentIngredient, supplierMaterialId: alternativeSupplierMaterial.id };
    const altCalc = calculateIngredientCost(altIngredient, alternativeSupplierMaterial);

    const savings = currentCalc.costWithTax - altCalc.costWithTax;
    const savingsPercentage =
        currentCalc.costWithTax > 0 ? (savings / currentCalc.costWithTax) * 100 : 0;

    return {
        currentCost: currentCalc.costWithTax,
        newCost: altCalc.costWithTax,
        savings,
        savingsPercentage,
    };
}