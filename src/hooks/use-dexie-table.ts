// hooks/use-dexie-table.ts
import type { Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { nanoid } from "nanoid";

/**
 * Generic hook for Dexie table operations with real-time updates
 * @param table - Dexie table instance
 * @param initialData - Default data to populate on first load
 */
export function useDexieTable<T extends { id: string; createdAt: string }>(
  table: Table<T>,
  initialData: Omit<T, "id" | "createdAt">[] = []
) {
  // Real-time reactive query
  const data = useLiveQuery(async () => {
    const items = await table.toArray();

    // Populate initial data if table is empty
    if (items.length === 0 && initialData.length > 0) {
      const now = new Date().toISOString();
      const itemsToAdd = initialData.map((item) => ({
        ...item,
        id: nanoid(),
        createdAt: now,
      })) as T[];

      await table.bulkAdd(itemsToAdd);
      return itemsToAdd;
    }

    return items;
  }, []);

  // Add item
  const addItem = async (item: Omit<T, "id" | "createdAt">) => {
    const now = new Date().toISOString();
    const id = nanoid();

    await table.add({
      ...item,
      id,
      createdAt: now,
    } as T);

    return id;
  };

  // Update item
  const updateItem = async (updates: Partial<T> & { id: string }) => {
    const now = new Date().toISOString();
    const { id, ...updateData } = updates;
    await table.update(id, {
      ...updateData,
      updatedAt: now,
    } as any);
  };
  // Delete item
  const deleteItem = async (id: string) => {
    await table.delete(id);
  };

  // Bulk operations
  const bulkAdd = async (items: Omit<T, "id" | "createdAt">[]) => {
    const now = new Date().toISOString();
    const itemsWithIds = items.map((item) => ({
      ...item,
      id: nanoid(),
      createdAt: now,
    })) as T[];

    await table.bulkAdd(itemsWithIds);
    return itemsWithIds.map((item) => item.id);
  };

  const bulkDelete = async (ids: string[]) => {
    await table.bulkDelete(ids);
  };

  return {
    data: data || [],
    addItem,
    updateItem,
    deleteItem,
    bulkAdd,
    bulkDelete,
  };
}
