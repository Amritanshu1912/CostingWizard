import next from "eslint-config-next";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

const eslintConfig = [
  {
    ignores: ["node_modules", ".next", "src/app/planningOld/**"],
  },

  // Next.js config (must be first actual config)
  ...next,

  // Completely disable ESLint inside planningOld
  {
    files: ["src/app/planningOld/**/*"],
    rules: {
      all: "off",
    },
  },

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
