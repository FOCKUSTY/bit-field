import type { BitFieldInput } from "./types";
import { BINARY_RADIX, ZERO_BIT } from "./constants";
import { BitFieldOperations } from "./bit-field-operations";
import { inspect } from "util";

/**
 * Абстрактный базовый класс для представления битового поля.
 * Предоставляет методы для преобразования в различные форматы и итерации по установленным битам.
 */
export abstract class BitFieldView {
  /** Текущее значение битового поля. */
  protected _bit: bigint;

  /**
   * @param bit - Начальное значение битового поля (по умолчанию 0).
   */
  protected constructor(bit: BitFieldInput = ZERO_BIT) {
    this._bit = BitFieldOperations.toBigInt(bit);
  }

  /**
   * Преобразует битовое поле в массив значений установленных битов (каждое значение – отдельная степень двойки).
   *
   * @returns Массив `bigint`, содержащий значения всех установленных битов.
   */
  public toArray(): bigint[] {
    return [...this];
  }

  /**
   * Выполняет функцию обратного вызова для каждого установленного бита.
   *
   * @param callback - Функция, принимающая значение бита.
   */
  public forEach(callback: (bit: bigint) => void): void {
    for (const bit of this) {
      callback(bit);
    }
  }

  /**
   * Преобразует в строку для `JSON.stringify()`.
   *
   * @returns Десятичное строковое представление числа.
   */
  public toJSON(): string {
    return this.toString();
  }

  /** Возвращает шестнадцатеричную строку (без префикса). */
  public toHexString(): string {
    return this._bit.toString(16);
  }

  /** Возвращает двоичную строку (без префикса). */
  public toBinaryString(): string {
    return this._bit.toString(BINARY_RADIX);
  }

  /** Преобразует в число (может вызвать потерю точности для значений > 2^53). */
  public toNumber(): number {
    return Number(this._bit);
  }

  /** Возвращает десятичное строковое представление. */
  public toString(): string {
    return this._bit.toString();
  }

  /**
   * Реализация итератора по установленным битам (от младшего к старшему).
   *
   * @generator
   * @yields Значение каждого установленного бита в виде `1n << позиция`.
   */
  public *[Symbol.iterator](): Generator<bigint, void, unknown> {
    let bits = this._bit;
    while (BitFieldOperations.notEquals(bits, ZERO_BIT)) {
      const lowest = bits & -bits;
      yield lowest;
      bits ^= lowest;
    }
  }

  /** Кастомное представление для `util.inspect` (Node.js). */
  public [inspect.custom](): bigint {
    return this._bit;
  }
}

export default BitFieldView;
