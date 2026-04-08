import assert from "assert";

import { CodeGenerator } from "../src/compiler/code-generator";

describe("CodeGenerator", () => {
  const settings = {
    perms: ["READ", "WRITE", "DELETE"],
    roles: ["ADMIN", "USER"],
  };

  it("generateStructure creates nested object with correct shift expressions", () => {
    const gen = new CodeGenerator(settings);
    const structure = gen.generateStructure();

    assert.deepStrictEqual(Object.keys(structure), ["perms", "roles"]);
    assert.match(structure.perms.read, /1n << 0n/);
    assert.match(structure.perms.write, /1n << 1n/);
    assert.match(structure.perms.delete, /1n << 2n/);
    assert.match(structure.roles.admin, /1n << 3n/);
    assert.match(structure.roles.user, /1n << 4n/);
  });

  it("toCodeString produces valid TypeScript", () => {
    const gen = new CodeGenerator(settings);
    const structure = gen.generateStructure();
    const code = gen.toCodeString(structure);
    assert.ok(code.includes("as const"));
    assert.ok(code.includes("1n <<"));
  });

  it("generateExportBlock creates types and optional default export", () => {
    const gen = new CodeGenerator(settings);
    const exportBlock = gen.generateExportBlock("myConst", true);
    assert.ok(exportBlock.includes("export type Keys = keyof typeof myConst"));
    assert.ok(exportBlock.includes("export default myConst"));

    const noDefault = gen.generateExportBlock("myConst", false);
    assert.ok(!noDefault.includes("export default"));
  });
});
