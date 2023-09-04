import { defineConfig } from "vite";

export default defineConfig({
  test: {
    setupFiles: ["./setupVitest.ts"],
    coverage: {
      reporter: ["lcov", "text"],
    },
  },
});
