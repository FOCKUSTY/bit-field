import Test from "./test.class";

import { BitField, BitBuilder } from "../index";

describe(BitField.name + ".", () => {
  new Test(BitField.equals.name + "(...)", [
    [true, BitField.equals(1n, "1"), [1n, "1"]],
    [true, BitField.equals(1n, 1n), [1n, 1n]],
    [false, BitField.equals(1n, 2n), [1n, 2n]],
    [false, BitField.equals(1n, "2"), [1n, "2"]],
  ]).execute();

  new Test(BitField.add.name + "(...)", [
    [7n, BitField.add(1n, 2n, 4n), [1n, 2n, 4n]],
    [6n, BitField.add(2n, 2n, 4n), [2n, 2n, 4n]],
    [1n, BitField.add(1n, 1n, 1n), [1n, 1n, 1n]],
  ]).execute();

  new Test(BitField.summarize.name + "(...)", [
    [7n, BitField.summarize(1n, 2n, 4n)],
    [6n, BitField.summarize(2n, 2n, 4n)],
    [5n, BitField.summarize(1n, 4n)],
    [1n, BitField.summarize(1n, 1n)],
    [1n, BitField.summarize(1n)],
  ]).execute();

  new Test(BitField.remove.name + "(...)", [
    [1n, BitField.remove(7n, 4n, 2n)],
    [8n, BitField.remove(14n, 4n, 2n)],
    [8n, BitField.remove(14n, 4n, 2n, 1n)],
    [14n, BitField.remove(14n, 1n)],
  ]).execute();

  new Test(BitField.logarithm2.name + "(...)", [
    [10n, BitField.logarithm2(1n << 10n)],
    [20n, BitField.logarithm2(1n << 20n)],
    [3n, BitField.logarithm2(1n << 3n)],
    [2n, BitField.logarithm2(1n << 2n)],
    [11n, BitField.logarithm2(2n << 10n)],
    [12n, BitField.logarithm2(4n << 10n)],
  ]).execute();

  new Test(BitField.max.name + "(...)", [
    [4n, BitField.max(1n, 2n, 3n, 4n)],
    [1n, BitField.max(1n, -2n, -4n)],
    [17n, BitField.max(17n, 2n, 3n, 4n)],
  ]).execute();
});

describe("new " + BitField.name + "(...).", () => {
  new Test(BitField.prototype.add.name + "(...)", [
    [7n, new BitField(1n).add(2n, 4n)],
    [6n, new BitField(2n).add(2n, 4n)],
    [5n, new BitField(1n).add(4n)],
    [1n, new BitField(1n).add(1n)],
  ]).execute();

  new Test(BitField.prototype.remove.name + "(...)", [
    [1n, new BitField(7n).remove(4n, 2n)],
    [8n, new BitField(14n).remove(4n, 2n)],
    [8n, new BitField(14n).remove(4n, 2n, 1n)],
    [14n, new BitField(14n).remove(1n)],
  ]).execute();

  new Test(BitField.prototype.has.name + "(...)", [
    [true, new BitField(1n).has(1n)],
    [true, new BitField(1n).has("1")],
    [false, new BitField(1n).has(2n)],
    [false, new BitField(1n).has("2")],
  ]).execute();

  new Test("bits", [
    [1n, new BitField(1n).bits],
    [2n, new BitField(2n).bits],
    [10n, new BitField(10n).bits],
  ]).execute();
});
