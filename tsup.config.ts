import { defineConfig } from "tsup";
const { version } = require("./package.json");

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
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
