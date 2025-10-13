import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { LabelsManager } from "./components/labels-manager";

export default function LabelsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <LabelsManager />
        </main>
      </div>
    </div>
  );
}
