import assert from "assert";

import { FileManager } from "../src/compiler/file-manager";

import { existsSync, readFileSync, unlinkSync } from "fs";
import { join } from "path";

// Используем временный файл для тестов
const TEST_FILE = join(__dirname, "temp-test-file.txt");

describe("FileManager", () => {
  afterEach(() => {
    if (existsSync(TEST_FILE)) {
      unlinkSync(TEST_FILE);
    }
  });

  it("should create empty file", () => {
    const fm = new FileManager(TEST_FILE);

    fm.createEmpty();

    assert.ok(existsSync(TEST_FILE));
    assert.strictEqual(readFileSync(TEST_FILE, "utf-8"), "");
  });

  it("should read and write content", () => {
    const fm = new FileManager(TEST_FILE);

    fm.write("hello");

    assert.strictEqual(fm.read(), "hello");
  });

  it("should replace markers", () => {
    const fm = new FileManager(TEST_FILE);
    fm.write("START // ## MARK ## \\\\\nold\n// ## MARK ## \\\\\nEND");

    const newContent = fm.replaceMarkers([
      {
        pattern: /\/\/ ## MARK ## \\\\[.\s\S]*\/\/ ## MARK ## \\\\/g,
        replacement: "// ## MARK ## \\\\\nnew\n// ## MARK ## \\\\",
      },
    ]);

    assert.ok(newContent.includes("new"));
    assert.ok(!newContent.includes("old"));
  });

  it("wrapWithMarker adds marker lines", () => {
    const wrapped = FileManager.wrapWithMarker("// MARK", "content");

    assert.strictEqual(wrapped, "// MARK\ncontent\n// MARK");
  });
});
