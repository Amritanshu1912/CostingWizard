// src/app/suppliers/page.tsx

import { SuppliersManager } from "@/app/suppliers/components/suppliers-manager";
import { Sidebar } from "@/components/sidebar";

/**
 * Suppliers page component that renders the main suppliers management interface
 * @returns JSX element containing the suppliers manager with sidebar layout
 */
export default function SuppliersPage() {
  // Main page layout with sidebar and content area
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <SuppliersManager />
        </main>
      </div>
    </div>
  );
}
