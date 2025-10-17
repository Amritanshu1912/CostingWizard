import type {
    Packaging,
    SupplierPackaging,
    Category,
    Material,
    Supplier,
    SupplierMaterial,
    Product,
    ProductionPlan,
    PurchaseOrder,
    Label,
    SupplierLabel
} from "@/lib/types";
import {
    Calendar,
    DollarSign,
    Package,
    ShoppingCart,
    FlaskConical as Flask,
} from "lucide-react";



// ============================================================================
// LABELS
// ============================================================================


export const LABELS: Label[] = [
    {
        id: "1",
        name: "Standard Sticker Label",
        type: "sticker",
        printingType: "color",
        material: "paper",
        shape: "rectangular",
        size: "50x30mm",
        labelFor: "Floor Cleaner",
        notes: "Waterproof adhesive, suitable for bottles",
        createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
        id: "2",
        name: "Premium Label Tag",
        type: "label",
        printingType: "foil",
        material: "vinyl",
        shape: "rectangular",
        size: "80x50mm",
        labelFor: "Bathroom Cleaner",
        notes: "High-quality foil printing for premium products",
        createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
        id: "3",
        name: "Custom Shape Tag",
        type: "tag",
        printingType: "bw",
        material: "paper",
        shape: "custom",
        size: "60x40mm",
        labelFor: "Glass Cleaner",
        notes: "Custom die-cut shape for branding",
        createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
        id: "4",
        name: "Embossed Label",
        type: "label",
        printingType: "embossed",
        material: "plastic",
        shape: "rectangular",
        size: "70x45mm",
        labelFor: "Kitchen Degreaser",
        notes: "Embossed texture for luxury feel",
        createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
        id: "5",
        name: "Small Sticker",
        type: "sticker",
        printingType: "color",
        material: "vinyl",
        shape: "rectangular",
        size: "30x20mm",
        labelFor: "Sample Products",
        notes: "Small size for sample bottles",
        createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
        id: "6",
        name: "Large Product Tag",
        type: "tag",
        printingType: "color",
        material: "paper",
        shape: "custom",
        size: "100x60mm",
        labelFor: "Bulk Containers",
        notes: "Large format for industrial containers",
        createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
        id: "7",
        name: "Security Label",
        type: "sticker",
        printingType: "foil",
        material: "plastic",
        shape: "rectangular",
        size: "40x25mm",
        labelFor: "Premium Products",
        notes: "Tamper-evident security features",
        createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
        id: "8",
        name: "Recyclable Label",
        type: "label",
        printingType: "bw",
        material: "paper",
        shape: "rectangular",
        size: "55x35mm",
        labelFor: "Eco Products",
        notes: "Made from recycled materials",
        createdAt: "2024-01-01T00:00:00.000Z",
    },
];


