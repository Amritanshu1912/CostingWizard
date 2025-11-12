import { Sidebar } from "@/components/sidebar";
import ProcurementManager from "@/app/procurement/components/procurement-manager";

export default function ProcurementPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <ProcurementManager />
        </main>
      </div>
    </div>
  );
}
