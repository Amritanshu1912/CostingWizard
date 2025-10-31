// hooks/use-recipe-experiment.ts
import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import type { RecipeIngredient, RecipeDisplay, CapacityUnit } from '@/lib/types';
import { recipeCalculator } from './use-recipes';
import { useSupplierMaterialsWithDetails } from './use-supplier-materials-with-details';

export interface ExperimentIngredient extends RecipeIngredient {
    _changed?: boolean;
    _changeTypes?: Set<'quantity' | 'supplier'>; // Track multiple changes
    _originalQuantity?: number;
    _originalSupplierId?: string;
}

export interface ExperimentMetrics {
    originalCost: number;
    modifiedCost: number;
    originalWeight: number;
    modifiedWeight: number;
    originalTotalCost: number;
    modifiedTotalCost: number;
    originalTotalCostWithTax: number;
    modifiedTotalCostWithTax: number;
    originalCostPerKgWithTax: number;
    modifiedCostPerKgWithTax: number;
    savings: number;
    savingsPercent: number;
    targetGap?: number;
    changeCount: number;
}

export function useRecipeExperiment(recipe: RecipeDisplay | null) {
    const supplierMaterials = useSupplierMaterialsWithDetails();

    const [experimentIngredients, setExperimentIngredients] = useState<ExperimentIngredient[]>([]);
    const [expandedAlternatives, setExpandedAlternatives] = useState<Set<string>>(new Set());
    const [targetCost, setTargetCost] = useState<number | undefined>();
    const [loadedVariantName, setLoadedVariantName] = useState<string | null>(null);

    const initializeExperiment = useCallback((newRecipe: RecipeDisplay) => {
        setExperimentIngredients(
            newRecipe.ingredients.map(ing => ({
                // Only include RecipeIngredient properties
                id: ing.id,
                recipeId: ing.recipeId,
                supplierMaterialId: ing.supplierMaterialId,
                quantity: ing.quantity,
                unit: ing.unit,
                lockedPricing: ing.lockedPricing,
                createdAt: ing.createdAt,
                updatedAt: ing.updatedAt,
                // Experiment tracking fields
                _originalQuantity: ing.quantity,
                _originalSupplierId: ing.supplierMaterialId,
                _changeTypes: new Set<'quantity' | 'supplier'>(),
            }))
        );
        setTargetCost(newRecipe.targetCostPerKg);
        setLoadedVariantName(null);
    }, []);

    // Calculate comprehensive metrics
    const metrics = useMemo((): ExperimentMetrics => {
        if (!recipe || experimentIngredients.length === 0) {
            return {
                originalCost: 0,
                modifiedCost: 0,
                originalWeight: 0,
                modifiedWeight: 0,
                originalTotalCost: 0,
                modifiedTotalCost: 0,
                originalTotalCostWithTax: 0,
                modifiedTotalCostWithTax: 0,
                originalCostPerKgWithTax: 0,
                modifiedCostPerKgWithTax: 0,
                savings: 0,
                savingsPercent: 0,
                changeCount: 0,
            };
        }

        // Calculate modified values
        let modifiedTotalCost = 0;
        let modifiedTotalCostWithTax = 0;
        let modifiedWeight = 0;

        experimentIngredients.forEach(ing => {
            const sm = supplierMaterials.find(s => s.id === ing.supplierMaterialId);
            if (!sm) return;

            const quantityInKg = recipeCalculator.normalizeToKg(ing.quantity, ing.unit);
            const pricePerKg = ing.lockedPricing?.unitPrice || sm.unitPrice;
            const tax = ing.lockedPricing?.tax || sm.tax || 0;
            const cost = pricePerKg * quantityInKg;
            const costWithTax = cost * (1 + tax / 100);

            modifiedTotalCost += cost;
            modifiedTotalCostWithTax += costWithTax;
            modifiedWeight += recipeCalculator.convertToStandard(ing.quantity, ing.unit);
        });

        const modifiedCostPerKg = modifiedWeight > 0
            ? modifiedTotalCost / recipeCalculator.normalizeToKg(modifiedWeight, 'gm')
            : 0;

        const modifiedCostPerKgWithTax = modifiedWeight > 0
            ? modifiedTotalCostWithTax / recipeCalculator.normalizeToKg(modifiedWeight, 'gm')
            : 0;

        // Original values
        const originalCostPerKg = recipe.costPerKg;
        const originalWeight = recipe.totalWeight;
        const originalTotalCost = recipe.totalCost;
        const originalTotalCostWithTax = recipe.taxedTotalCost;
        const originalCostPerKgWithTax = recipe.taxedCostPerKg;

        // Calculate savings
        const savings = originalCostPerKg - modifiedCostPerKg;
        const savingsPercent = originalCostPerKg > 0 ? (savings / originalCostPerKg) * 100 : 0;

        // Target gap
        const targetGap = targetCost ? modifiedCostPerKg - targetCost : undefined;

        // Count changes
        const changeCount = experimentIngredients.filter(ing => ing._changed).length;

        return {
            originalCost: originalCostPerKg,
            modifiedCost: modifiedCostPerKg,
            originalWeight,
            modifiedWeight,
            originalTotalCost,
            modifiedTotalCost,
            originalTotalCostWithTax,
            modifiedTotalCostWithTax,
            originalCostPerKgWithTax,
            modifiedCostPerKgWithTax,
            savings,
            savingsPercent,
            targetGap,
            changeCount,
        };
    }, [recipe, experimentIngredients, supplierMaterials, targetCost]);

    // Get alternatives for an ingredient
    const getAlternatives = useCallback((ing: ExperimentIngredient) => {
        const currentSm = supplierMaterials.find(s => s.id === ing.supplierMaterialId);
        if (!currentSm) return [];

        return supplierMaterials.filter(
            sm => sm.materialId === currentSm.materialId && sm.id !== currentSm.id
        );
    }, [supplierMaterials]);

    // Handlers
    const handleQuantityChange = useCallback((index: number, newQuantity: number) => {
        setExperimentIngredients(prev => {
            const updated = [...prev];
            const changeTypes = new Set(updated[index]._changeTypes || []);
            changeTypes.add('quantity');

            updated[index] = {
                ...updated[index],
                quantity: newQuantity,
                _changed: true,
                _changeTypes: changeTypes,
            };
            return updated;
        });
    }, []);

    const handleSupplierChange = useCallback((index: number, newSupplierId: string) => {
        const newSm = supplierMaterials.find(s => s.id === newSupplierId);
        if (!newSm) return;

        setExperimentIngredients(prev => {
            const updated = [...prev];
            const changeTypes = new Set(updated[index]._changeTypes || []);
            changeTypes.add('supplier');

            updated[index] = {
                ...updated[index],
                supplierMaterialId: newSupplierId,
                _changed: true,
                _changeTypes: changeTypes,
            };
            return updated;
        });
    }, [supplierMaterials]);

    const handleTogglePriceLock = useCallback((index: number) => {
        const ing = experimentIngredients[index];
        const sm = supplierMaterials.find(s => s.id === ing.supplierMaterialId);
        if (!sm) return;

        setExperimentIngredients(prev => {
            const updated = [...prev];
            if (updated[index].lockedPricing) {
                const { lockedPricing, ...rest } = updated[index];
                updated[index] = rest;
            } else {
                updated[index] = {
                    ...updated[index],
                    lockedPricing: {
                        unitPrice: sm.unitPrice,
                        tax: sm.tax,
                        lockedAt: new Date(),
                        reason: 'cost_analysis',
                    },
                };
            }
            return updated;
        });
    }, [experimentIngredients, supplierMaterials]);

    const handleRemoveIngredient = useCallback((index: number) => {
        setExperimentIngredients(prev => prev.filter((_, i) => i !== index));
        toast.success('Ingredient removed');
    }, []);

    const handleResetIngredient = useCallback((index: number) => {
        if (!recipe) return;

        const originalIng = recipe.ingredients[index];
        if (!originalIng) return;

        setExperimentIngredients(prev => {
            const updated = [...prev];
            updated[index] = {
                ...originalIng,
                _originalQuantity: originalIng.quantity,
                _originalSupplierId: originalIng.supplierMaterialId,
                _changed: false,
                _changeTypes: new Set(),
            };
            return updated;
        });

        toast.success('Ingredient reset');
    }, [recipe]);

    const handleResetAll = useCallback(() => {
        if (recipe) {
            initializeExperiment(recipe);
            toast.success('Reset to original recipe');
        }
    }, [recipe, initializeExperiment]);

    const toggleAlternatives = useCallback((ingredientId: string) => {
        setExpandedAlternatives(prev => {
            const next = new Set(prev);
            if (next.has(ingredientId)) {
                next.delete(ingredientId);
            } else {
                next.add(ingredientId);
            }
            return next;
        });
    }, []);

    const loadVariant = useCallback((variantName: string, ingredientIds: string[]) => {
        if (!recipe) return;

        const variantIngredients = recipe.ingredients
            .filter(ing => ingredientIds.includes(ing.id))
            .map(ing => ({
                // Only include RecipeIngredient properties + experiment fields
                id: ing.id,
                recipeId: ing.recipeId,
                supplierMaterialId: ing.supplierMaterialId,
                quantity: ing.quantity,
                unit: ing.unit,
                lockedPricing: ing.lockedPricing,
                createdAt: ing.createdAt,
                updatedAt: ing.updatedAt,
                // Experiment tracking fields
                _originalQuantity: ing.quantity,
                _originalSupplierId: ing.supplierMaterialId,
                _changeTypes: new Set<'quantity' | 'supplier'>(),
            }));

        setExperimentIngredients(variantIngredients);
        setLoadedVariantName(variantName);
        toast.success(`Loaded variant: ${variantName}`);
    }, [recipe]);

    return {
        experimentIngredients,
        metrics,
        expandedAlternatives,
        targetCost,
        loadedVariantName,
        setTargetCost,
        initializeExperiment,
        getAlternatives,
        handleQuantityChange,
        handleSupplierChange,
        handleTogglePriceLock,
        handleRemoveIngredient,
        handleResetIngredient,
        handleResetAll,
        toggleAlternatives,
        loadVariant,
    };
}