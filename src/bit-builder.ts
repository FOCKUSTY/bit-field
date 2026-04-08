import type { BigIntRecord, BuilderBitData, MaybeReadonly } from "./types";

import { ONE_BIT, ZERO_BIT } from "./constants";
import { BitFieldOperations } from "./bit-field-operations";

/**
 * Генерирует набор битовых значений для списка имён с автоматическим смещением.
 *
 * @template T - Строковые литералы имён битов (например, `'READ' | 'WRITE'`).
 *
 * @example
 * ```ts
 * const builder = new BitBuilder(['READ', 'WRITE']);
 * const bits = builder.execute(); // { READ: 1n << 0n, WRITE: 1n << 1n }
 * ```
 */
export class BitBuilder<const T extends string> {
  /**
   * @param bits - Массив имён битов в порядке их следования.
   */
  public constructor(public readonly bits: MaybeReadonly<T[]>) {}

  /**
   * Объединяет объект именованных битов в одно число (побитовое ИЛИ).
   *
   * @param bits - Объект, где значения — битовые флаги.
   * @returns Результат побитового ИЛИ всех переданных значений.
   *
   * @example
   * ```ts
   * const flags = { READ: 1n, WRITE: 2n };
   * const combined = BitBuilder.resolve(flags); // 3n
   * ```
   */
  public static resolve(bits: BigIntRecord): bigint {
    return BitFieldOperations.summarize(...Object.values(bits));
  }

  /**
   * Генерирует объект с битовыми значениями для каждого имени из `bits`.
   *
   * @param data - Настройки генерации (необязательно).
   * @param data.offset - Начальное смещение (число) или объект ранее сгенерированных битов.
   *                      При передаче объекта следующий свободный бит вычисляется как
   *                      `log2(max(значения)) + 1`. По умолчанию `0n`.
   * @param data.exclude - Имена, которые получат нулевое значение (имеют приоритет над `include`).
   * @param data.include - Если указан, только эти имена получат ненулевые значения.
   * @returns Объект с битовыми значениями для каждого имени.
   *
   * @example
   * ```ts
   * const builder = new BitBuilder(['READ', 'WRITE']);
   * builder.execute({ offset: 10n });        // { READ: 1n<<10n, WRITE: 1n<<11n }
   *
   * const first = builder.execute();         // { READ: 1n<<0n, WRITE: 1n<<1n }
   * const second = new BitBuilder(['EXECUTE']).execute({ offset: first }); // { EXECUTE: 1n<<2n }
   * ```
   */
  public execute(data?: Partial<BuilderBitData<T>>): Record<T, bigint> {
    const bits = this.bits.map((bit, index) => {
      const computedBit = this.computeBit({
        bit,
        index,
        offset: ZERO_BIT,
        exclude: [],
        ...(data || {}),
      });

      return [bit, computedBit];
    });

    return Object.fromEntries(bits);
  }

  /**
   * Экземплярный вариант статического метода `resolve`.
   *
   * @param bits - Объект с битовыми значениями.
   * @returns Побитовое ИЛИ всех значений.
   */
  public resolve(bits: BigIntRecord): bigint {
    return BitBuilder.resolve(bits);
  }

  /**
   * Вычисляет значение для одного бита с учётом смещения, исключений и включений.
   *
   * @param params - Параметры вычисления.
   * @returns Битовое значение (0 или 1 сдвинутое на нужную позицию).
   */
  private computeBit({
    bit,
    exclude,
    index,
    offset,
    include,
  }: {
    bit: T;
    index: number;
  } & BuilderBitData<T>): bigint {
    const modifier = this.resolveOffset(offset) + BigInt(index);
    const excluded = exclude.includes(bit);
    const included = (() => {
      if (include) {
        return include.includes(bit);
      }
      return true;
    })();

    if (excluded || !included) {
      return ZERO_BIT << modifier;
    }
    return ONE_BIT << modifier;
  }

  /**
   * Вычисляет итоговое смещение для первого бита.
   *
   * @param offset - Число (BigInt) или объект ранее сгенерированных битов.
   * @returns Смещение как BigInt.
   */
  private resolveOffset(offset: bigint | BigIntRecord): bigint {
    if (typeof offset === "bigint") {
      return offset;
    }

    const keys = Object.keys(offset);
    if (keys.length === 0) {
      return ZERO_BIT;
    }

    const bits = keys.map((key) => offset[key]);
    const maxBit = BitFieldOperations.max(...bits);
    if (maxBit === ZERO_BIT) {
      return ZERO_BIT;
    }
    return BitFieldOperations.logarithm2(maxBit) + ONE_BIT;
  }
}

export default BitBuilder;
