// src/app/labels/page.tsx
import { Sidebar } from "@/components/sidebar";
import { LabelsManager } from "./components/labels-manager";

/**
 * LabelsPage component serves as the main entry point for the labels management module.
 * It provides a full-screen layout with sidebar navigation and the labels manager interface.
 */
export default function LabelsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <LabelsManager />
        </main>
      </div>
    </div>
  );
}
