import { Sidebar } from "@/components/sidebar";
import { InventoryManager } from "./components/inventory-manager";

export default function InventoryPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <InventoryManager />
        </main>
      </div>
    </div>
  );
}
