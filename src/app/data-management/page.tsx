import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { DataPersistenceManager } from "./components/data-persistence-manager";

export default function DataManagementPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <DataPersistenceManager />{" "}
        </main>
      </div>
    </div>
  );
}