export const SUPPLIER_LABELS: SupplierLabel[] = [
    {
        id: "1",
        supplierId: "1",
        labelId: "1",
        unit: "pieces",
        unitPrice: 0.15,
        bulkPrice: 120,
        quantityForBulkPrice: 1000,
        moq: 500,
        bulkDiscounts: [
            { quantity: 5000, discount: 10 },
            { quantity: 10000, discount: 18 },
        ],
        leadTime: 7,
        availability: "in-stock",
        transportationCost: 8,
        notes: "Standard quality sticker labels",
        createdAt: "2024-01-15T00:00:00.000Z",
    },
    {
        id: "2",
        supplierId: "1",
        labelId: "2",
        unit: "pieces",
        unitPrice: 0.85,
        bulkPrice: 680,
        quantityForBulkPrice: 1000,
        moq: 200,
        bulkDiscounts: [
            { quantity: 2000, discount: 12 },
            { quantity: 5000, discount: 20 },
        ],
        leadTime: 10,
        availability: "in-stock",
        transportationCost: 15,
        notes: "Premium foil printing available",
        createdAt: "2024-01-15T00:00:00.000Z",
    },
    {
        id: "3",
        supplierId: "2",
        labelId: "3",
        unit: "pieces",
        unitPrice: 0.25,
        bulkPrice: 200,
        quantityForBulkPrice: 1000,
        moq: 1000,
        bulkDiscounts: [
            { quantity: 5000, discount: 8 },
            { quantity: 10000, discount: 15 },
        ],
        leadTime: 5,
        availability: "in-stock",
        transportationCost: 6,
        notes: "Custom die-cutting service available",
        createdAt: "2024-01-20T00:00:00.000Z",
    },
    {
        id: "4",
        supplierId: "2",
        labelId: "4",
        unit: "pieces",
        unitPrice: 1.2,
        bulkPrice: 960,
        quantityForBulkPrice: 1000,
        moq: 100,
        bulkDiscounts: [
            { quantity: 2000, discount: 15 },
            { quantity: 5000, discount: 25 },
        ],
        leadTime: 12,
        availability: "limited",
        transportationCost: 18,
        notes: "Specialized embossing equipment",
        createdAt: "2024-01-20T00:00:00.000Z",
    },
    {
        id: "5",
        supplierId: "3",
        labelId: "5",
        unit: "pieces",
        unitPrice: 0.08,
        bulkPrice: 64,
        quantityForBulkPrice: 1000,
        moq: 2000,
        bulkDiscounts: [
            { quantity: 10000, discount: 12 },
            { quantity: 25000, discount: 20 },
        ],
        leadTime: 4,
        availability: "in-stock",
        transportationCost: 4,
        notes: "Bulk pricing for small labels",
        createdAt: "2024-02-01T00:00:00.000Z",
    },
    {
        id: "6",
        supplierId: "3",
        labelId: "6",
        unit: "pieces",
        unitPrice: 0.45,
        bulkPrice: 360,
        quantityForBulkPrice: 1000,
        moq: 500,
        bulkDiscounts: [
            { quantity: 5000, discount: 10 },
            { quantity: 10000, discount: 18 },
        ],
        leadTime: 6,
        availability: "in-stock",
        transportationCost: 10,
        notes: "Large format printing capabilities",
        createdAt: "2024-02-01T00:00:00.000Z",
    },
    {
        id: "7",
        supplierId: "1",
        labelId: "7",
        unit: "pieces",
        unitPrice: 0.35,
        bulkPrice: 280,
        quantityForBulkPrice: 1000,
        moq: 300,
        bulkDiscounts: [
            { quantity: 2000, discount: 8 },
            { quantity: 5000, discount: 15 },
        ],
        leadTime: 8,
        availability: "in-stock",
        transportationCost: 12,
        notes: "Security features available",
        createdAt: "2024-01-15T00:00:00.000Z",
    },
    {
        id: "8",
        supplierId: "2",
        labelId: "8",
        unit: "pieces",
        unitPrice: 0.12,
        bulkPrice: 96,
        quantityForBulkPrice: 1000,
        moq: 1000,
        bulkDiscounts: [
            { quantity: 5000, discount: 10 },
            { quantity: 10000, discount: 18 },
        ],
        leadTime: 5,
        availability: "in-stock",
        transportationCost: 5,
        notes: "Eco-friendly materials",
        createdAt: "2024-01-20T00:00:00.000Z",
    },
];


// ============================================================================
// MASTER DATA - Single Source of Truth
// ============================================================================


export const CATEGORIES: Category[] = [
    { id: "1", name: "Acids", description: "Acidic compounds and solutions", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "2", name: "Bases", description: "Basic compounds and alkalis", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "3", name: "Colors", description: "Dyes and coloring agents", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "4", name: "Thickeners", description: "Viscosity modifiers", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "5", name: "Salts", description: "Salt compounds", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "6", name: "Oils", description: "Oil-based materials", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "7", name: "Other", description: "Miscellaneous materials", createdAt: "2024-01-01T00:00:00.000Z" },
];

// ============================================================================
// SUPPLIERS
// ============================================================================

export const SUPPLIERS: Supplier[] = [
    {
        id: "1",
        name: "ChemCorp Industries",
        contactPerson: "Rajesh Kumar",
        email: "rajesh@chemcorp.com",
        phone: "+91-9876543210",
        address: "Plot 45, Industrial Area, Mumbai - 400001",
        rating: 4.5,
        isActive: true,
        paymentTerms: "30 days",
        leadTime: 7,
        notes: "Reliable supplier for acids and bases. High quality, consistent delivery.",
        performance: {
            onTimeDelivery: 92,
            qualityScore: 88,
            priceCompetitiveness: 85,
        },
        createdAt: "2024-01-15",
    },
    {
        id: "2",
        name: "ColorTech Solutions",
        contactPerson: "Priya Sharma",
        email: "priya@colortech.com",
        phone: "+91-9876543211",
        address: "Sector 18, Gurgaon - 122001",
        rating: 4.2,
        isActive: true,
        paymentTerms: "45 days",
        leadTime: 10,
        notes: "Specializes in industrial colors and dyes. Premium quality products.",
        performance: {
            onTimeDelivery: 88,
            qualityScore: 91,
            priceCompetitiveness: 78,
        },
        createdAt: "2024-01-20",
    },
    {
        id: "3",
        name: "BulkChem Traders",
        contactPerson: "Amit Patel",
        email: "amit@bulkchem.com",
        phone: "+91-9876543212",
        address: "GIDC Estate, Ankleshwar - 393002",
        rating: 3.8,
        isActive: true,
        paymentTerms: "15 days",
        leadTime: 5,
        notes: "Good for bulk orders, competitive pricing on salts and basic materials.",
        performance: {
            onTimeDelivery: 85,
            qualityScore: 82,
            priceCompetitiveness: 92,
        },
        createdAt: "2024-02-01",
    },
];

