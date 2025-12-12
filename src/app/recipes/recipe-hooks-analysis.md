# Recipe Hooks Analysis & Optimization Report

## 📊 Hook Usage Statistics

### 1. `use-recipes.ts` (10 hooks exported)

| Hook                      | Usage Count | Used In                                                    |
| ------------------------- | ----------- | ---------------------------------------------------------- |
| `useRecipeData`           | 1           | `use-comparison.ts`                                        |
| `useEnrichedRecipes`      | 5           | Products forms, Analytics, Recipe tab, Manager, Comparison |
| `useEnrichedRecipe`       | 2           | Recipe tab, Recipe lab                                     |
| `useRecipeIngredients`    | 1           | Recipe tab                                                 |
| `useRecipeVariants`       | 2           | Products forms, Recipe lab                                 |
| `useRecipeVariantSummary` | **0**       | ❌ **Not used anywhere**                                   |
| `useRecipeStats`          | 2           | Analytics, Manager                                         |
| `useRecipeComparison`     | **0**       | ❌ **Not used anywhere**                                   |
| `useRecipeOptimizations`  | **0**       | ❌ **Not used anywhere**                                   |
| `recipeCalculator`        | **0**       | ❌ **Not used anywhere**                                   |

### 2. `use-comparison.ts` (4 hooks exported)

| Hook                      | Usage Count | Used In                     |
| ------------------------- | ----------- | --------------------------- |
| `useComparableItems`      | 1           | Recipe comparison component |
| `useSelectedItems`        | 1           | Recipe comparison component |
| `useComparisonSummary`    | 1           | Recipe comparison component |
| `useIngredientComparison` | 1           | Comparison table component  |

### 3. `use-recipe-experiment.ts` (1 hook exported)

| Hook                  | Usage Count | Used In              |
| --------------------- | ----------- | -------------------- |
| `useRecipeExperiment` | 1           | Recipe lab component |

---

## 🚨 Unused Hooks - Major Opportunity!

### 4 Hooks Completely Unused:

1. **`useRecipeVariantSummary`** - Returns `{totalVariants, activeVariants, costOptimizedVariants, hasVariants}`
2. **`useRecipeComparison`** - Side-by-side recipe comparison functionality
3. **`useRecipeOptimizations`** - Supplier switching suggestions with savings calculations
4. **`recipeCalculator`** - Pure utility functions for cost calculations

### Recipe Page Enhancement Opportunities:

#### 1. Add Variant Statistics (`useRecipeVariantSummary`)

```typescript
// In recipe details view, show variant summary
const variantSummary = useRecipeVariantSummary(recipeId);
if (variantSummary?.hasVariants) {
  // Display: "3 variants (2 active, 1 cost-optimized)"
}
```

#### 2. Add Optimization Suggestions (`useRecipeOptimizations`)

```typescript
// In recipe analytics or details
const optimizations = useRecipeOptimizations(recipeId);
optimizations.forEach((opt) => {
  // Show: "Switch to Supplier X: Save ₹50/kg (15% savings)"
});
```

#### 3. Add Recipe Comparison (`useRecipeComparison`)

```typescript
// Side-by-side recipe comparison feature
const comparison = useRecipeComparison(recipeId1, recipeId2);
// Shows cost differences, cheaper recipe, etc.
```

#### 4. Use Calculator Utilities (`recipeCalculator`)

```typescript
// Throughout app for consistent calculations
const metrics = recipeCalculator.calculateRecipeMetrics(ingredients);
```

---

## 🔄 Major Redundancy Issues

### Duplicate Ingredient Enrichment Logic

Both `useEnrichedRecipes` and `use-comparison.ts` have nearly identical code:

**DUPLICATE CODE BLOCKS:**

- Cost calculation: `pricePerKg * quantityInKg`
- Tax calculation: `costForQuantity * (1 + tax/100)`
- Inventory access: `inventoryMap.get(supplierMaterialId)?.status`
- Price locking logic: `ing.lockedPricing ? locked : current`

**RECOMMENDATION:** Extract shared ingredient enrichment logic into a utility function.

### Data Fetching Duplication

`use-comparison.ts` re-fetches the same data that `useEnrichedRecipes` already provides:

- Supplier/material maps
- Recipe ingredients
- Inventory data

**RECOMMENDATION:** Pass enriched data from `useEnrichedRecipes` instead of duplicating data fetching.

---

## 🎯 Recommended Actions

### Immediate Wins (Low effort, high impact):

1. **Add variant statistics** to recipe details using `useRecipeVariantSummary`
2. **Add optimization suggestions** to recipe analytics using `useRecipeOptimizations`
3. **Use `recipeCalculator`** utilities for consistent cost calculations

### Refactoring Opportunities:

1. **Extract common ingredient enrichment** into shared utility
2. **Eliminate data fetching duplication** in comparison hooks
3. **Create `useRecipeComparison`** feature for recipe comparison tool

### Code Quality Improvements:

1. **Remove unused exports** or add TODO comments for planned usage
2. **Add JSDoc comments** to unused hooks explaining intended use
3. **Consider hook consolidation** if some hooks serve very similar purposes

---

## 📈 Impact Summary

- **4 unused hooks** represent significant missed functionality
- **~100+ lines** of duplicate code between comparison and recipes hooks
- **Recipe page enhancement potential** with optimization suggestions, variant stats, and comparison features
- **Performance improvements** possible by eliminating data fetching duplication

The recipe page could be significantly enhanced with these unused hooks, and major code duplication could be eliminated through refactoring! 🚀
