import type { Material, Product, ProductionPlan, PurchaseOrder, RawMaterial, Supplier, Supplier2, SupplierMaterial2 } from "@/lib/types"
import {
    Calendar, DollarSign, Package, ShoppingCart, FlaskConical as Flask,
} from "lucide-react"
// Sample data for analytics
export const priceHistoryData = [
    { month: "Jan", avgPrice: 245.5, materials: 142 },
    { month: "Feb", avgPrice: 251.2, materials: 145 },
    { month: "Mar", avgPrice: 248.8, materials: 148 },
    { month: "Apr", avgPrice: 255.3, materials: 152 },
    { month: "May", avgPrice: 262.1, materials: 156 },
    { month: "Jun", avgPrice: 258.9, materials: 159 },
]

export const supplierPerformance = [
    { supplier: "Supplier A", reliability: 95, avgPrice: 180, orders: 45 },
    { supplier: "Supplier B", reliability: 88, avgPrice: 165, orders: 38 },
    { supplier: "Supplier C", reliability: 92, avgPrice: 195, orders: 52 },
    { supplier: "Supplier D", reliability: 85, avgPrice: 155, orders: 28 },
    { supplier: "Supplier E", reliability: 90, avgPrice: 175, orders: 35 },
]

export const costTrends = [
    { month: "Jan", rawMaterials: 125000, production: 89000, total: 214000 },
    { month: "Feb", rawMaterials: 132000, production: 92000, total: 224000 },
    { month: "Mar", rawMaterials: 128000, production: 88000, total: 216000 },
    { month: "Apr", rawMaterials: 145000, production: 95000, total: 240000 },
    { month: "May", rawMaterials: 152000, production: 98000, total: 250000 },
    { month: "Jun", rawMaterials: 148000, production: 96000, total: 244000 },
]

export const materialUsage = [
    { material: "NaCl", usage: 450, cost: 2700, efficiency: 95 },
    { material: "Soda Ash", usage: 320, cost: 13104, efficiency: 88 },
    { material: "CBS-X", usage: 15, cost: 33862, efficiency: 92 },
    { material: "Caustic Soda", usage: 180, cost: 10773, efficiency: 90 },
    { material: "AOS Powder", usage: 250, cost: 38850, efficiency: 85 },
]

export const qualityMetrics = [
    { month: "Jan", defectRate: 2.1, customerSatisfaction: 94, returnRate: 1.2 },
    { month: "Feb", defectRate: 1.8, customerSatisfaction: 95, returnRate: 1.0 },
    { month: "Mar", defectRate: 2.3, customerSatisfaction: 93, returnRate: 1.4 },
    { month: "Apr", defectRate: 1.5, customerSatisfaction: 96, returnRate: 0.8 },
    { month: "May", defectRate: 1.9, customerSatisfaction: 95, returnRate: 1.1 },
    { month: "Jun", defectRate: 1.6, customerSatisfaction: 97, returnRate: 0.9 },
]

// from cost-calculator
export const sampleMaterials: Material[] = [
    {
        id: "1",
        name: "Acid Blue Color",
        price: 1680,
        category: "Colors",
        minOrder: 1,
        bulkDiscount: [
            { quantity: 10, discount: 5 },
            { quantity: 25, discount: 12 },
        ],
    },
    {
        id: "2",
        name: "Acid Slurry 90%",
        price: 122.85,
        category: "Acids",
        minOrder: 5,
        bulkDiscount: [
            { quantity: 50, discount: 8 },
            { quantity: 100, discount: 15 },
        ],
    },
    {
        id: "3",
        name: "CBS-X",
        price: 2257.5,
        category: "Thickeners",
        minOrder: 2,
        bulkDiscount: [
            { quantity: 5, discount: 6 },
            { quantity: 15, discount: 18 },
        ],
    },
    {
        id: "4",
        name: "Caustic Soda",
        price: 59.85,
        category: "Bases",
        minOrder: 10,
        bulkDiscount: [
            { quantity: 100, discount: 10 },
            { quantity: 500, discount: 22 },
        ],
    },
    {
        id: "5",
        name: "Citric Acid",
        price: 97.65,
        category: "Acids",
        minOrder: 5,
        bulkDiscount: [
            { quantity: 25, discount: 7 },
            { quantity: 100, discount: 16 },
        ],
    },
    {
        id: "6",
        name: "NaCl",
        price: 6,
        category: "Salts",
        minOrder: 50,
        bulkDiscount: [
            { quantity: 500, discount: 12 },
            { quantity: 1000, discount: 25 },
        ],
    },
];

