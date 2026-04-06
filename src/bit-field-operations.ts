import type { BitFieldInput } from "./types";
import { BINARY_RADIX, INDEX_OFFSET, ONE_BIT, ZERO_BIT } from "./constants";

/**
 * Набор статических утилит для работы с битовыми полями (преобразование, сравнение, маски, логарифм и т.д.).
 */
export class BitFieldOperations {
  /**
   * Преобразует входное значение в `bigint`.
   *
   * @param bit - Значение (число, строка, boolean, bigint или объект BitField).
   * @returns Эквивалент в виде `bigint`.
   */
  public static toBigInt(bit: BitFieldInput): bigint {
    if (typeof bit === "object" && bit !== null && "bit" in bit) {
      return bit.bit;
    }
    return BigInt(bit);
  }

  /**
   * Сравнивает два битовых значения на равенство.
   *
   * @param first - Первое значение.
   * @param second - Второе значение.
   * @returns `true`, если значения равны.
   */
  public static equals(first: BitFieldInput, second: BitFieldInput): boolean {
    return this.toBigInt(first) === this.toBigInt(second);
  }

  /**
   * Сравнивает два битовых значения на неравенство.
   *
   * @param first - Первое значение.
   * @param second - Второе значение.
   * @returns `true`, если значения не равны.
   */
  public static notEquals(
    first: BitFieldInput,
    second: BitFieldInput,
  ): boolean {
    return !this.equals(first, second);
  }

  /**
   * Вычисляет побитовое ИЛИ (OR) для всех переданных значений.
   *
   * @param bits - Произвольное количество битовых значений.
   * @returns Результат побитового ИЛИ.
   */
  public static summarize(...bits: BitFieldInput[]): bigint {
    let summary: bigint = ZERO_BIT;
    for (const bit of bits) {
      summary |= this.toBigInt(bit);
    }
    return summary;
  }

  /**
   * Добавляет (устанавливает) биты: `bit | OR(добавляемые)`.
   *
   * @param bit - Исходное значение.
   * @param add - Биты для добавления.
   * @returns Новое значение с установленными битами.
   */
  public static add(bit: BitFieldInput, ...add: BitFieldInput[]): bigint {
    return this.toBigInt(bit) | this.summarize(...add);
  }

  /**
   * Удаляет (сбрасывает) биты: `bit & ~OR(удаляемые)`.
   *
   * @param bit - Исходное значение.
   * @param remove - Биты для удаления.
   * @returns Новое значение с очищенными битами.
   */
  public static remove(bit: BitFieldInput, ...remove: BitFieldInput[]): bigint {
    return this.toBigInt(bit) & ~this.summarize(...remove);
  }

  /**
   * Вычисляет двоичный логарифм (floor(log2(x))) для положительного целого.
   *
   * @param bit - Значение, большее нуля.
   * @returns Позиция старшего установленного бита (0-индексация).
   * @throws {Error} Если передан 0.
   */
  public static logarithm2(bit: BitFieldInput): bigint {
    const value = this.toBigInt(bit);
    if (value === ZERO_BIT) {
      throw new Error("logarithm2(0) is undefined");
    }
    const bitLength = value.toString(BINARY_RADIX).length;
    return BigInt(bitLength - INDEX_OFFSET);
  }

  /**
   * Находит максимальное значение среди переданных битовых полей.
   *
   * @param bits - Произвольное количество значений.
   * @returns Наибольшее значение.
   */
  public static max(...bits: BitFieldInput[]): bigint {
    let max: bigint = ZERO_BIT;
    for (const bit of bits) {
      const value = this.toBigInt(bit);
      if (value > max) {
        max = value;
      }
    }
    return max;
  }

  /**
   * Создаёт битовую маску заданной длины (младшие биты равны 1).
   *
   * @param bits - Количество битов в маске.
   * @returns Маска, где `bits` младших битов установлены в 1. Если `bits <= 0`, возвращает 0.
   */
  public static maskOfLength(bits: number): bigint {
    if (bits <= 0) {
      return ZERO_BIT;
    }
    return (ONE_BIT << BigInt(bits)) - ONE_BIT;
  }

  /**
   * Создаёт битовую маску для диапазона, начиная с позиции `from` длиной `length`.
   *
   * @param from - Начальная позиция (0 – младший бит).
   * @param length - Количество битов в маске.
   * @returns Маска, где биты с `from` по `from+length-1` установлены в 1.
   */
  public static maskRange(from: number, length: number): bigint {
    if (length <= 0) {
      return ZERO_BIT;
    }
    return this.maskOfLength(length) << BigInt(from);
  }

  private constructor() {}
}

export default BitFieldOperations;
