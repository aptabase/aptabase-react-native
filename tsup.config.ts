import { defineConfig } from "tsup";
const { version } = require("./package.json");

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: {
    compilerOptions: {
      // tsup's dts step injects baseUrl on its own; drop this once tsup stops doing that
      ignoreDeprecations: "6.0",
    },
  },
  target: "es6",
  splitting: false,
  minify: true,
  sourcemap: true,
  clean: true,
  env: {
    PKG_VERSION: version,
  },
  outExtension() {
    return { js: ".js" };
  },
});