// from dashboard overview
export const quickStats = [
    {
        title: "Total Raw Materials",
        value: "156",
        change: "+12%",
        trend: "up",
        icon: Package,
    },
    {
        title: "Active Products",
        value: "24",
        change: "+3%",
        trend: "up",
        icon: Flask,
    },
    {
        title: "Production Plans",
        value: "8",
        change: "-2%",
        trend: "down",
        icon: Calendar,
    },
    {
        title: "Avg Cost per kg",
        value: "₹245.50",
        change: "+5.2%",
        trend: "up",
        icon: DollarSign,
    },
];

export const recentMaterials = [
    { name: "Acid Blue Color", price: "₹1,680.00", tax: "5%", status: "active" },
    { name: "CBS-X", price: "₹2,257.50", tax: "5%", status: "active" },
    { name: "AOS Powder 96%", price: "₹155.40", tax: "5%", status: "active" },
    { name: "Citric Acid", price: "₹97.65", tax: "5%", status: "low-stock" },
    { name: "Caustic Soda", price: "₹59.85", tax: "5%", status: "active" },
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
        description: "Design new product formulations",
        href: "/formulations",
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

// from formulations manager
// Sample materials data (would come from materials manager in real app)
export const availableMaterials = [
    { id: "1", name: "Acid Blue Color", price: 1680 },
    { id: "2", name: "Acid Slurry 90%", price: 122.85 },
    { id: "3", name: "CBS-X", price: 2257.5 },
    { id: "4", name: "Caustic Soda", price: 59.85 },
    { id: "5", name: "Citric Acid", price: 97.65 },
    { id: "6", name: "NaCl", price: 6 },
    { id: "7", name: "Dolamite", price: 5.25 },
    { id: "8", name: "Soda Ash", price: 40.95 },
    { id: "9", name: "AOS Powder 96%", price: 155.4 },
];

export const sampleProducts: Product[] = [
    {
        id: "1",
        product_name: "Premium Floor Cleaner",
        description: "High-performance floor cleaning solution",
        composition: [
            {
                material_id: "6",
                material_name: "NaCl",
                qty_kg: 0.35,
                cost_per_kg: 6,
                total_cost: 2.1,
            },
            {
                material_id: "7",
                material_name: "Dolamite",
                qty_kg: 0.25,
                cost_per_kg: 5.25,
                total_cost: 1.31,
            },
            {
                material_id: "8",
                material_name: "Soda Ash",
                qty_kg: 0.22,
                cost_per_kg: 40.95,
                total_cost: 9.01,
            },
            {
                material_id: "2",
                material_name: "Acid Slurry 90%",
                qty_kg: 0.08,
                cost_per_kg: 122.85,
                total_cost: 9.83,
            },
            {
                material_id: "4",
                material_name: "Caustic Soda",
                qty_kg: 0.018,
                cost_per_kg: 59.85,
                total_cost: 1.08,
            },
            {
                material_id: "9",
                material_name: "AOS Powder 96%",
                qty_kg: 0.025,
                cost_per_kg: 155.4,
                total_cost: 3.89,
            },
        ],
        total_cost_per_kg: 27.22,
        selling_price_per_kg: 45.0,
        profit_margin: 39.5,
        batch_size_kg: 100,
        status: "active",
    },
    {
        id: "2",
        product_name: "Bathroom Cleaner Pro",
        description: "Powerful bathroom cleaning formula",
        composition: [
            {
                material_id: "5",
                material_name: "Citric Acid",
                qty_kg: 0.15,
                cost_per_kg: 97.65,
                total_cost: 14.65,
            },
            {
                material_id: "4",
                material_name: "Caustic Soda",
                qty_kg: 0.05,
                cost_per_kg: 59.85,
                total_cost: 2.99,
            },
            {
                material_id: "2",
                material_name: "Acid Slurry 90%",
                qty_kg: 0.12,
                cost_per_kg: 122.85,
                total_cost: 14.74,
            },
            {
                material_id: "1",
                material_name: "Acid Blue Color",
                qty_kg: 0.001,
                cost_per_kg: 1680,
                total_cost: 1.68,
            },
        ],
        total_cost_per_kg: 34.06,
        selling_price_per_kg: 55.0,
        profit_margin: 38.1,
        batch_size_kg: 50,
        status: "active",
    },
];

// from cost-calculator
export const sampleRawMaterials: RawMaterial[] = [
    {
        id: "1",
        material: "Acid Blue Color",
        price_per_kg: 1600,
        tax: 5,
        price_with_tax_per_kg: 1680,
        supplier_id: "default",
        category: "Colors",
        status: "active",
    },
    {
        id: "2",
        material: "Acid Slurry 90%",
        price_per_kg: 117,
        tax: 5,
        price_with_tax_per_kg: 122.85,
        supplier_id: "default",
        category: "Acids",
        status: "active",
    },
    {
        id: "3",
        material: "CBS-X",
        price_per_kg: 2150,
        tax: 5,
        price_with_tax_per_kg: 2257.5,
        supplier_id: "default",
        category: "Thickeners",
        status: "low-stock",
    },
    {
        id: "4",
        material: "Caustic Soda",
        price_per_kg: 57,
        tax: 5,
        price_with_tax_per_kg: 59.85,
        supplier_id: "default",
        category: "Bases",
        status: "active",
    },
    {
        id: "5",
        material: "Citric Acid",
        price_per_kg: 93,
        tax: 5,
        price_with_tax_per_kg: 97.65,
        supplier_id: "default",
        category: "Acids",
        status: "active",
    },
];

export const initialCategories = [
    { id: "1", name: "Acids", description: "Acidic compounds and solutions" },
    { id: "2", name: "Bases", description: "Basic compounds and alkalis" },
    { id: "3", name: "Colors", description: "Dyes and coloring agents" },
    { id: "4", name: "Thickeners", description: "Viscosity modifiers" },
    { id: "5", name: "Salts", description: "Salt compounds" },
    { id: "6", name: "Oils", description: "Oil-based materials" },
    { id: "7", name: "Other", description: "Miscellaneous materials" },
];

// from procurement-manager
export const sampleSuppliers: Supplier[] = [
    {
        id: "1",
        name: "ChemSupply Pro",
        contact: "sales@chemsupply.com",
        phone: "+91-9876543210",
        rating: 4.5,
        materials: [
            {
                material_id: "1",
                material_name: "Acid Blue Color",
                price_per_kg: 1650,
                moq: 25,
                lead_time_days: 7,
                availability: "in-stock",
            },
            {
                material_id: "2",
                material_name: "Citric Acid",
                price_per_kg: 95,
                moq: 50,
                lead_time_days: 5,
                availability: "in-stock",
            },
            {
                material_id: "3",
                material_name: "Caustic Soda",
                price_per_kg: 58,
                moq: 100,
                lead_time_days: 3,
                availability: "limited",
            },
        ],
        performance: {
            onTimeDelivery: 92,
            qualityScore: 88,
            priceCompetitiveness: 85,
        },
    },
    {
        id: "2",
        name: "Industrial Chemicals Ltd",
        contact: "orders@indchem.com",
        phone: "+91-9876543211",
        rating: 4.2,
        materials: [
            {
                material_id: "1",
                material_name: "Acid Blue Color",
                price_per_kg: 1680,
                moq: 20,
                lead_time_days: 10,
                availability: "in-stock",
            },
            {
                material_id: "4",
                material_name: "AOS Powder 96%",
                price_per_kg: 152,
                moq: 30,
                lead_time_days: 7,
                availability: "in-stock",
            },
            {
                material_id: "5",
                material_name: "CBS-X",
                price_per_kg: 2200,
                moq: 10,
                lead_time_days: 14,
                availability: "limited",
            },
        ],
        performance: {
            onTimeDelivery: 88,
            qualityScore: 91,
            priceCompetitiveness: 78,
        },
    },
    {
        id: "3",
        name: "Global Materials Co",
        contact: "info@globalmaterials.com",
        phone: "+91-9876543212",
        rating: 3.8,
        materials: [
            {
                material_id: "2",
                material_name: "Citric Acid",
                price_per_kg: 98,
                moq: 40,
                lead_time_days: 6,
                availability: "in-stock",
            },
            {
                material_id: "6",
                material_name: "Soda Ash",
                price_per_kg: 39,
                moq: 200,
                lead_time_days: 4,
                availability: "in-stock",
            },
            {
                material_id: "7",
                material_name: "NaCl",
                price_per_kg: 5.8,
                moq: 500,
                lead_time_days: 2,
                availability: "in-stock",
            },
        ],
        performance: {
            onTimeDelivery: 85,
            qualityScore: 82,
            priceCompetitiveness: 92,
        },
    },
];

export const sampleOrders: PurchaseOrder[] = [
    {
        id: "PO-001",
        supplier_id: "1",
        supplier_name: "ChemSupply Pro",
        items: [
            {
                material_id: "1",
                material_name: "Acid Blue Color",
                quantity: 50,
                unit_price: 1650,
                total_price: 82500,
            },
            {
                material_id: "2",
                material_name: "Citric Acid",
                quantity: 100,
                unit_price: 95,
                total_price: 9500,
            },
        ],
        total_cost: 92000,
        status: "confirmed",
        order_date: "2024-01-15",
        expected_delivery: "2024-01-22",
    },
    {
        id: "PO-002",
        supplier_id: "2",
        supplier_name: "Industrial Chemicals Ltd",
        items: [
            {
                material_id: "4",
                material_name: "AOS Powder 96%",
                quantity: 75,
                unit_price: 152,
                total_price: 11400,
            },
        ],
        total_cost: 11400,
        status: "sent",
        order_date: "2024-01-18",
        expected_delivery: "2024-01-25",
    },
];

// Sample data from production-planning

export const availableProducts = [
    {
        id: "1",
        name: "Premium Floor Cleaner",
        cost_per_kg: 27.22,
        selling_price: 45.0,
    },
    {
        id: "2",
        name: "Bathroom Cleaner Pro",
        cost_per_kg: 34.06,
        selling_price: 55.0,
    },
    { id: "3", name: "Glass Cleaner", cost_per_kg: 22.15, selling_price: 38.0 },
    {
        id: "4",
        name: "Kitchen Degreaser",
        cost_per_kg: 31.5,
        selling_price: 52.0,
    },
];

export const samplePlans: ProductionPlan[] = [
    {
        id: "1",
        plan_name: "Q1 Production Batch",
        description: "First quarter production planning",
        start_date: "2024-01-15",
        end_date: "2024-03-31",
        products: [
            {
                product_id: "1",
                product_name: "Premium Floor Cleaner",
                quantity_kg: 500,
                cost_per_kg: 27.22,
                total_cost: 13610,
                materials_required: [
                    {
                        material_id: "1",
                        material_name: "NaCl",
                        required_qty: 175,
                        available_qty: 200,
                        shortage: 0,
                        cost_per_kg: 6,
                        total_cost: 1050,
                    },
                    {
                        material_id: "2",
                        material_name: "Soda Ash",
                        required_qty: 110,
                        available_qty: 80,
                        shortage: 30,
                        cost_per_kg: 40.95,
                        total_cost: 4504.5,
                    },
                ],
            },
            {
                product_id: "2",
                product_name: "Bathroom Cleaner Pro",
                quantity_kg: 300,
                cost_per_kg: 34.06,
                total_cost: 10218,
                materials_required: [
                    {
                        material_id: "3",
                        material_name: "Citric Acid",
                        required_qty: 45,
                        available_qty: 60,
                        shortage: 0,
                        cost_per_kg: 97.65,
                        total_cost: 4394.25,
                    },
                    {
                        material_id: "4",
                        material_name: "Caustic Soda",
                        required_qty: 15,
                        available_qty: 25,
                        shortage: 0,
                        cost_per_kg: 59.85,
                        total_cost: 897.75,
                    },
                ],
            },
        ],
        total_cost: 23828,
        total_revenue: 38500,
        total_profit: 14672,
        status: "in-progress",
        progress: 65,
    },
    {
        id: "2",
        plan_name: "Special Order Batch",
        description: "Custom order for large client",
        start_date: "2024-02-01",
        end_date: "2024-02-15",
        products: [
            {
                product_id: "3",
                product_name: "Glass Cleaner",
                quantity_kg: 200,
                cost_per_kg: 22.15,
                total_cost: 4430,
                materials_required: [
                    {
                        material_id: "5",
                        material_name: "Ammonia",
                        required_qty: 20,
                        available_qty: 30,
                        shortage: 0,
                        cost_per_kg: 45.0,
                        total_cost: 900,
                    },
                ],
            },
        ],
        total_cost: 4430,
        total_revenue: 7600,
        total_profit: 3170,
        status: "scheduled",
        progress: 0,
    },
];

// from Supplier Management
export const sampleSuppliers2: Supplier2[] = [
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
        notes: "Reliable supplier for acids and bases",
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
        notes: "Specializes in industrial colors and dyes",
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
        notes: "Good for bulk orders, competitive pricing",
        createdAt: "2024-02-01",
    },
];