// ============================================================================
// PRODUCTS & Recipes (keeping existing structure)
// ============================================================================


export const PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Premium Floor Cleaner",
        description: "High-performance floor cleaning solution",
        ingredients: [
            // Ingredients kept in 'kg' as they appear to be solids/powders
            {
                id: "1-1", // Unique ID
                materialId: "6",
                materialName: "NaCl",
                quantity: 0.35,
                unit: "kg",
                costPerKg: 6,
                totalCost: 2.1,
                percentage: 35,
            },
            {
                id: "1-2", // Unique ID
                materialId: "7",
                materialName: "Dolamite",
                quantity: 0.25,
                unit: "kg",
                costPerKg: 5.25,
                totalCost: 1.31,
                percentage: 25,
            },
            {
                id: "1-3", // Unique ID
                materialId: "8",
                materialName: "Soda Ash",
                quantity: 0.22,
                unit: "kg",
                costPerKg: 40.95,
                totalCost: 9.01,
                percentage: 22,
            },
            {
                id: "1-4", // Unique ID
                materialId: "2",
                materialName: "Acid Slurry 90%",
                quantity: 0.08,
                unit: "kg",
                costPerKg: 122.85,
                totalCost: 9.83,
                percentage: 8,
            },
            {
                id: "1-5", // Unique ID
                materialId: "4",
                materialName: "Caustic Soda",
                quantity: 0.018,
                unit: "kg",
                costPerKg: 59.85,
                totalCost: 1.08,
                percentage: 1.8,
            },
            {
                id: "1-6", // Unique ID
                materialId: "9",
                materialName: "AOS Powder 96%",
                quantity: 0.025,
                unit: "kg",
                costPerKg: 155.4,
                totalCost: 3.89,
                percentage: 2.5,
            },
        ],
        totalCostPerKg: 27.22,
        sellingPricePerKg: 45.0,
        profitMargin: 39.5,
        batchSizeKg: 100,
        status: "active",
        createdAt: "2024-01-10",
    },
    {
        id: "2",
        name: "Bathroom Cleaner Pro",
        description: "Powerful bathroom cleaning recipe",
        ingredients: [
            {
                id: "2-1", // Corrected ID
                materialId: "5",
                materialName: "Citric Acid",
                quantity: 0.15,
                unit: "kg",
                costPerKg: 97.65,
                totalCost: 14.65,
                percentage: 15,
            },
            {
                id: "2-2", // Corrected ID
                materialId: "4",
                materialName: "Caustic Soda",
                quantity: 0.05,
                unit: "kg", // Added unit
                costPerKg: 59.85,
                totalCost: 2.99,
                percentage: 5,
            },
            {
                id: "2-3", // Corrected ID
                materialId: "2",
                materialName: "Acid Slurry 90%",
                quantity: 0.12,
                unit: "L", // Using Litres (L), assuming density near 1
                costPerKg: 122.85,
                totalCost: 14.74,
                percentage: 12,
            },
            {
                id: "2-4", // Corrected ID
                materialId: "1",
                materialName: "Acid Blue Color",
                // Quantity changed from 0.001 kg to 1 g (same weight)
                quantity: 1,
                unit: "g", // Changed to grams
                costPerKg: 1680,
                totalCost: 1.68,
                percentage: 0.1,
            },
        ],
        totalCostPerKg: 34.06,
        sellingPricePerKg: 55.0,
        profitMargin: 38.1,
        batchSizeKg: 50,
        status: "active",
        createdAt: "2024-01-12",
    },
    {
        id: "3",
        name: "Glass Cleaner",
        description: "Streak-free glass cleaning solution",
        ingredients: [
            {
                id: "3-1", // Added ID
                materialId: "2",
                materialName: "Acid Slurry 90%",
                quantity: 0.1,
                unit: "L", // Added unit (L)
                costPerKg: 122.85,
                totalCost: 12.29,
                percentage: 10,
            },
            {
                id: "3-2", // Added ID
                materialId: "6",
                materialName: "NaCl",
                // Quantity changed from 0.05 kg to 50 g (same weight)
                quantity: 50,
                unit: "g", // Added unit (g)
                costPerKg: 6,
                totalCost: 0.3,
                percentage: 5,
            },
            {
                id: "3-3", // Added ID
                materialId: "1",
                materialName: "Acid Blue Color",
                // Quantity changed from 0.002 kg to 2 mL (same weight assumed for color)
                quantity: 2,
                unit: "mL", // Added unit (mL)
                costPerKg: 1680,
                totalCost: 3.36,
                percentage: 0.2,
            },
        ],
        totalCostPerKg: 22.15,
        sellingPricePerKg: 38.0,
        profitMargin: 41.7,
        batchSizeKg: 75,
        status: "active",
        createdAt: "2024-01-15",
    },
    {
        id: "4",
        name: "Kitchen Degreaser",
        description: "Heavy-duty kitchen cleaning solution",
        ingredients: [
            {
                id: "4-1", // Added ID
                materialId: "4",
                materialName: "Caustic Soda",
                quantity: 0.2,
                unit: "kg", // Added unit
                costPerKg: 59.85,
                totalCost: 11.97,
                percentage: 20,
            },
            {
                id: "4-2", // Added ID
                materialId: "8",
                materialName: "Soda Ash",
                quantity: 0.15,
                unit: "kg", // Added unit
                costPerKg: 40.95,
                totalCost: 6.14,
                percentage: 15,
            },
            {
                id: "4-3", // Added ID
                materialId: "9",
                materialName: "AOS Powder 96%",
                quantity: 0.08,
                unit: "kg", // Added unit
                costPerKg: 155.4,
                totalCost: 12.43,
                percentage: 8,
            },
        ],
        totalCostPerKg: 31.5,
        sellingPricePerKg: 52.0,
        profitMargin: 39.4,
        batchSizeKg: 60,
        status: "active",
        createdAt: "2024-01-18",
    },
];

