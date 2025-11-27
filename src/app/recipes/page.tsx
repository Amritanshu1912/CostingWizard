// src/app/recipes/page.tsx
import { RecipeManager } from "@/app/recipes/components/recipes-manager";
import { Sidebar } from "@/components/sidebar";

export default function RecipesPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <RecipeManager />
        </main>
      </div>
    </div>
  );
}
