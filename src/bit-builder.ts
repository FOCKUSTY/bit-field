import { DEFAULT_BIT } from "./constants";
import BitField from "./bit-field";

/**
 * Объект с именованными битовыми значениями.
 */
type IObject = { [key: string]: bigint } | { readonly [key: string]: bigint };

/**
 * Генерирует набор битовых значений для списка имён с возможностью управления смещениями.
 *
 * @typeParam T - Тип (строковое литералы) имён битов
 */
export class BitBuilder<T extends string> {
  /**
   * @param bits - Массив имён будущих битов
   */
  public constructor(public readonly bits: T[] | Readonly<T[]>) {}

  /**
   * Статический метод для суммирования объекта битов.
   *
   * @param bits - Объект с именованными битами
   * @returns Объединённое битовое значение
   */
  public static resolve(bits: IObject): bigint {
    return BitField.summarize(...Object.values(bits));
  }

  /**
   * Генерирует объект с битовыми значениями для каждого имени из `bits`,
   * применяя смещение и фильтры исключения/включения.
   *
   * @param offset - Начальное смещение (число BigInt) или объект ранее сгенерированных битов.
   *                 Если передан объект, следующее свободное смещение вычисляется как
   *                 `max(значения) + 1`.
   * @param exclude - Массив имён, которые должны получить нулевое значение.
   * @param include - Если указан, только эти имена получат ненулевые значения (остальные — 0).
   * @returns Объект вида `{ [имя]: битовое значение }`
   *
   * @example
   * ```ts
   * const builder = new BitBuilder(['READ', 'WRITE']);
   * builder.execute(10n);
   * // { READ: 1n << 10n, WRITE: 1n << 11n }
   *
   * // с объектом в качестве смещения
   * const first = builder.execute();
   * const second = new BitBuilder(['EXECUTE']).execute(first);
   * // EXECUTE получит следующий свободный бит
   * ```
   */
  public execute(
    offset: bigint | IObject = DEFAULT_BIT,
    exclude: T[] | readonly T[] = [],
    include?: T[] | readonly T[],
  ): Record<T, bigint> {
    return Object.fromEntries(
      this.bits.map((bit, index) => {
        const modifier = this.resolveOffset(offset) + BigInt(index);

        if (include && !include.includes(bit))
          return [bit, DEFAULT_BIT << modifier];
        if (exclude.includes(bit)) return [bit, DEFAULT_BIT << modifier];

        return [bit, 1n << modifier];
      }),
    ) as Record<T, bigint>;
  }

  /**
   * Экземплярный метод для суммирования объекта битов.
   *
   * @param bits - Объект с именованными битами
   * @returns Объединённое битовое значение
   */
  public resolve(bits: IObject) {
    return BitBuilder.resolve(bits);
  }

  /**
   * Вычисляет итоговое смещение: если передан объект, возвращает следующий свободный бит,
   * иначе возвращает само смещение.
   *
   * @param offset - Смещение (число или объект)
   * @returns Число BigInt — смещение для первого бита
   * @internal
   */
  private resolveOffset(offset: bigint | IObject): bigint {
    if (typeof offset === "bigint") return offset;

    const keys = Object.keys(offset);
    if (keys.length === 0) return DEFAULT_BIT;

    return (
      BitField.logarithm2(BitField.max(...keys.map((key) => offset[key]))) + 1n
    );
  }
}

export default BitBuilder;