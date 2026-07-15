import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["app/**/*.test.{ts,tsx}", "lib/**/*.test.{ts,tsx}", "components/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // Pure core functions (createProductCore, subscribeCore) live in "use server"
      // modules that transitively import "server-only"; stub it so they stay unit-testable.
      "server-only": path.resolve(__dirname, "test/server-only-stub.ts"),
    },
  },
});
