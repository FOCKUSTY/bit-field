import type { ArrayOrType, Bit } from "./types";
import { DEFAULT_BIT } from "./constants";

/**
 * Утилитный класс для выполнения операций над битовыми полями.
 * Все методы работают с BigInt, но принимают также number, string и boolean.
 */
export class BitField {
  /**
   * Сравнивает два битовых значения на равенство.
   *
   * @param first - Первое значение
   * @param second - Второе значение
   * @returns `true`, если значения равны после приведения к BigInt
   *
   * @example
   * ```ts
   * BitField.equals(1n, 1n)  // true
   * BitField.equals(1n, "1") // true
   * BitField.equals(1n, 2n)  // false
   * ```
   */
  public static equals(first: Bit, second: Bit): boolean {
    return BigInt(first) === BigInt(second);
  }

  /**
   * Выполняет побитовое ИЛИ над всеми переданными значениями.
   *
   * @param bits - Одно или несколько значений
   * @returns Результат побитового ИЛИ
   *
   * @example
   * ```ts
   * BitField.summarize(1n, 2n, 4n) // 7n
   * BitField.summarize(2n, 2n, 4n) // 6n
   * ```
   */
  public static summarize(...bits: Bit[]): bigint {
    if (!Array.isArray(bits)) return BigInt(bits);

    let summ = DEFAULT_BIT;
    bits.forEach((b) => (summ |= BigInt(b)));
    return summ;
  }

  /**
   * Добавляет биты к указанному значению (псевдоним для `summarize` с обязательным первым аргументом).
   *
   * @param bit - Базовое значение
   * @param add - Добавляемые биты
   * @returns Результат побитового ИЛИ `bit` и всех `add`
   *
   * @example
   * ```ts
   * BitField.add(1n, 2n, 4n) // 7n
   * ```
   */
  public static add(bit: Bit, ...add: Bit[]): bigint {
    return BigInt(bit) | BitField.summarize(...add);
  }

  /**
   * Удаляет указанные биты из значения (сбрасывает соответствующие биты).
   *
   * @param bit - Исходное значение
   * @param remove - Биты, которые нужно сбросить
   * @returns Новое значение с удалёнными битами
   *
   * @example
   * ```ts
   * BitField.remove(7n, 4n, 2n) // 1n
   * BitField.remove(14n, 4n, 2n) // 8n
   * ```
   */
  public static remove(bit: Bit, ...remove: Bit[]): bigint {
    return BigInt(bit) & ~BitField.summarize(...remove);
  }

  /**
   * Возвращает целую часть двоичного логарифма числа (индекс старшего установленного бита).
   *
   * @param bigint - Значение
   * @returns Индекс старшего бита (начиная с 0)
   *
   * @example
   * ```ts
   * BitField.logarithm2(1n << 10n) // 10n
   * BitField.logarithm2(2n << 10n) // 11n
   * ```
   */
  public static logarithm2(bigint: Bit): bigint {
    return BigInt(BigInt(bigint).toString(2).length - 1);
  }

  /**
   * Возвращает максимальное значение из переданных.
   *
   * @param values - Список значений
   * @returns Наибольшее BigInt
   *
   * @example
   * ```ts
   * BitField.max(1n, 2n, 3n, 4n) // 4n
   * ```
   */
  public static max(...values: Bit[]): bigint {
    return BigInt(
      [...values]
        .sort((a: Bit, b: Bit) => {
          const data = <const>[BigInt(a), BigInt(b)];
          return data[0] > data[1] ? 1 : data[0] < data[1] ? -1 : 0;
        })
        .reverse()[0],
    );
  }

  /**
   * Создаёт экземпляр битового поля с начальным значением.
   *
   * @param bits - Начальное значение (по умолчанию 0n)
   */
  public constructor(public readonly bits: Bit = DEFAULT_BIT) {
    this.bits = BigInt(bits);
  }

  /**
   * Добавляет биты к текущему значению и возвращает новое.
   *
   * @param bits - Добавляемые биты
   * @returns Новое значение (исходный объект не изменяется)
   *
   * @example
   * ```ts
   * new BitField(1n).add(2n, 4n) // 7n
   * ```
   */
  public add(...bits: Bit[]): bigint {
    return BitField.add(this.bits, ...bits);
  }

  /**
   * Удаляет биты из текущего значения и возвращает новое.
   *
   * @param bits - Удаляемые биты
   * @returns Новое значение (исходный объект не изменяется)
   *
   * @example
   * ```ts
   * new BitField(7n).remove(4n, 2n) // 1n
   * ```
   */
  public remove(...bits: Bit[]): bigint {
    return BitField.remove(this.bits, ...bits);
  }

  /**
   * Проверяет, равно ли текущее значение побитовому ИЛИ переданных битов.
   *
   * @param bits - Проверяемые биты
   * @returns `true`, если текущее значение в точности равно комбинации битов
   *
   * @example
   * ```ts
   * new BitField(1n).has(1n)  // true
   * new BitField(1n).has(2n)  // false
   * ```
   */
  public has(...bits: Bit[]): boolean {
    return BitField.equals(this.bits, BitField.summarize(...bits));
  }
}

export default BitField;