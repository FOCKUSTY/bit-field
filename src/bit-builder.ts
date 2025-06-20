import { DEFAULT_BIT } from "./constants";

import BitField from "./bit-field";

type IObject = { [key: string]: bigint } | { readonly [key: string]: bigint };

class BitBuilder<T extends string> {
  public constructor(public readonly bits: T[] | Readonly<T[]>) {
    bits.every(bit => typeof BigInt(bit) === "bigint");
  }

  public static resolve(bits: IObject): bigint {
    return BitField.summarize(...Object.values(bits));
  }

  /**
   * starts with offset bigint
   * @example
   * input: offset = 10n
   *
   * output: rights = {
   *   someRight1: 1n << 10n,
   *   someRight2: 1n << 11n
   *   ...
   * }
   *
   * @param [exclude=[]] prioritet in filters
   * @example
   * input:
   * exclude = ["someRight1", "someRight2"]
   * include = ["someRight1", "someRight3"]
   *
   * output = {
   *   someRight1: 0n << 0n,
   *   someRight2: 0n << 1n,
   *   someRight3: 1n << 2n
   * }
   */
  public execute(
    offset: bigint | IObject = DEFAULT_BIT,
    exclude: T[] | readonly T[] = [],
    include?: T[] | readonly T[],
  ): Record<T, bigint> {
    return Object.fromEntries(
      this.bits.map((bit, index) => {
        const modifier = this.resolveOffset(offset) + BigInt(index);

        if (include && !include.includes(bit)) return [bit, DEFAULT_BIT << modifier];
        if (exclude.includes(bit)) return [bit, DEFAULT_BIT << modifier];
        
        return [bit, 1n << modifier];
      }),
    ) as Record<T, bigint>;
  }

  public resolve(bits: IObject) {
    return BitBuilder.resolve(bits)
  }

  private resolveOffset(
    offset: bigint | IObject,
  ): bigint {
    if (typeof offset === "bigint") return offset;
    
    const keys = Object.keys(offset);
    if (keys.length === 0) return DEFAULT_BIT;

    return BitField.logarithm2(BitField.max(...keys.map((key) => offset[key]))) + 1n;
  }
}

export { BitBuilder }

export default BitBuilder;
