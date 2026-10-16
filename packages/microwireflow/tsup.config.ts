import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/flow.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  onSuccess: "cp src/styles.css dist/styles.css",
});
