import type { BitFieldInput, MustArray } from "./types";

import {
  BINARY_PREFIX,
  BINARY_RADIX,
  BINARY_REGULAR_EXPRESSION,
  HEX_PREFIX,
  HEX_REGULAR_EXPRESSION,
  INDEX_OFFSET,
  ONE_BIT,
  ZERO_BIT,
} from "./constants";

import { BitFieldOperations } from "./bit-field-operations";
import { BitFieldView } from "./bit-field-view";

/**
 * Основной класс для работы с битовыми полями.
 * Предоставляет методы для побитовых операций, проверок, установки и сброса битов.
 *
 * @extends BitFieldView
 *
 * @example
 * ```ts
 * const bf = new BitField(0b1010);
 * bf.has(0b1000); // true
 * const bf2 = bf.add(0b0001); // 0b1011
 * ```
 */
export class BitField extends BitFieldView {
  /**
   * Создаёт экземпляр BitField из двоичной строки.
   *
   * @param binaryString - Строка, состоящая только из '0' и '1'.
   * @returns Новый объект BitField.
   * @throws {Error} Если строка содержит недопустимые символы.
   *
   * @example
   * ```ts
   * const bf = BitField.fromBinary('1010');
   * ```
   */
  public static fromBinary(binaryString: string): BitField {
    if (!BINARY_REGULAR_EXPRESSION.test(binaryString)) {
      throw new Error("Invalid binary string");
    }
    return new BitField(BigInt(BINARY_PREFIX + binaryString));
  }

  /**
   * Создаёт экземпляр BitField из шестнадцатеричной строки.
   *
   * @param hexString - Строка, состоящая из символов 0-9, a-f, A-F.
   * @returns Новый объект BitField.
   * @throws {Error} Если строка содержит недопустимые символы.
   *
   * @example
   * ```ts
   * const bf = BitField.fromHex('a');
   * ```
   */
  public static fromHex(hexString: string): BitField {
    if (!HEX_REGULAR_EXPRESSION.test(hexString)) {
      throw new Error("Invalid hex string");
    }
    return new BitField(BigInt(HEX_PREFIX + hexString));
  }

  /**
   * Создаёт новый битовый флаг.
   *
   * @param bit - Начальное значение (число, строка, boolean, bigint или другой BitField). По умолчанию 0.
   */
  public constructor(bit: BitFieldInput = ZERO_BIT) {
    super(BitFieldOperations.toBigInt(bit));
  }

  /** Возвращает текущее значение битового поля как bigint. */
  public get bit(): bigint {
    return this._bit;
  }

  /** Создаёт точную копию текущего экземпляра. */
  public clone(): BitField {
    return new BitField(this._bit);
  }

  /**
   * Создаёт новый BitField с заданным значением (заменяет текущее).
   *
   * @param bit - Новое значение.
   * @returns Новый экземпляр.
   */
  public set(bit: BitFieldInput): BitField {
    return new BitField(BitFieldOperations.toBigInt(bit));
  }

  /**
   * Добавляет (устанавливает) один или несколько битов.
   *
   * @param bits - Биты для добавления (хотя бы один).
   * @returns Новый экземпляр с установленными битами.
   */
  public add(...bits: MustArray<BitFieldInput>): BitField {
    const newBit = BitFieldOperations.summarize(this._bit, ...bits);
    return new BitField(newBit);
  }

  /**
   * Удаляет (сбрасывает) один или несколько битов.
   *
   * @param bits - Биты для удаления (хотя бы один).
   * @returns Новый экземпляр с очищенными битами.
   */
  public remove(...bits: MustArray<BitFieldInput>): BitField {
    const newBit = BitFieldOperations.remove(this._bit, ...bits);
    return new BitField(newBit);
  }

  /** Очищает все биты (устанавливает значение 0). */
  public clear(): BitField {
    return new BitField(ZERO_BIT);
  }

  /**
   * Побитовое И (AND) с заданным битовым значением.
   *
   * @param bit - Операнд.
   * @returns Новый экземпляр, содержащий результат операции.
   */
  public and(bit: BitFieldInput): BitField {
    const mask = BitFieldOperations.toBigInt(bit);
    return new BitField(this._bit & mask);
  }

  /**
   * Побитовое ИЛИ (OR) с заданным битовым значением.
   *
   * @param bit - Операнд.
   * @returns Новый экземпляр, содержащий результат операции.
   */
  public or(bit: BitFieldInput): BitField {
    const mask = BitFieldOperations.toBigInt(bit);
    return new BitField(this._bit | mask);
  }

  /**
   * Побитовое исключающее ИЛИ (XOR) с заданным битовым значением.
   *
   * @param bit - Операнд.
   * @returns Новый экземпляр, содержащий результат операции.
   */
  public xor(bit: BitFieldInput): BitField {
    const mask = BitFieldOperations.toBigInt(bit);
    return new BitField(this._bit ^ mask);
  }

  /**
   * Побитовое НЕ (NOT). Результат ограничивается указанной длиной (или длиной текущего значения).
   *
   * @param bitLength - Количество битов для маскирования (необязательно). По умолчанию — длина текущего значения в двоичной записи.
   * @returns Новый экземпляр с инвертированными битами.
   */
  public not(bitLength?: number): BitField {
    const length = bitLength ?? this._bit.toString(BINARY_RADIX).length;
    const mask = BitFieldOperations.maskOfLength(length);
    return new BitField(~this._bit & mask);
  }

