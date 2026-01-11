// src/components/sidebar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/shared-utils";
import {
  BarChart3,
  Box,
  Container,
  Database,
  FlaskConical,
  Menu,
  Package,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Suppliers",
    href: "/suppliers",
    icon: Users,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Warehouse,
  },
  {
    name: "Materials",
    href: "/materials",
    icon: Package,
  },
  {
    name: "Packaging",
    href: "/packaging",
    icon: Box,
  },
  {
    name: "Labels",
    href: "/labels",
    icon: Tag,
  },
  {
    name: "Recipes",
    href: "/recipes",
    icon: FlaskConical,
  },
  {
    name: "Products",
    href: "/products",
    icon: ShoppingBag,
  },
  {
    name: "Batches",
    href: "/batches",
    icon: Container,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    name: "Data Management",
    href: "/data-management",
    icon: Database,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shadow-sm",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Sparkles className="text-primary" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">
              CostWizard
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-accent"
        >
          {isCollapsed ? <Menu /> : <X />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10 transition-all duration-200",
                    isCollapsed && "px-2",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className={cn("", !isCollapsed && "mr-3")}>
                    <IconComponent />
                  </div>
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/70">
            Manufacturing Cost Management Platform
          </div>
        </div>
      )}
    </div>
  );
}
