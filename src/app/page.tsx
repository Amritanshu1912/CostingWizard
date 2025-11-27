// src/app/page.tsx
"use client";

import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { quickActions, quickStats, recentMaterials } from "@/lib/constants";
import { BarChart3, Package, TrendingDown, TrendingUp } from "lucide-react";

export function DashboardOverview() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Manufacturing Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your cleaning products cost and production efficiently
          </p>
        </div>
        <Button className="btn-primary">Generate Report</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card
              key={stat.title}
              className="card-enhanced border-2 hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="text-primary">
                  <IconComponent />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  {stat.trend === "up" ? (
                    <TrendingUp className="text-accent" />
                  ) : (
                    <TrendingDown className="text-destructive" />
                  )}
                  <span
                    className={
                      stat.trend === "up"
                        ? "text-accent font-medium"
                        : "text-destructive font-medium"
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Materials */}
        <Card className="lg:col-span-2 card-enhanced border-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <div className="text-primary">
                <Package />
              </div>
              <span>Recent Materials</span>
            </CardTitle>
            <CardDescription>
              Latest raw materials in your inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMaterials.map((material) => (
                <div
                  key={material.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {material.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tax: {material.tax}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium text-foreground">
                        {material.price}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per kg
                      </div>
                    </div>
                    <Badge
                      variant={
                        material.status === "active" ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {material.status === "active" ? "Active" : "Low Stock"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-enhanced border-2">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 border border-border hover:border-primary/30 hover:bg-primary/5 bg-transparent transition-all duration-200"
                    asChild
                  >
                    <a href={action.href}>
                      <div className="mr-3 text-primary flex-shrink-0">
                        <IconComponent />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate">
                          {action.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {action.description}
                        </div>
                      </div>
                    </a>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Overview */}
      <Card className="card-enhanced border-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <div className="text-primary">
              <BarChart3 />
            </div>
            <span>Production Overview</span>
          </CardTitle>
          <CardDescription>
            Current production status and capacity utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Capacity Utilization
                </span>
                <span className="font-medium text-foreground">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quality Score</span>
                <span className="font-medium text-foreground">94%</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">On-time Delivery</span>
                <span className="font-medium text-foreground">89%</span>
              </div>
              <Progress value={89} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <DashboardOverview />
        </main>
      </div>
    </div>
  );
}