export const sampleSupplierMaterials: SupplierMaterial2[] = [
    {
        id: "1",
        supplierId: "1",
        materialName: "Acid Slurry 90%",
        materialCategory: "Acids",
        unitPrice: 122.85,
        currency: "INR",
        moq: 50,
        unit: "kg",
        bulkDiscounts: [
            { quantity: 100, discount: 5 },
            { quantity: 500, discount: 12 },
            { quantity: 1000, discount: 18 },
        ],
        leadTime: 7,
        availability: "in-stock",
        lastUpdated: "2024-12-20",
        notes: "High purity, consistent quality",
    },
    {
        id: "2",
        supplierId: "1",
        materialName: "Caustic Soda",
        materialCategory: "Bases",
        unitPrice: 59.85,
        currency: "INR",
        moq: 100,
        unit: "kg",
        bulkDiscounts: [
            { quantity: 500, discount: 8 },
            { quantity: 1000, discount: 15 },
        ],
        leadTime: 5,
        availability: "in-stock",
        lastUpdated: "2024-12-20",
        notes: "Industrial grade, 99% purity",
    },
    {
        id: "3",
        supplierId: "2",
        materialName: "Acid Blue Color",
        materialCategory: "Colors",
        unitPrice: 1680,
        currency: "INR",
        moq: 5,
        unit: "kg",
        bulkDiscounts: [
            { quantity: 10, discount: 3 },
            { quantity: 25, discount: 8 },
        ],
        leadTime: 10,
        availability: "limited",
        lastUpdated: "2024-12-19",
        notes: "Premium quality, vibrant color",
    },
    {
        id: "4",
        supplierId: "2",
        materialName: "Acid Blue Color",
        materialCategory: "Colors",
        unitPrice: 1750,
        currency: "INR",
        moq: 3,
        unit: "kg",
        bulkDiscounts: [
            { quantity: 15, discount: 5 },
            { quantity: 30, discount: 12 },
        ],
        leadTime: 12,
        availability: "in-stock",
        lastUpdated: "2024-12-18",
        notes: "Alternative supplier, slightly higher price but lower MOQ",
    },
    {
        id: "5",
        supplierId: "3",
        materialName: "NaCl",
        materialCategory: "Salts",
        unitPrice: 6,
        currency: "INR",
        moq: 500,
        unit: "kg",
        bulkDiscounts: [
            { quantity: 1000, discount: 10 },
            { quantity: 5000, discount: 20 },
        ],
        leadTime: 3,
        availability: "in-stock",
        lastUpdated: "2024-12-21",
        notes: "Food grade quality, bulk pricing available",
    },
];