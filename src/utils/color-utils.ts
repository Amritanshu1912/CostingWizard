// utils/color-utils.ts

// Chart Colors
export const CHART_COLORS = {
  light: {
    chart1: "#5A9BD8", // ocean blue — calm + clear
    chart2: "#7ED8C3", // seafoam green — fresh + soft
    chart3: "#d7b986ff", // sandy beige — warm neutral
    chart4: "#F4A18E", // coral accent — gentle pop
    chart5: "#4CB1A2", // teal — grounding tone
  },
  dark: {
    chart1: "#6CB8F0", // bright ocean blue
    chart2: "#8FE3CF", // misty green foam
    chart3: "#F7DFAE", // light sand glow
    chart4: "#F89F8C", // warm coral
    chart5: "#5ED1C1", // cool teal
  },
} as const;

/**
 * Predefined colors for common categories
 */
export const PREDEFINED_CATEGORY_COLORS: Record<string, string> = {
  acids: "#ef4444", // red
  bases: "#3b82f6", // blue
  colors: "#a855f7", // purple
  salts: "#06b6d4", // cyan
  thickeners: "#10b981", // green
  bottles: "#f59e0b", // amber
  labels: "#ec4899", // pink
  other: "#6b7280", // gray
};

/**
 * Generate a color based on string hash
 * Creates consistent colors for the same input
 */
export function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate pleasant pastel colors using HSL
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 15); // 65-80%
  const lightness = 55 + (Math.abs(hash >> 8) % 15); // 55-70%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Assign color to a category
 * Uses predefined colors for common categories, generates for new ones
 */
export function assignCategoryColor(categoryName: string): string {
  const normalized = categoryName.toLowerCase().trim();

  // Check if predefined
  if (PREDEFINED_CATEGORY_COLORS[normalized]) {
    return PREDEFINED_CATEGORY_COLORS[normalized];
  }

  // Generate hash-based color
  return generateColorFromString(categoryName);
}

/**
 * Convert hex color to HSL for manipulation
 */
export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove the hash if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
