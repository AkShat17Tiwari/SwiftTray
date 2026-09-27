import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "node_modules/**",
    "node_modules.bak/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Convex generated code — not hand-written, don't lint it
    "convex/_generated/**",
  ]),
  {
    rules: {
      // Allow intentionally-unused values when prefixed with an underscore
      // (e.g. destructuring an object to omit a field)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);

export default eslintConfig;
