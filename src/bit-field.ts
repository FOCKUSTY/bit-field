import type { ArrayOrType, Bit } from "./types";
import { DEFAULT_BIT } from "./constants";

class BitField {
  /**
   * compares two values
   * 
   * @example
   * ```ts
   * BitField.equals(1n, 1n)  // true
   * BitField.equals(1n, "1") // true
   * BitField.equals(1n, 2n)  // false
   * BitField.equals(1n, "2") // false
   * ```
   */
  public static equals(first: Bit, second: Bit): boolean {
    return BigInt(first) === BigInt(second);
  }

  /**
   * summurize values
   * 
   * @example
   * ```ts
   * BitField.summarize([1n, 2n, 4n]) // 7n
   * BitField.summarize([2n, 2n, 4n]) // 6n
   * BitField.summarize([1n, 4n]) // 5n
   * BitField.summarize([1n, 1n]) // 1n
   * BitField.summarize(1n) // 1n
   * ```
   */
  public static summarize(bits: ArrayOrType<Bit>): bigint {
    if (!Array.isArray(bits)) return BigInt(bits);

    let summ = DEFAULT_BIT;
    bits.forEach(b => summ |= BigInt(b));
    return summ;
  }

  /**
   * summurize values
   * 
   * @example
   * ```ts
   * BitField.add(1n, [2n, 4n]) // 7n
   * BitField.add(2n, [2n, 4n]) // 6n
   * BitField.add(1n, 4n) // 5n
   * BitField.add(1n, 1n) // 1n
   * ```
   * 
   * @equals `BitField.add(1n, 2n)` === `Bitiield.summarize([1n, 2n...])`
   */
  public static add(bit: Bit, add: ArrayOrType<Bit>): bigint {
    return BigInt(bit) | BitField.summarize(add);
  }
  
  /**
   * subtract values
   * 
   * @example
   * ```ts
   * BitField.remove(7n, [4n, 2n]) // 1n
   * BitField.remove(14n, [4n, 2n]) // 8n
   * BitField.remove(14n, [4n, 2n, 1n]) // 8n
   * BitField.remove(14n, [1n]) // 14n
   * ```
   */
  public static remove(bit: Bit, remove: ArrayOrType<Bit>): bigint {
    return BigInt(bit) &~ BitField.summarize(remove);
  }

  /**
   * takes the logarithm of a number
   * 
   * @example
   * ```ts
   * BitField.logarithm2(1n << 10n) // 10n
   * BitField.logarithm2(1n << MULTIPLIER) // MULTIPLIER
   * BitField.logarithm2(2n << 10n) // 11n
   * BitField.logarithm2(4n << 10n) // 12n
   * ```
   */
  public static logarithm2(bigint: Bit): bigint {
    return BigInt(BigInt(bigint).toString(2).length - 1);
  }

  /**
   * takes max value of values
   * 
   * @example
   * ```ts
   * BitField.max(1n, 2n, 3n, 4n) // 4n
   * ``` 
   */
  public static max(...values: Bit[]): bigint {
    return BigInt(values
      .toSorted((a, b) => {
        const data = <const>[BigInt(a), BigInt(b)];

        return data[0] > data[1]
          ? 1 : data[0] < data[1]
            ? -1 : 0;
      }).toReversed()[0]);
  }
  
  public constructor(
    public readonly bits: Bit = DEFAULT_BIT
  ) {
    this.bits = BigInt(bits);
  }

  /**
   * summurize values
   * 
   * @example
   * ```ts
   * new BitField(1n).add([2n, 4n]) // 7n
   * new BitField(2n).add([2n, 4n]) // 6n
   * new BitField(1n).add(4n) // 5n
   * new BitField(1n).add(1n) // 1n
   * ```
   * 
   * @equals `new BitField(1n).add(2n)` === `Bitiield.summarize([1n, 2n...])`
   */
  public add(bits: ArrayOrType<Bit>): bigint {
    return BitField.add(this.bits, bits);
  }

  /**
   * subtract values
   * 
   * @example
   * ```ts
   * new BitField(7n).remove([4n, 2n]) // 1n
   * new BitField(14n).remove([4n, 2n]) // 8n
   * new BitField(14n).remove([4n, 2n, 1n]) // 8n
   * new BitField(14n).remove([1n]) // 14n
   * ```
   */
  public remove(bits: ArrayOrType<Bit>): bigint {
    return BitField.remove(this.bits, bits);
  }

  /**
   * checking bits equals
   * 
   * @example
   * ```ts
   * new BitField(1n).has(1n)  // true
   * new BitField(1n).has("1") // true
   * new BitField(1n).has(2n)  // false
   * new BitField(1n).has("2") // false
   * ```
   * 
   * @equals `new BitField(1n).has(2n)` === `BitField.equals(1n, 2n)`
   */
  public has(bit: ArrayOrType<Bit>): boolean {
    return BitField.equals(
      this.bits,
      BitField.summarize(bit)
    );
  }
};

export { BitField };

export default BitField;