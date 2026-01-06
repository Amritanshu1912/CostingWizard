import { Sidebar } from "@/components/sidebar";
import { OrdersManager } from "./components/orders-manager";

export default function OrdersPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <OrdersManager />
        </main>
      </div>
    </div>
  );
}
