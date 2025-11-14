// ============================================================================
// SEED DATA FOR PRODUCTS (Optional - for testing)
// ============================================================================

import { db } from "./db";
import {
  PRODUCTS,
  PRODUCT_VARIANTS,
} from "../app/compose-products/components/products-constants";

export async function seedProductsData() {
  // Check if products already exist
  const existingProducts = await db.products.count();
  if (existingProducts > 0) {
    console.log("Products already seeded");
    return;
  }

  // Verify required data exists
  const recipes = await db.recipes.toArray();
  const packagings = await db.supplierPackaging.toArray();
  const labels = await db.supplierLabels.toArray();

  if (recipes.length === 0) {
    console.log("No recipes found. Please seed recipes first.");
    return;
  }

  if (packagings.length === 0) {
    console.log("No packaging found. Please seed packaging first.");
    return;
  }

  if (labels.length === 0) {
    console.log("No labels found. Please seed labels first.");
    return;
  }

  // Validate that all required recipes exist
  const requiredRecipeIds = [...new Set(PRODUCTS.map((p) => p.recipeId))];
  const existingRecipeIds = recipes.map((r) => r.id);
  const missingRecipes = requiredRecipeIds.filter(
    (id) => !existingRecipeIds.includes(id)
  );

  if (missingRecipes.length > 0) {
    console.log(
      `Missing recipes: ${missingRecipes.join(
        ", "
      )}. Please ensure all recipes are seeded.`
    );
    return;
  }

  // Validate packaging and labels exist
  const requiredPackagingIds = [
    ...new Set(
      PRODUCT_VARIANTS.map((v) => v.packagingSelectionId).filter(
        (id): id is string => id !== undefined
      )
    ),
  ];
  const existingPackagingIds = packagings.map((p) => p.id);
  const missingPackaging = requiredPackagingIds.filter(
    (id) => !existingPackagingIds.includes(id)
  );

  if (missingPackaging.length > 0) {
    console.log(
      `Missing packaging: ${missingPackaging.join(
        ", "
      )}. Please ensure all packaging is seeded.`
    );
    return;
  }

  const requiredLabelIds = [
    ...new Set([
      ...PRODUCT_VARIANTS.map((v) => v.frontLabelSelectionId).filter(
        (id): id is string => id !== undefined
      ),
      ...PRODUCT_VARIANTS.map((v) => v.backLabelSelectionId).filter(
        (id): id is string => id !== undefined
      ),
    ]),
  ];
  const existingLabelIds = labels.map((l) => l.id);
  const missingLabels = requiredLabelIds.filter(
    (id) => !existingLabelIds.includes(id)
  );

  if (missingLabels.length > 0) {
    console.log(
      `Missing labels: ${missingLabels.join(
        ", "
      )}. Please ensure all labels are seeded.`
    );
    return;
  }

  // Seed products
  console.log("Seeding products...");
  for (const product of PRODUCTS) {
    await db.products.add(product);
  }

  // Seed product variants
  console.log("Seeding product variants...");
  for (const variant of PRODUCT_VARIANTS) {
    await db.productVariants.add(variant);
  }

  console.log(
    `✅ Successfully seeded ${PRODUCTS.length} products with ${PRODUCT_VARIANTS.length} variants!`
  );
}

// ============================================================================
// UTILITY: Clear all product data (for testing)
// ============================================================================

export async function clearProductsData() {
  await db.productVariants.clear();
  await db.products.clear();
  console.log("✅ Products data cleared");
}
