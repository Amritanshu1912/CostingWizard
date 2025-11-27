// src/app/packaging/page.tsx
import { PackagingManager } from "@/app/packaging/components/packaging-manager";
import { Sidebar } from "@/components/sidebar";

export default function PackagingPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <PackagingManager />
        </main>
      </div>
    </div>
  );
}
