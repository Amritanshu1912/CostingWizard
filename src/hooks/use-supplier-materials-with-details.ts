import { useMemo } from 'react';
import type { SupplierMaterial, Material, Supplier } from '@/lib/types';

export interface SupplierMaterialWithDetails extends SupplierMaterial {
    material: Material;
    supplier: Supplier;
}

export function useSupplierMaterialsWithDetails(
    supplierMaterials: SupplierMaterial[],
    materials: Material[],
    suppliers: Supplier[]
): SupplierMaterialWithDetails[] {
    return useMemo(() => {
        return supplierMaterials.map((sm: SupplierMaterial) => {
            const material = materials.find((m: Material) => m.id === sm.materialId);
            const supplier = suppliers.find((s: Supplier) => s.id === sm.supplierId);
            return {
                ...sm,
                material: material || { id: '', name: 'Unknown', category: 'Unknown', createdAt: '', updatedAt: undefined },
                supplier: supplier || { id: '', name: 'Unknown', contactPerson: '', email: '', phone: '', rating: 0, isActive: true, paymentTerms: '', leadTime: 0, createdAt: '', updatedAt: undefined },
            };
        });
    }, [supplierMaterials, materials, suppliers]);
}
