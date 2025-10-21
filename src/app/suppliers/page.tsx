import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { SuppliersManager } from "@/app/suppliers/components/suppliers-manager";

export default function SuppliersPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <SuppliersManager />
        </main>
      </div>
    </div>
  );
}
