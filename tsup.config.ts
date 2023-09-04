import { defineConfig } from "tsup";
const { version } = require("./package.json");

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  minify: true,
  sourcemap: true,
  clean: true,
  env: {
    PKG_VERSION: version,
  },
});