export const PRODUCTION_PLANS: ProductionPlan[] = [
    {
        id: "1",
        planName: "Q1 Production Batch",
        description: "First quarter production planning",
        startDate: "2024-01-15",
        endDate: "2024-03-31",
        products: [
            {
                productId: "1",
                productName: "Premium Floor Cleaner",
                quantityKg: 500,
                costPerKg: 27.22,
                totalCost: 13610,
                materialsRequired: [
                    {
                        materialId: "6",
                        materialName: "NaCl",
                        requiredQty: 175,
                        availableQty: 200,
                        shortage: 0,
                        costPerKg: 6,
                        totalCost: 1050,
                    },
                    {
                        materialId: "8",
                        materialName: "Soda Ash",
                        requiredQty: 110,
                        availableQty: 80,
                        shortage: 30,
                        costPerKg: 40.95,
                        totalCost: 4504.5,
                    },
                    {
                        materialId: "7",
                        materialName: "Dolamite",
                        requiredQty: 125,
                        availableQty: 150,
                        shortage: 0,
                        costPerKg: 5.25,
                        totalCost: 656.25,
                    },
                    {
                        materialId: "2",
                        materialName: "Acid Slurry 90%",
                        requiredQty: 40,
                        availableQty: 50,
                        shortage: 0,
                        costPerKg: 122.85,
                        totalCost: 4914,
                    },
                    {
                        materialId: "4",
                        materialName: "Caustic Soda",
                        requiredQty: 9,
                        availableQty: 25,
                        shortage: 0,
                        costPerKg: 59.85,
                        totalCost: 538.65,
                    },
                    {
                        materialId: "9",
                        materialName: "AOS Powder 96%",
                        requiredQty: 12.5,
                        availableQty: 20,
                        shortage: 0,
                        costPerKg: 155.4,
                        totalCost: 1942.5,
                    },
                ],
            },
            {
                productId: "2",
                productName: "Bathroom Cleaner Pro",
                quantityKg: 300,
                costPerKg: 34.06,
                totalCost: 10218,
                materialsRequired: [
                    {
                        materialId: "5",
                        materialName: "Citric Acid",
                        requiredQty: 45,
                        availableQty: 60,
                        shortage: 0,
                        costPerKg: 97.65,
                        totalCost: 4394.25,
                    },
                    {
                        materialId: "4",
                        materialName: "Caustic Soda",
                        requiredQty: 15,
                        availableQty: 25,
                        shortage: 0,
                        costPerKg: 59.85,
                        totalCost: 897.75,
                    },
                    {
                        materialId: "2",
                        materialName: "Acid Slurry 90%",
                        requiredQty: 36,
                        availableQty: 50,
                        shortage: 0,
                        costPerKg: 122.85,
                        totalCost: 4422.6,
                    },
                    {
                        materialId: "1",
                        materialName: "Acid Blue Color",
                        requiredQty: 0.3,
                        availableQty: 5,
                        shortage: 0,
                        costPerKg: 1680,
                        totalCost: 504,
                    },
                ],
            },
        ],
        totalCost: 23828,
        totalRevenue: 38500,
        totalProfit: 14672,
        status: "in-progress",
        progress: 65,
        createdAt: "2024-01-10",
    },
    {
        id: "2",
        planName: "Special Order Batch",
        description: "Custom order for large client",
        startDate: "2024-02-01",
        endDate: "2024-02-15",
        products: [
            {
                productId: "3",
                productName: "Glass Cleaner",
                quantityKg: 200,
                costPerKg: 22.15,
                totalCost: 4430,
                materialsRequired: [
                    {
                        materialId: "2",
                        materialName: "Acid Slurry 90%",
                        requiredQty: 20,
                        availableQty: 50,
                        shortage: 0,
                        costPerKg: 122.85,
                        totalCost: 2457,
                    },
                    {
                        materialId: "6",
                        materialName: "NaCl",
                        requiredQty: 10,
                        availableQty: 200,
                        shortage: 0,
                        costPerKg: 6,
                        totalCost: 60,
                    },
                    {
                        materialId: "1",
                        materialName: "Acid Blue Color",
                        requiredQty: 0.4,
                        availableQty: 5,
                        shortage: 0,
                        costPerKg: 1680,
                        totalCost: 672,
                    },
                ],
            },
        ],
        totalCost: 4430,
        totalRevenue: 7600,
        totalProfit: 3170,
        status: "scheduled",
        progress: 0,
        createdAt: "2024-01-25",
    },
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
    {
        id: "PO-001",
        orderId: "PO-001",
        supplierId: "1",
        supplierName: "ChemCorp Industries",
        items: [
            {
                id: "PO001-I1", // Added unique ID
                materialId: "1",
                materialName: "Acid Blue Color",
                quantity: 50,
                unit: "kg", // Added unit
                costPerKg: 1650,
                totalCost: 82500,
            },
            {
                id: "PO001-I2", // Added unique ID
                materialId: "5",
                materialName: "Citric Acid",
                quantity: 100,
                unit: "kg", // Added unit
                costPerKg: 95,
                totalCost: 9500,
            },
        ],
        totalCost: 92000,
        status: "confirmed",
        dateCreated: "2024-01-15", // Renamed from orderDate
        deliveryDate: "2024-01-22", // Renamed from expectedDelivery
        createdAt: "2024-01-15",
    },
    {
        id: "PO-002",
        orderId: "PO-002",
        supplierId: "2",
        supplierName: "ColorTech Solutions",
        items: [
            {
                id: "PO002-I1", // Added unique ID
                materialId: "9",
                materialName: "AOS Powder 96%",
                quantity: 75,
                unit: "kg", // Added unit
                costPerKg: 152,
                totalCost: 11400,
            },
        ],
        totalCost: 11400,
        status: "submitted",
        dateCreated: "2024-01-18", // Renamed from orderDate
        deliveryDate: "2024-01-25", // Renamed from expectedDelivery
        createdAt: "2024-01-18",
    },
    {
        id: "PO-003",
        orderId: "PO-003",
        supplierId: "3",
        supplierName: "BulkChem Traders",
        items: [
            {
                id: "PO003-I1", // Added unique ID
                materialId: "6",
                materialName: "NaCl",
                quantity: 1000,
                unit: "kg", // Added unit
                costPerKg: 5.8,
                totalCost: 5800,
            },
            {
                id: "PO003-I2", // Added unique ID
                materialId: "8",
                materialName: "Soda Ash",
                quantity: 500,
                unit: "kg", // Added unit
                costPerKg: 39,
                totalCost: 19500,
            },
        ],
        totalCost: 25300,
        status: "delivered",
        dateCreated: "2024-01-10", // Renamed from orderDate
        deliveryDate: "2024-01-17", // Renamed from expectedDelivery
        createdAt: "2024-01-10",
    },
];


