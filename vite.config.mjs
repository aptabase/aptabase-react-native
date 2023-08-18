import replace from "@rollup/plugin-replace";
import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json" assert { type: "json" };

export default defineConfig({
  build: {
    lib: {
      formats: ["cjs", "es"],
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
      },
      name: "@aptabase/react-native",
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-native"],
    },
  },
  test: {
    setupFiles: ["./setupVitest.ts"],
    coverage: {
      reporter: ["lcov", "text"],
    },
  },
  plugins: [
    dts(),
    replace({
      "env.PKG_VERSION": pkg.version,
    }),
  ],
});
