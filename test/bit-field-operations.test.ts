import assert from "assert";

import { BitFieldOperations } from "../src/bit-field-operations";

describe("BitFieldOperations", () => {
  describe("toBigInt", () => {
    it("converts various types", () => {
      assert.strictEqual(BitFieldOperations.toBigInt(5), 5n);
      assert.strictEqual(BitFieldOperations.toBigInt("5"), 5n);
      assert.strictEqual(BitFieldOperations.toBigInt(true), 1n);
      assert.strictEqual(BitFieldOperations.toBigInt(false), 0n);
    });
  });

  describe("equals / notEquals", () => {
    it("equals", () => {
      assert.ok(BitFieldOperations.equals(5n, "5"));
      assert.ok(!BitFieldOperations.equals(5n, 6n));
    });
    it("notEquals", () => {
      assert.ok(BitFieldOperations.notEquals(5n, 6n));
    });
  });

  describe("summarize / add / remove", () => {
    it("summarize", () => {
      assert.strictEqual(BitFieldOperations.summarize(1n, 2n, 4n), 7n);
    });
    it("add", () => {
      assert.strictEqual(BitFieldOperations.add(1n, 2n, 4n), 7n);
    });
    it("remove", () => {
      assert.strictEqual(BitFieldOperations.remove(7n, 2n, 4n), 1n);
    });
  });

  describe("logarithm2", () => {
    it("returns floor(log2)", () => {
      assert.strictEqual(BitFieldOperations.logarithm2(8n), 3n);
      assert.strictEqual(BitFieldOperations.logarithm2(10n), 3n);
    });
    it("throws for zero", () => {
      assert.throws(() => BitFieldOperations.logarithm2(0n));
    });
  });

  describe("max", () => {
    it("returns maximum", () => {
      assert.strictEqual(BitFieldOperations.max(1n, 5n, 3n), 5n);
    });
  });

  describe("maskOfLength / maskRange", () => {
    it("maskOfLength", () => {
      assert.strictEqual(BitFieldOperations.maskOfLength(3), 0b111n);
      assert.strictEqual(BitFieldOperations.maskOfLength(0), 0n);
    });
    it("maskRange", () => {
      assert.strictEqual(BitFieldOperations.maskRange(2, 3), 0b11100n);
    });
  });
});
