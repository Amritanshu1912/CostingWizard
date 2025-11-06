// recipe-colors.ts - Professional color constants for recipe components

// Status colors for recipes and variants
export const RECIPE_STATUS_COLORS = {
    active: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500',
        badge: 'bg-green-100 text-green-700 border-green-200',
    },
    testing: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    draft: {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-500',
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    archived: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
        badge: 'bg-orange-100 text-orange-700 border-orange-200',
    },
    inactive: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-500',
        badge: 'bg-gray-100 text-gray-700 border-gray-200',
    },
    discontinued: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
        badge: 'bg-red-100 text-red-700 border-red-200',
    },
} as const;

// Chart colors for cost breakdowns and analytics
export const CHART_COLORS = {
    primary: '#3b82f6',      // blue-500
    secondary: '#10b981',    // emerald-500
    accent: '#f59e0b',       // amber-500
    neutral: '#6b7280',      // gray-500
    success: '#22c55e',      // green-500
    warning: '#f97316',      // orange-500
    danger: '#ef4444',       // red-500
    info: '#06b6d4',         // cyan-500
    purple: '#8b5cf6',       // violet-500
    pink: '#ec4899',         // pink-500
} as const;

// Progress bar colors for target achievement
export const PROGRESS_COLORS = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    neutral: 'bg-gray-500',
} as const;

// Metric card background colors
export const METRIC_BG_COLORS = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    amber: 'bg-amber-50',
    red: 'bg-red-50',
    gray: 'bg-gray-50',
} as const;

// Text colors for various UI elements
export const TEXT_COLORS = {
    primary: 'text-slate-900',
    secondary: 'text-slate-600',
    muted: 'text-slate-500',
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
} as const;

// Border colors
export const BORDER_COLORS = {
    light: 'border-slate-200',
    medium: 'border-slate-300',
    dark: 'border-slate-400',
    primary: 'border-blue-500',
    success: 'border-green-500',
    warning: 'border-amber-500',
    danger: 'border-red-500',
} as const;

// Background gradients for cards and headers
export const GRADIENT_BACKGROUNDS = {
    subtle: 'bg-gradient-to-r from-slate-50 to-white',
    blue: 'bg-gradient-to-r from-blue-50 to-blue-25',
    green: 'bg-gradient-to-r from-green-50 to-green-25',
    purple: 'bg-gradient-to-r from-purple-50 to-purple-25',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get default unit for new ingredients
 */
export const DEFAULT_INGREDIENT_UNIT = "gm" as const;


// Helper function to get status colors
export function getStatusColors(status: keyof typeof RECIPE_STATUS_COLORS) {
    return RECIPE_STATUS_COLORS[status] || RECIPE_STATUS_COLORS.draft;
}



// Helper function to get variance color (positive = red, negative = green)
export function getVarianceColor(variance: number): string {
    return variance > 0 ? TEXT_COLORS.danger : TEXT_COLORS.success;
}
