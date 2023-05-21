import { builtinModules } from "module";
import { readFileSync } from "fs";
import typescript from "@rollup/plugin-typescript";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

export default [
  {
    input: "src/index.ts",
    external: Object.keys(pkg.dependencies || {})
      .concat(Object.keys(pkg.peerDependencies || {}))
      .concat(builtinModules),
    onwarn: (warning) => {
      throw Object.assign(new Error(), warning);
    },
    strictDeprecations: true,
    output: [
      {
        format: "cjs",
        file: pkg.main,
        exports: "named",
        footer: "module.exports = Object.assign(exports.default, exports);",
        sourcemap: true,
      },
      {
        format: "es",
        file: pkg.module,
        plugins: [emitModulePackageFile()],
        sourcemap: true,
      },
    ],
    plugins: [typescript({ sourceMap: true })],
  },
  {
    input: "src/cli.ts",
    external: Object.keys(pkg.dependencies || {})
      .concat(Object.keys(pkg.peerDependencies || {}))
      .concat(builtinModules),
    onwarn: (warning) => {
      throw Object.assign(new Error(), warning);
    },
    output: [
      {
        format: "cjs",
        file: "dist/cjs/cli.js",
        exports: "named",
        sourcemap: true,
        banner: "#!/usr/bin/env node",
      },
    ],
    plugins: [typescript()],
  },
];

export function emitModulePackageFile() {
  return {
    name: "emit-module-package-file",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "package.json",
        source: `{"type":"module"}`,
      });
    },
  };
}
