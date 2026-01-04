// src/app/batches/page.tsx
import { Sidebar } from "@/components/sidebar";
import { BatchManager } from "./components/batch-manager";

export default function PlanningPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <BatchManager />
        </main>
      </div>
    </div>
  );
}
