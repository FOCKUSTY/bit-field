import { DEFAULT_BIT } from "./constants";

import BitField from "./bit-field";

/*   export class Parser {
    public static toBigInt = <
      T extends keyof Rights.Types.All,
    >(
      type: T,
      right: keyof typeof Rights.Constants.AVAILABLE[T]
    ): bigint => {
      return ((Rights.Constants.AVAILABLE[type] as any))[right];
    };

    public static toBigIntFromArray = <
      T extends keyof Rights.Types.All,
    >(
      type: T,
      rights: MustArray<keyof typeof Rights.Constants.AVAILABLE[T]>
    ) =>
      Parser.execute(Object.fromEntries(rights.map(v =>
        [v, Parser.toBigInt(type, v)])));

    public static exist = <
      T extends keyof Rights.Types.All,
      K extends keyof Rights.Types.All[T]
    >(
      type: [T, K],
      right: bigint
    ): boolean => {
      return ((Rights.Constants.DEFAULT[type[0]] as any)[type[1]] & right) === right;
    }

    public static execute<T extends object>(rights: T[keyof T] | T) {
      let raw: bigint = 0n;
      
      Object.keys(rights).forEach(k => {
        if (typeof rights[k] === "bigint")
          raw += rights[k];
        else Object.keys(rights[k]).forEach(k2 => raw += rights[k][k2])
      });

      return raw;
    }
  }; */


class BitBuilder<T extends string> {
  public constructor(public readonly bits: T[] | Readonly<T[]>) {
    bits.every(bit => typeof BigInt(bit) === "bigint");
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
    offset:
      | bigint
      | ({ [key: string]: bigint } | { readonly [key: string]: bigint }) = DEFAULT_BIT,
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

  public resolve(bits: ({ [key: string]: bigint } | { readonly [key: string]: bigint })): bigint {
    return BitField.summarize(...Object.values(bits));
  };

  private resolveOffset(
    offset:
      | bigint
      | ({ [key: string]: bigint } | { readonly [key: string]: bigint }),
  ): bigint {
    if (typeof offset === "bigint") return offset;
    
    const keys = Object.keys(offset);
    if (keys.length === 0) return DEFAULT_BIT;

    return BitField.logarithm2(BitField.max(...keys.map((key) => offset[key]))) + 1n;
  }
}

export { BitBuilder }

export default BitBuilder;
