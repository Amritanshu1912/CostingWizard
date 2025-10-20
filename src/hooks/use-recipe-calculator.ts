import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import type { RecipeIngredientCalculated, SupplierMaterialWithDetails } from '@/lib/types';
import { convertToKilograms } from '@/app/recipes/components/recipes-constants';
import type { IngredientUnitValue } from '@/app/recipes/components/recipes-constants';

/**
 * Hook to calculate recipe ingredient costs with proper data joining
 */
export function useRecipeCalculator() {
    const [supplierMaterials, setSupplierMaterials] = useState<SupplierMaterialWithDetails[]>([]);

    // Load supplier materials with details on mount
    useEffect(() => {
        const loadSupplierMaterials = async () => {
            try {
                const materials = await db.supplierMaterials.toArray();
                const suppliers = await db.suppliers.toArray();
                const baseMaterials = await db.materials.toArray();

                const materialsWithDetails: SupplierMaterialWithDetails[] = materials.map(material => {
                    const supplier = suppliers.find(s => s.id === material.supplierId);
                    const baseMaterial = baseMaterials.find(m => m.id === material.materialId);

                    return {
                        ...material,
                        supplier,
                        material: baseMaterial,
                        displayName: baseMaterial?.name || `Material ${material.materialId}`,
                        displayCategory: baseMaterial?.category || 'Unknown',
                        displayUnit: material.unit,
                        priceWithTax: material.unitPrice * (1 + material.tax / 100),
                    };
                });

                setSupplierMaterials(materialsWithDetails);
            } catch (error) {
                console.error('Error loading supplier materials:', error);
            }
        };

        loadSupplierMaterials();
    }, []);

    /**
     * Calculate a recipe ingredient with all necessary fields
     */
    const calculateIngredient = (
        supplierMaterialId: string,
        quantity: number,
        unit: IngredientUnitValue
    ): RecipeIngredientCalculated | null => {
        const supplierMaterial = supplierMaterials.find(sm => sm.id === supplierMaterialId);
        if (!supplierMaterial) return null;

        const quantityInKg = convertToKilograms(quantity, unit);
        const costForQuantity = quantityInKg * supplierMaterial.unitPrice;
        const taxedCostForQuantity = costForQuantity * (1 + supplierMaterial.tax / 100);

        return {
            id: crypto.randomUUID(),
            supplierMaterialId,
            createdAt: new Date().toISOString(),
            supplierMaterial,
            effectivePricePerKg: supplierMaterial.unitPrice,
            effectiveTax: supplierMaterial.tax,
            quantity,
            costForQuantity,
            taxedCostForQuantity,
            displayName: supplierMaterial.displayName,
            displaySupplier: supplierMaterial.supplier?.name || supplierMaterial.supplierId,
            displayQuantity: `${quantity} ${unit}`,

            isPriceLocked: false,
            priceChangedSinceLock: false,
            isAvailable: supplierMaterial.availability === 'in-stock',
            priceSharePercentage: 0, // Will be calculated by parent component
        };
    };

    /**
     * Update percentages for a list of ingredients
     */
    const updateIngredientPercentages = (ingredients: RecipeIngredientCalculated[]): RecipeIngredientCalculated[] => {
        const totalCost = ingredients.reduce((sum, ing) => sum + ing.costForQuantity, 0);
        return ingredients.map(ing => ({
            ...ing,
            percentage: totalCost > 0 ? (ing.costForQuantity / totalCost) * 100 : 0,
        }));
    };

    return {
        supplierMaterials,
        calculateIngredient,
        updateIngredientPercentages,
    };
}