  /**
   * Проверяет равенство текущего значения другому битовому полю.
   *
   * @param bit - Значение для сравнения.
   * @returns `true`, если значения равны.
   */
  public equals(bit: BitFieldInput): boolean {
    const otherBit = BitFieldOperations.toBigInt(bit);
    return BitFieldOperations.equals(this._bit, otherBit);
  }

  /**
   * Проверяет, является ли текущее множество битов подмножеством заданного.
   *
   * @param bit - Множество-надмножество.
   * @returns `true`, если все биты текущего поля присутствуют в `bit`.
   */
  public isSubsetOf(bit: BitFieldInput): boolean {
    const otherBit = BitFieldOperations.toBigInt(bit);
    const intersection = this._bit & otherBit;
    return BitFieldOperations.equals(intersection, this._bit);
  }

  /**
   * Проверяет, установлен ли конкретный бит (или комбинация битов).
   *
   * @param bit - Один бит или маска.
   * @returns `true`, если все биты из `bit` установлены.
   */
  public hasOne(bit: BitFieldInput): boolean {
    const value = BitFieldOperations.toBigInt(bit);
    const mask = this._bit & value;
    return BitFieldOperations.equals(mask, value);
  }

  /**
   * Проверяет, установлен ли хотя бы один из переданных битов.
   *
   * @param bits - Биты для проверки (хотя бы один).
   * @returns `true`, если хотя бы один бит установлен.
   */
  public hasSome(...bits: MustArray<BitFieldInput>): boolean {
    return bits.some((bit) => this.hasOne(bit));
  }

  /**
   * Проверяет, установлены ли все переданные биты.
   *
   * @param bits - Биты для проверки (хотя бы один). Если передан один бит, работает как `hasOne`.
   * @returns `true`, если все указанные биты установлены.
   */
  public has(...bits: MustArray<BitFieldInput>): boolean {
    if (bits.length === 1) {
      return this.hasOne(bits[0]);
    }
    const summary = BitFieldOperations.summarize(...bits);
    const mask = this._bit & summary;
    return BitFieldOperations.equals(mask, summary);
  }

  /**
   * Проверяет, установлены ли все биты в диапазоне позиций (включительно).
   *
   * @param from - Начальная позиция (0 – младший бит).
   * @param to - Конечная позиция.
   * @returns `true`, если все биты от `from` до `to` равны 1.
   */
  public hasRange(from: number, to: number): boolean {
    const mask = this.getRangeMask(from, to);
    const intersection = this._bit & mask;
    return BitFieldOperations.equals(intersection, mask);
  }

  /**
   * Устанавливает все биты в заданном диапазоне (включительно).
   *
   * @param from - Начальная позиция.
   * @param to - Конечная позиция.
   * @returns Новый экземпляр с установленными битами диапазона.
   */
  public setRange(from: number, to: number): BitField {
    const mask = this.getRangeMask(from, to);
    return new BitField(this._bit | mask);
  }

  /**
   * Сбрасывает все биты в заданном диапазоне (включительно).
   *
   * @param from - Начальная позиция.
   * @param to - Конечная позиция.
   * @returns Новый экземпляр с очищенными битами диапазона.
   */
  public clearRange(from: number, to: number): BitField {
    const mask = this.getRangeMask(from, to);
    return new BitField(this._bit & ~mask);
  }

  /**
   * Возвращает значение младшего установленного бита (lowest set bit).
   *
   * @returns Значение в виде `1n << k` или `null`, если битовое поле равно нулю.
   */
  public getLowestSetBit(): bigint | null {
    if (BitFieldOperations.equals(this._bit, ZERO_BIT)) {
      return null;
    }
    return this._bit & -this._bit;
  }

  /**
   * Возвращает значение старшего установленного бита (highest set bit).
   *
   * @returns Значение в виде `1n << (длина-1)` или `null`, если битовое поле равно нулю.
   */
  public getHighestSetBit(): bigint | null {
    if (BitFieldOperations.equals(this._bit, ZERO_BIT)) {
      return null;
    }
    const length = this._bit.toString(BINARY_RADIX).length;
    return ONE_BIT << BigInt(length - INDEX_OFFSET);
  }

  /**
   * Побитовый сдвиг влево.
   *
   * @param bits - Количество позиций для сдвига.
   * @returns Новый экземпляр со сдвинутым значением.
   */
  public shiftLeft(bits: number): BitField {
    return new BitField(this._bit << BigInt(bits));
  }

  /**
   * Побитовый сдвиг вправо (беззнаковый, с заполнением нулями).
   *
   * @param bits - Количество позиций для сдвига.
   * @returns Новый экземпляр со сдвинутым значением.
   */
  public shiftRight(bits: number): BitField {
    return new BitField(this._bit >> BigInt(bits));
  }

  /**
   * Генерирует битовую маску для диапазона позиций.
   *
   * @param from - Начальная позиция (включительно).
   * @param to - Конечная позиция (включительно).
   * @returns Маска, где биты с `from` по `to` равны 1.
   * @throws {Error} Если `from > to`.
   */
  private getRangeMask(from: number, to: number): bigint {
    if (from > to) {
      throw new Error("Invalid range: from must be <= to");
    }
    const length = to - from + 1;
    return BitFieldOperations.maskRange(from, length);
  }
}

export default BitField;
