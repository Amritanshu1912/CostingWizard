import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { SupplierManagement } from "@/app/supplier-management/components/SupplierManagement";

export default function SupplierManagementPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <SupplierManagement />
        </main>
      </div>
    </div>
  );
}