// ============================================================================
// ANALYTICS & DASHBOARD DATA
// ============================================================================



export const priceHistoryData = [
    { month: "Jan", avgPrice: 245.5, materials: 142 },
    { month: "Feb", avgPrice: 251.2, materials: 145 },
    { month: "Mar", avgPrice: 248.8, materials: 148 },
    { month: "Apr", avgPrice: 255.3, materials: 152 },
    { month: "May", avgPrice: 262.1, materials: 156 },
    { month: "Jun", avgPrice: 258.9, materials: 159 },
];

export const supplierPerformance = [
    { supplier: "ChemCorp Industries", reliability: 92, avgPrice: 180, orders: 45 },
    { supplier: "ColorTech Solutions", reliability: 88, avgPrice: 165, orders: 38 },
    { supplier: "BulkChem Traders", reliability: 85, avgPrice: 155, orders: 52 },
];

export const costTrends = [
    { month: "Jan", rawMaterials: 125000, production: 89000, total: 214000 },
    { month: "Feb", rawMaterials: 132000, production: 92000, total: 224000 },
    { month: "Mar", rawMaterials: 128000, production: 88000, total: 216000 },
    { month: "Apr", rawMaterials: 145000, production: 95000, total: 240000 },
    { month: "May", rawMaterials: 152000, production: 98000, total: 250000 },
    { month: "Jun", rawMaterials: 148000, production: 96000, total: 244000 },
];

