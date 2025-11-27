// src/app/products/page.tsx
import { Sidebar } from "@/components/sidebar";
import { ProductsManager } from "./components/products-manager";

export default function ComposeProductsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <ProductsManager />
        </main>
      </div>
    </div>
  );
}
