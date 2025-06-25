import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow unused variables when prefixed with _
      "@typescript-eslint/no-unused-vars": ["warn"],
      // Allow console.log in development
      "no-console": "warn",
      // Set any type to warning instead of error
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow certain hoisting behaviors
      "no-use-before-define": ["error", { 
        "functions": false, 
        "classes": true 
      }],
    }
  }
];

export default eslintConfig;
