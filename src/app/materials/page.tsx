import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MaterialsManager } from "@/app/materials/components/materials-manager";

export default function MaterialsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <MaterialsManager />
        </main>
      </div>
    </div>
  );
}
