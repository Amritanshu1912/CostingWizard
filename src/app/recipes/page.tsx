import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { RecipeManager } from "@/app/recipes/components/recipe-manager";

export default function RecipesPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <RecipeManager />
        </main>
      </div>
    </div>
  );
}
