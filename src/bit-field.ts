import type { ArrayOrType, Bit } from "./types";
import { DEFAULT_BIT } from "./constants";

class BitField {
  public static equals(first: Bit, second: Bit): boolean {
    return BigInt(first) === BigInt(second);
  }

  public static add(bit: Bit, add: ArrayOrType<Bit>): bigint {
    return BigInt(bit) | BitField.summarize(add);
  }
  
  public static remove(bit: Bit, remove: ArrayOrType<Bit>): bigint {
    return BigInt(bit) &~ BitField.summarize(remove);
  }

  public static logarithm2(bigint: Bit): bigint {
    return BigInt(BigInt(bigint).toString(2).length - 1);
  }

  public static max(...values: Bit[]): bigint {
    return BigInt(values
      .toSorted((a, b) => {
        const data = <const>[BigInt(a), BigInt(b)];

        return data[0] > data[1]
          ? 1 : data[0] < data[1]
            ? -1 : 0;
      }).toReversed()[0]);
  }

  public static summarize(bits: ArrayOrType<Bit>): bigint {
    if (!Array.isArray(bits)) return BigInt(bits);

    let summ = DEFAULT_BIT;
    bits.forEach(b => summ |= BigInt(b));
    return summ;
  }
  
  public constructor(
    public readonly bits: Bit = DEFAULT_BIT
  ) {
    this.bits = BigInt(bits);
  }

  public add(bits: ArrayOrType<Bit>): bigint {
    return BitField.add(this.bits, bits);
  }

  public remove(bits: ArrayOrType<Bit>): bigint {
    return BitField.remove(this.bits, bits);
  }

  public has(bit: ArrayOrType<Bit>): boolean {
    return BitField.equals(
      this.bits,
      BitField.summarize(bit)
    );
  }
};

export { BitField };

export default BitField;