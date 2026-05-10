import assert from "assert";

import { BitBuilder } from "../src/bit-builder";

describe("BitBuilder", () => {
  const bits = ["READ", "WRITE", "DELETE"] as const;

  describe("resolveConfig", () => {
    it("should resolve a single category with include and exclude", () => {
      const config = {
        perms: { include: ["READ", "WRITE"], exclude: ["DELETE"] },
      };
      const bitConfig = BitBuilder.fromConfig(config);
      const resolved = BitBuilder.resolveConfig(bitConfig);

      // available: READ(1), WRITE(2), DELETE(4) => сумма 7
      assert.strictEqual(resolved.available.perms, 7n);
      // default: READ(1), WRITE(2), DELETE(0) => сумма 3
      assert.strictEqual(resolved.default.perms, 3n);
    });

    it("should resolve multiple categories with sequential offsets", () => {
      const config = {
        cat1: { include: ["A", "B"], exclude: [] },
        cat2: { include: ["C"], exclude: ["D"] },
      };
      const bitConfig = BitBuilder.fromConfig(config);
      const resolved = BitBuilder.resolveConfig(bitConfig);

      // cat1: A=1, B=2 => available=3, default=3
      assert.strictEqual(resolved.available.cat1, 3n);
      assert.strictEqual(resolved.default.cat1, 3n);
      // cat2: смещение log2(2)+1=2, C=1<<2=4, D=1<<3=8 (exclude)
      // available: 4|8=12, default: 4|0=4
      assert.strictEqual(resolved.available.cat2, 12n);
      assert.strictEqual(resolved.default.cat2, 4n);
    });

    it("should handle categories with only includes", () => {
      const config = {
        flags: { include: ["X", "Y", "Z"], exclude: [] },
      };
      const resolved = BitBuilder.resolveConfig(BitBuilder.fromConfig(config));
      // available = default = 1|2|4 = 7
      assert.strictEqual(resolved.available.flags, 7n);
      assert.strictEqual(resolved.default.flags, 7n);
    });

    it("should handle categories with only excludes", () => {
      const config = {
        empty: { include: [], exclude: ["A", "B"] },
      };
      const resolved = BitBuilder.resolveConfig(BitBuilder.fromConfig(config));
      // available: A=1, B=2 (смещение 0) => 3
      // default: A=0, B=0 => 0
      assert.strictEqual(resolved.available.empty, 3n);
      assert.strictEqual(resolved.default.empty, 0n);
    });

    it("should return object with same keys as input", () => {
      const config = {
        a: { include: ["1"], exclude: [] },
        b: { include: ["2"], exclude: [] },
      };
      const resolved = BitBuilder.resolveConfig(BitBuilder.fromConfig(config));
      assert.deepStrictEqual(Object.keys(resolved.available).sort(), ["a", "b"]);
      assert.deepStrictEqual(Object.keys(resolved.default).sort(), ["a", "b"]);
    });

    it("should work with empty include and exclude (both empty)", () => {
      const config = {
        none: { include: [], exclude: [] },
      };
      const resolved = BitBuilder.resolveConfig(BitBuilder.fromConfig(config));
      // Нет битов для генерации -> offset останется 0, результат 0n
      assert.strictEqual(resolved.available.none, 0n);
      assert.strictEqual(resolved.default.none, 0n);
    });
  });

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
