// src/app/materials/page.tsx
import { Sidebar } from "@/components/sidebar";
import { MaterialsManager } from "./components/materials-manager";

export default function MaterialsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <MaterialsManager />
        </main>
      </div>
    </div>
  );
}