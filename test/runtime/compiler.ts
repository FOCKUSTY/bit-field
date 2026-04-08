import { bitConfig } from "./permissions";

import { Compiler } from "../../src/compiler";
import { resolve } from "path";

const compiler = new Compiler(
  bitConfig.raw,
  resolve(__dirname, "./permissions.ts"),
  {},
  {
    name: "permissions",
    writeInCompiler: true,
    defaultExportOn: true,
    jsdocs: true,
  },
);
compiler.execute();
console.log("✅ Permissions compiled successfully");
