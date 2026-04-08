import assert from "assert";

import { BitBuilder } from "../src/bit-builder";

describe("BitBuilder", () => {
  const bits = ["READ", "WRITE", "DELETE"] as const;

  describe("static resolve", () => {
    it("should OR all values", () => {
      const obj = { a: 1n, b: 2n, c: 4n };
      assert.strictEqual(BitBuilder.resolve(obj), 7n);
    });
  });

  describe("execute without arguments", () => {
    it("should start from 0n and assign sequential bits", () => {
      const builder = new BitBuilder(bits);
      const result = builder.execute();
      assert.strictEqual(result.READ, 1n << 0n);
      assert.strictEqual(result.WRITE, 1n << 1n);
      assert.strictEqual(result.DELETE, 1n << 2n);
    });
  });

  describe("execute with numeric offset", () => {
    it("should shift all bits by offset", () => {
      const builder = new BitBuilder(bits);
      const result = builder.execute({ offset: 10n });
      assert.strictEqual(result.READ, 1n << 10n);
      assert.strictEqual(result.WRITE, 1n << 11n);
      assert.strictEqual(result.DELETE, 1n << 12n);
    });
  });

  describe("execute with object offset", () => {
    it("should continue after previous category", () => {
      const first = new BitBuilder(["A", "B"]).execute();
      const second = new BitBuilder(["C", "D"]).execute({ offset: first });
      assert.strictEqual(second.C, 1n << 2n);
      assert.strictEqual(second.D, 1n << 3n);
    });

    it("should handle empty previous object", () => {
      const second = new BitBuilder(["X"]).execute({ offset: {} });
      assert.strictEqual(second.X, 1n << 0n);
    });
  });

  describe("exclude filter", () => {
    it("should set excluded bits to zero", () => {
      const builder = new BitBuilder(bits);
      const result = builder.execute({ exclude: ["WRITE"] });
      assert.strictEqual(result.READ, 1n << 0n);
      assert.strictEqual(result.WRITE, 0n);
      assert.strictEqual(result.DELETE, 1n << 2n);
    });
  });

  describe("include filter", () => {
    it("should set only included bits to non-zero", () => {
      const builder = new BitBuilder(bits);
      const result = builder.execute({ include: ["READ", "DELETE"] });
      assert.strictEqual(result.READ, 1n << 0n);
      assert.strictEqual(result.WRITE, 0n);
      assert.strictEqual(result.DELETE, 1n << 2n);
    });

    it("exclude has priority over include", () => {
      const builder = new BitBuilder(bits);
      const result = builder.execute({
        exclude: ["READ"],
        include: ["READ", "WRITE"],
      });
      assert.strictEqual(result.READ, 0n);
      assert.strictEqual(result.WRITE, 1n << 1n);
    });
  });

  describe("resolve instance method", () => {
    it("should sum bits like static resolve", () => {
      const builder = new BitBuilder(bits);
      const obj = { a: 1n, b: 2n };
      assert.strictEqual(builder.resolve(obj), BitBuilder.resolve(obj));
    });
  });
});
