import { useState, useEffect, useCallback } from 'react';
import { Table } from 'dexie';
import { db, dbUtils } from '@/lib/db';
import { toast } from 'sonner';

export function useDexieTable<T extends { id: string }>(table: Table<T>, initialData: T[] = []) {
    const [data, setData] = useState<T[]>(initialData);
    const [loading, setLoading] = useState(true);

    // Load data from DB on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const items = await dbUtils.getAll(table);
                setData(items);
            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [table]);

    const addItem = useCallback(async (item: Omit<T, 'id' | 'createdAt'>) => {
        try {
            const id = await dbUtils.add(table, item as T);
            const newItem = { ...item, id, createdAt: new Date().toISOString() } as unknown as T;
            setData(prev => [...prev, newItem]);
            toast.success('Item added successfully');
            return id;
        } catch (error) {
            console.error('Error adding item:', error);
            toast.error('Failed to add item');
            throw error;
        }
    }, [table]);

    const updateItem = useCallback(async (item: T) => {
        try {
            await dbUtils.update(table, item);
            setData(prev => prev.map(i => i.id === item.id ? item : i));
            toast.success('Item updated successfully');
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error('Failed to update item');
            throw error;
        }
    }, [table]);

    const deleteItem = useCallback(async (id: string) => {
        try {
            await dbUtils.delete(table, id);
            setData(prev => prev.filter(i => i.id !== id));
            toast.success('Item deleted successfully');
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to delete item');
            throw error;
        }
    }, [table]);

    const bulkAdd = useCallback(async (items: Omit<T, 'id' | 'createdAt'>[]) => {
        try {
            const newItems = items.map(item => ({
                ...item,
                id: Date.now().toString() + Math.random(),
                createdAt: new Date().toISOString()
            } as unknown as T));
            await dbUtils.bulkAdd(table, newItems);
            setData(prev => [...prev, ...newItems]);
            toast.success(`${items.length} items added successfully`);
        } catch (error) {
            console.error('Error bulk adding items:', error);
            toast.error('Failed to add items');
            throw error;
        }
    }, [table]);

    const bulkUpdate = useCallback(async (items: T[]) => {
        try {
            await dbUtils.bulkUpdate(table, items);
            setData(prev => {
                const updated = [...prev];
                items.forEach(item => {
                    const index = updated.findIndex(i => i.id === item.id);
                    if (index !== -1) updated[index] = item;
                });
                return updated;
            });
            toast.success(`${items.length} items updated successfully`);
        } catch (error) {
            console.error('Error bulk updating items:', error);
            toast.error('Failed to update items');
            throw error;
        }
    }, [table]);

    return {
        data,
        loading,
        addItem,
        updateItem,
        deleteItem,
        bulkAdd,
        bulkUpdate,
        refresh: () => {
            setLoading(true);
            dbUtils.getAll(table).then(setData).finally(() => setLoading(false));
        }
    };
}
