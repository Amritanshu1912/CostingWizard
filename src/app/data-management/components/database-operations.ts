// src/app/data-management/components/database-operations.ts
import { db } from "@/lib/db";
import type { TableStat } from "./data-management-utils";

export const loadDatabaseStats = async (): Promise<
  Record<string, TableStat>
> => {
  const stats: Record<string, TableStat> = {};

  const tableNames = Object.keys(db).filter(
    (key) => (db as any)[key] && typeof (db as any)[key].count === "function"
  );

  for (const tableName of tableNames) {
    try {
      const count = await (db as any)[tableName].count();
      const items = await (db as any)[tableName].limit(100).toArray();
      const estimatedSize =
        new Blob([JSON.stringify(items)]).size * (count / Math.min(count, 100));
      stats[tableName] = { count, size: estimatedSize };
    } catch (error) {
      console.error(`Error loading ${tableName}:`, error);
      stats[tableName] = { count: 0, size: 0, error: true };
    }
  }

  return stats;
};

export const exportTables = async (
  selectedTables: Set<string>,
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  if (selectedTables.size === 0) {
    throw new Error("No tables selected");
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    version: "2.0",
    database: "CostingWizardDB",
    tables: [] as any[],
  };

  let current = 0;
  for (const tableName of selectedTables) {
    const data = await (db as any)[tableName].toArray();

    exportData.tables.push({
      name: tableName,
      recordCount: data.length,
      data: data,
    });

    current++;
    onProgress?.(current, selectedTables.size);
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `costing-wizard-backup-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importBackup = async (file: File): Promise<number> => {
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("File too large. Maximum size is 50MB.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);

        if (
          !importData.database ||
          !importData.tables ||
          !Array.isArray(importData.tables)
        ) {
          throw new Error("Invalid backup file format");
        }

        let imported = 0;
        for (const tableData of importData.tables) {
          if ((db as any)[tableData.name] && Array.isArray(tableData.data)) {
            await (db as any)[tableData.name].clear();
            await (db as any)[tableData.name].bulkAdd(tableData.data);
            imported++;
          }
        }

        resolve(imported);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};

export const clearTable = async (tableName: string): Promise<void> => {
  await (db as any)[tableName].clear();
};