export const materialUsage = [
    { material: "NaCl", usage: 450, cost: 2700, efficiency: 95 },
    { material: "Soda Ash", usage: 320, cost: 13104, efficiency: 88 },
    { material: "CBS-X", usage: 15, cost: 33862, efficiency: 92 },
    { material: "Caustic Soda", usage: 180, cost: 10773, efficiency: 90 },
    { material: "AOS Powder 96%", usage: 250, cost: 38850, efficiency: 85 },
];

export const qualityMetrics = [
    { month: "Jan", defectRate: 2.1, customerSatisfaction: 94, returnRate: 1.2 },
    { month: "Feb", defectRate: 1.8, customerSatisfaction: 95, returnRate: 1.0 },
    { month: "Mar", defectRate: 2.3, customerSatisfaction: 93, returnRate: 1.4 },
    { month: "Apr", defectRate: 1.5, customerSatisfaction: 96, returnRate: 0.8 },
    { month: "May", defectRate: 1.9, customerSatisfaction: 95, returnRate: 1.1 },
    { month: "Jun", defectRate: 1.6, customerSatisfaction: 97, returnRate: 0.9 },
];


// ============================================================================
// UI CONFIGURATION
// ============================================================================


export const quickStats = [
    {
        title: "Total Raw Materials",
        value: "156",
        change: "+12%",
        trend: "up" as const,
        icon: Package,
    },
    {
        title: "Active Products",
        value: "24",
        change: "+3%",
        trend: "up" as const,
        icon: Flask,
    },
    {
        title: "Production Plans",
        value: "8",
        change: "-2%",
        trend: "down" as const,
        icon: Calendar,
    },
    {
        title: "Avg Cost per kg",
        value: "₹245.50",
        change: "+5.2%",
        trend: "up" as const,
        icon: DollarSign,
    },
];

export const recentMaterials = [
    { name: "Acid Blue Color", price: "₹1,680.00", tax: "5%", status: "active" as const },
    { name: "CBS-X", price: "₹2,257.50", tax: "5%", status: "active" as const },
    { name: "AOS Powder 96%", price: "₹155.40", tax: "5%", status: "active" as const },
    { name: "Citric Acid", price: "₹97.65", tax: "5%", status: "active" as const },
    { name: "Caustic Soda", price: "₹59.85", tax: "5%", status: "active" as const },
];

export const quickActions = [
    {
        title: "Add Raw Material",
        description: "Add new materials to inventory",
        href: "/materials",
        icon: Package,
    },
    {
        title: "Create Product",
        description: "Design new product recipes",
        href: "/recipes",
        icon: Flask,
    },
    {
        title: "Plan Production",
        description: "Schedule production batches",
        href: "/planning",
        icon: Calendar,
    },
    {
        title: "Manage Procurement",
        description: "Handle supplier orders",
        href: "/procurement",
        icon: ShoppingCart,
    },
];
