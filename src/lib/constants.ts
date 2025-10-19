import type {
    Category,
    Supplier,
    Product,
    ProductionPlan,
    PurchaseOrder,
    Recipe,
} from "@/lib/types";
import {
    Calendar,
    DollarSign,
    Package,
    ShoppingCart,
    FlaskConical as Flask,
} from "lucide-react";


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
        name: "Premium Floor Cleaner - 5L Bottle",
        sku: "PFC-5L-001",
        description: "High-performance floor cleaning solution for industrial and commercial use",
        category: "Floor Care",
        components: [
            {
                id: "comp-1",
                type: "recipe",
                recipeId: "recipe-1",
                createdAt: "2024-01-01T00:00:00.000Z",
            },
            {
                id: "comp-2",
                type: "packaging",
                packagingId: "pack-1",
                quantity: 1,
                unit: "pcs",
                createdAt: "2024-01-01T00:00:00.000Z",
            },
            {
                id: "comp-3",
                type: "label",
                labelId: "label-1",
                quantity: 1,
                unit: "pcs",
                createdAt: "2024-01-01T00:00:00.000Z",
            },
        ],
        unitSize: 5,
        unitType: "L",
        unitsPerCase: 4,
        sellingPricePerUnit: 350,
        sellingPricePerCase: 1300,
        costPerKg: 27.22,
        sellingPricePerKg: 70,
        targetProfitMargin: 25,
        minimumProfitMargin: 15,
        distributionChannels: ["retail", "wholesale", "online"],
        shelfLife: 365,
        status: "active",
        barcode: "8901234567890",
        imageUrl: "/products/floor-cleaner-5l.jpg",
        tags: ["floor cleaner", "industrial", "premium"],
        notes: "Best-selling product with consistent demand",
        createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
        id: "2",
        name: "Bathroom Cleaner Pro - 1L Bottle",
        sku: "BCP-1L-002",
        description: "Powerful bathroom cleaning solution with disinfectant properties",
        category: "Bathroom Care",
        components: [
            {
                id: "comp-4",
                type: "recipe",
                recipeId: "recipe-2",
                createdAt: "2024-01-01T00:00:00.000Z",
            },
            {
                id: "comp-5",
                type: "packaging",
                packagingId: "pack-2",
                quantity: 1,
                unit: "pcs",
                createdAt: "2024-01-01T00:00:00.000Z",
            },
            {
                id: "comp-6",
                type: "label",
                labelId: "label-2",
                quantity: 1,
                unit: "pcs",
                createdAt: "2024-01-01T00:00:00.000Z",
            },
        ],
        unitSize: 1,
        unitType: "L",
        unitsPerCase: 12,
        sellingPricePerUnit: 180,
        sellingPricePerCase: 2000,
        costPerKg: 34.06,
        sellingPricePerKg: 180,
        targetProfitMargin: 30,
        minimumProfitMargin: 20,
        distributionChannels: ["retail", "online"],
        shelfLife: 365,
        status: "active",
        barcode: "8901234567891",
        imageUrl: "/products/bathroom-cleaner-1l.jpg",
        tags: ["bathroom cleaner", "disinfectant", "professional"],
        notes: "Popular in hospitality sector",
        createdAt: "2024-01-15T00:00:00.000Z",
    },
    {
        id: "3",
        name: "Glass Cleaner - 500ml Spray",
        sku: "GC-500ML-003",
        description: "Streak-free glass and surface cleaning solution",
        category: "Glass Care",
        components: [
            {
                id: "comp-7",
                type: "recipe",
                recipeId: "recipe-3",
                createdAt: "2024-01-01T00:00:00.000Z",
            },
            {
                id: "comp-8",
                type: "packaging",
                packagingId: "pack-3",
                quantity: 1,
                unit: "pcs",
                createdAt: "2024-01-01T00:00:00.000Z",
            },
            {
                id: "comp-9",
                type: "label",
                labelId: "label-3",
                quantity: 1,
                unit: "pcs",
                createdAt: "2024-01-01T00:00:00.000Z",
            },
        ],
        unitSize: 0.5,
        unitType: "L",
        unitsPerCase: 24,
        sellingPricePerUnit: 120,
        sellingPricePerCase: 2800,
        costPerKg: 22.15,
        sellingPricePerKg: 240,
        targetProfitMargin: 35,
        minimumProfitMargin: 25,
        distributionChannels: ["retail", "wholesale"],
        shelfLife: 365,
        status: "active",
        barcode: "8901234567892",
        imageUrl: "/products/glass-cleaner-500ml.jpg",
        tags: ["glass cleaner", "streak-free", "spray"],
        notes: "High margin product with good shelf presence",
        createdAt: "2024-02-01T00:00:00.000Z",
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
