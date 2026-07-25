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
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Agent tooling, not app code: ruflo/Claude hook helpers are CommonJS by
    // design and shouldn't be held to the app's TS/ESM rules.
    ".claude/**",
    ".claude-flow/**",
    ".worktrees/**",
  ]),
]);

export default eslintConfig;
