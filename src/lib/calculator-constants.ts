// Constants for Cost Calculator

export interface BatchRecommendation {
    size: number;
    label: string;
    description: string;
    efficiency: number;
}

export interface ProductionMetric {
    label: string;
    value: string | number;
    status: "fixed" | "variable" | "efficiency" | "quality";
}

// Batch size configuration
export const BATCH_SIZE_CONFIG = {
    MIN: 10,
    MAX: 1000,
    STEP: 10,
    DEFAULT: 100,
} as const;

// Margin configuration
export const MARGIN_CONFIG = {
    MIN: 0,
    MAX: 99,
    DEFAULT: 35,
} as const;

// Optimization thresholds
export const OPTIMIZATION_THRESHOLDS = {
    HIGH_COST_PERCENTAGE: 20,
    HIGH_IMPACT_SAVINGS: 1000,
    MEDIUM_IMPACT_SAVINGS: 500,
    SUBSTITUTION_SAVINGS_RATE: 0.15,
    FORMULA_OPTIMIZATION_RATE: 0.08,
    MIN_INGREDIENTS_FOR_FORMULA_OPT: 3,
} as const;

// Scenario multipliers
export const SCENARIO_MULTIPLIERS = {
    COST_REDUCTION: 0.9,
    BULK_DISCOUNT: 0.85,
    DOUBLE_BATCH_COST: 1.8,
    DOUBLE_BATCH_EFFICIENCY: 0.9,
    DOUBLE_BATCH_SIZE: 2,
} as const;

// Batch recommendations
export const BATCH_RECOMMENDATIONS: BatchRecommendation[] = [
    {
        size: 100,
        label: "Small Batch",
        description: "Low risk, high flexibility",
        efficiency: 75,
    },
    {
        size: 300,
        label: "Medium Batch",
        description: "Balanced cost and risk",
        efficiency: 88,
    },
    {
        size: 500,
        label: "Large Batch",
        description: "Maximum efficiency",
        efficiency: 95,
    },
];

// Production metrics calculation helpers
export const getProductionMetrics = (batchSize: number): ProductionMetric[] => [
    {
        label: "Setup Cost per Batch",
        value: "₹2,500",
        status: "fixed",
    },
    {
        label: "Labor Hours Required",
        value: `${Math.ceil(batchSize / 25)}h`,
        status: "variable",
    },
    {
        label: "Equipment Utilization",
        value: `${Math.min(100, (batchSize / 500) * 100).toFixed(0)}%`,
        status: "efficiency",
    },
    {
        label: "Quality Control Time",
        value: `${Math.ceil(batchSize / 100)}h`,
        status: "quality",
    },
];

// Economies of scale calculator
export const getEconomiesOfScale = (batchSize: number): "High" | "Medium" | "Low" => {
    if (batchSize > 500) return "High";
    if (batchSize > 200) return "Medium";
    return "Low";
};

// Storage calculator
export const getStorageRequired = (batchSize: number): number => {
    return Math.ceil(batchSize / 50);
};