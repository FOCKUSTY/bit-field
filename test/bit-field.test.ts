import assert from "assert";

import { BitField } from "../src/bit-field";

describe("BitField", () => {
  describe("constructor and basic values", () => {
    it("should create with default 0n", () => {
      const bf = new BitField();
      assert.strictEqual(bf.bit, 0n);
    });

    it("should accept bigint, number, string, boolean", () => {
      assert.strictEqual(new BitField(5n).bit, 5n);
      assert.strictEqual(new BitField(5).bit, 5n);
      assert.strictEqual(new BitField("5").bit, 5n);
      assert.strictEqual(new BitField(true).bit, 1n);
    });

    it("should accept another BitField instance", () => {
      const original = new BitField(0b1010n);
      const copy = new BitField(original);
      assert.strictEqual(copy.bit, original.bit);
      assert.notStrictEqual(copy, original);
    });
  });

  describe("static factories", () => {
    it("fromBinary should parse valid binary string", () => {
      const bf = BitField.fromBinary("1010");
      assert.strictEqual(bf.bit, 0b1010n);
    });

    it("fromBinary should throw on invalid characters", () => {
      assert.throws(() => BitField.fromBinary("1020"), /Invalid binary string/);
    });

    it("fromHex should parse valid hex string", () => {
      const bf = BitField.fromHex("a");
      assert.strictEqual(bf.bit, 0xan);
    });

    it("fromHex should throw on invalid characters", () => {
      assert.throws(() => BitField.fromHex("ag"), /Invalid hex string/);
    });
  });

  describe("add / remove / clear", () => {
    it("add should set bits", () => {
      const bf = new BitField(0b0001);
      const added = bf.add(0b0010, 0b0100);
      assert.strictEqual(added.bit, 0b0111n);
      assert.strictEqual(bf.bit, 0b0001n); // original unchanged
    });

    it("remove should clear bits", () => {
      const bf = new BitField(0b0111);
      const removed = bf.remove(0b0010, 0b0100);
      assert.strictEqual(removed.bit, 0b0001n);
    });

    it("clear should set to zero", () => {
      const bf = new BitField(0b1111);
      const cleared = bf.clear();
      assert.strictEqual(cleared.bit, 0n);
    });
  });

  describe("logical operations", () => {
    it("and", () => {
      const bf = new BitField(0b1100);
      const result = bf.and(0b1010);
      assert.strictEqual(result.bit, 0b1000n);
    });

    it("or", () => {
      const bf = new BitField(0b1100);
      const result = bf.or(0b0011);
      assert.strictEqual(result.bit, 0b1111n);
    });

    it("xor", () => {
      const bf = new BitField(0b1100);
      const result = bf.xor(0b1010);
      assert.strictEqual(result.bit, 0b0110n);
    });

    it("not with default bit length", () => {
      const bf = new BitField(0b1010); // binary length 4
      const not = bf.not();
      // 0b1010 (10) -> ~10 & 0b1111 = 0b0101 (5)
      assert.strictEqual(not.bit, 0b0101n);
    });

    it("not with custom bit length", () => {
      const bf = new BitField(0b1010);
      const not = bf.not(8); // mask 0b11111111
      assert.strictEqual(not.bit, 0b11110101n);
    });
  });

  describe("shifts", () => {
    it("shiftLeft", () => {
      const bf = new BitField(0b0001);
      assert.strictEqual(bf.shiftLeft(3).bit, 0b1000n);
    });

    it("shiftRight", () => {
      const bf = new BitField(0b1000);
      assert.strictEqual(bf.shiftRight(3).bit, 0b0001n);
    });
  });

  describe("has / hasOne / hasSome", () => {
    const bf = new BitField(0b1010); // bits 1 and 3 set

    it("hasOne checks single bit", () => {
      assert.ok(bf.hasOne(0b1000));
      assert.ok(bf.hasOne(0b0010));
      assert.ok(!bf.hasOne(0b0100));
    });

    it("has checks all bits (multiple)", () => {
      assert.ok(bf.has(0b1000, 0b0010));
      assert.ok(!bf.has(0b1000, 0b0100));
    });

    it("has with single argument works like hasOne", () => {
      assert.ok(bf.has(0b1000));
      assert.ok(!bf.has(0b0100));
    });

    it("hasSome checks at least one", () => {
      assert.ok(bf.hasSome(0b1000, 0b0100));
      assert.ok(!bf.hasSome(0b0100, 0b0001));
    });
  });

  describe("range operations", () => {
    it("hasRange", () => {
      const bf = new BitField(0b11110000);
      assert.ok(bf.hasRange(4, 7)); // bits 4-7 are 1
      assert.ok(!bf.hasRange(0, 3));
    });

    it("setRange", () => {
      const bf = new BitField(0b0000);
      const result = bf.setRange(2, 5);
      assert.strictEqual(result.bit, 0b111100n);
    });

    it("clearRange", () => {
      const bf = new BitField(0b11111111);
      const result = bf.clearRange(2, 5);
      // bits 2-5 become 0
      assert.strictEqual(result.bit, 0b11000011n);
    });

    it("getRangeMask throws if from > to", () => {
      const bf = new BitField();
      assert.throws(() => bf["getRangeMask"](5, 3));
    });
  });

  describe("bit extraction", () => {
    it("getLowestSetBit", () => {
      const bf = new BitField(0b1100);
      assert.strictEqual(bf.getLowestSetBit(), 0b0100n);
      assert.strictEqual(new BitField(0).getLowestSetBit(), null);
    });

    it("getHighestSetBit", () => {
      const bf = new BitField(0b1010);
      assert.strictEqual(bf.getHighestSetBit(), 0b1000n);
      assert.strictEqual(new BitField(0).getHighestSetBit(), null);
    });
  });

  describe("equality and subset", () => {
    it("equals", () => {
      assert.ok(new BitField(0b101).equals(0b101));
      assert.ok(!new BitField(0b101).equals(0b111));
    });

    it("isSubsetOf", () => {
      const a = new BitField(0b0011);
      const b = new BitField(0b1111);
      assert.ok(a.isSubsetOf(b));
      assert.ok(!b.isSubsetOf(a));
    });
  });

  describe("conversions", () => {
    const bf = new BitField(0b1010);

    it("toArray", () => {
      assert.deepStrictEqual(bf.toArray(), [0b0010n, 0b1000n]);
    });

    it("toBinaryString", () => {
      assert.strictEqual(bf.toBinaryString(), "1010");
    });

    it("toHexString", () => {
      assert.strictEqual(bf.toHexString(), "a");
    });

    it("toString", () => {
      assert.strictEqual(bf.toString(), "10");
    });

    it("toNumber", () => {
      assert.strictEqual(bf.toNumber(), 10);
    });

    it("toJSON", () => {
      assert.strictEqual(bf.toJSON(), "10");
    });
  });

  describe("iteration", () => {
    it("for-of iterates over set bits", () => {
      const bf = new BitField(0b1101);
      const bits: bigint[] = [];
      for (const bit of bf) {
        bits.push(bit);
      }
      assert.deepStrictEqual(bits, [1n, 4n, 8n]); // order from LSB to MSB
    });

    it("forEach", () => {
      const bf = new BitField(0b1010);
      const bits: bigint[] = [];
      bf.forEach((bit) => bits.push(bit));
      assert.deepStrictEqual(bits, [2n, 8n]);
    });
  });

  describe("clone and set", () => {
    it("clone returns independent copy", () => {
      const bf = new BitField(0b1111);
      const clone = bf.clone();
      assert.strictEqual(clone.bit, bf.bit);
      assert.notStrictEqual(clone, bf);
    });

    it("set replaces value", () => {
      const bf = new BitField(0b0001);
      const updated = bf.set(0b1000);
      assert.strictEqual(updated.bit, 0b1000n);
    });
  });
});
